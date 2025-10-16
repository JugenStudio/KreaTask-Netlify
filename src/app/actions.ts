
'use server';

import { summarizeTaskComments } from '@/ai/flows/summarize-task-comments';
import { askKreaBot } from '@/ai/flows/kreatask-bot-flow';
import { translateContent } from '@/ai/flows/translate-content-flow';
import { getTaskSuggestion } from '@/ai/flows/generate-tasks-flow';
import { z } from 'zod';
import type { Task, User, Notification, LocalizedString, Subtask, File as FileType } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import '@/env';

// Helper function to get database instance
const getDb = () => {
    const sql = neon(process.env.DATABASE_URL!);
    return drizzle(sql, { schema });
};


const SummarizeSchema = z.object({
  commentThread: z.string(),
});

export async function getSummary(formData: FormData) {
  try {
    const validatedData = SummarizeSchema.parse({
      commentThread: formData.get('commentThread'),
    });

    const companyPolicy =
      'Summaries should be concise, professional, and focus on decisions and action items. Avoid informal language.';

    const result = await summarizeTaskComments({
      commentThread: validatedData.commentThread,
      companyPolicy,
    });

    return { summary: result.summary, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { summary: null, error: 'Invalid input.' };
    }
    return { summary: null, error: 'Failed to generate summary.' };
  }
}

const KreaBotSchema = z.object({
  query: z.string(),
  tasks: z.string(),
  users: z.string(),
});

export async function getKreaBotResponse(
  query: string,
  tasks: Task[],
  users: User[]
) {
  try {
    const result = await askKreaBot({
      query,
      tasks,
      users,
    });

    return { response: result.response, error: null };
  } catch (error) {
    console.error('KreaBot action error:', error);
    return {
      response: null,
      error: 'Sorry, I encountered an error. Please try again.',
    };
  }
}

// Define Zod schemas for validation
const TranslateContentInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
});
export type TranslateContentInput = z.infer<typeof TranslateContentInputSchema>;

const TranslateContentOutputSchema = z.object({
  en: z.string().describe('The English translation.'),
  id: z.string().describe('The Indonesian translation.'),
});
export type TranslateContentOutput = z.infer<
  typeof TranslateContentOutputSchema
>;

export async function getTranslations(
  text: string
): Promise<{ data: TranslateContentOutput | null; error: string | null }> {
  try {
    const validatedData = TranslateContentInputSchema.parse({ text });
    const result = await translateContent(validatedData);
    return { data: result, error: null };
  } catch (error) {
    console.error('Translation action error:', error);
    if (error instanceof z.ZodError) {
      return { data: null, error: 'Invalid text provided for translation.' };
    }
    return {
      data: null,
      error: "Sorry, I couldn't translate the content right now.",
    };
  }
}

// Re-added for AI Task Suggestion
export async function getTaskFromAI(idea: string, users: User[]) {
  if (!idea.trim()) {
    return { suggestion: null, error: 'Please provide an idea.' };
  }
  try {
    const result = await getTaskSuggestion({
      idea,
      users,
    });
    return { suggestion: result, error: null };
  } catch (e: any) {
    console.error('Error getting task from AI:', e);
    // Return a generic error key to be translated on the client
    return { suggestion: null, error: 'submit.toast.ai_error_generic' };
  }
}

// Database Actions
export async function createNewTask(taskData: Omit<Task, 'id' | 'createdAt' | 'revisions' | 'comments'>) {
    const db = getDb();
    const newTaskId = `task-${uuidv4()}`;

    const { assignees, subtasks: subtaskItems, files: fileItems, ...restOfTask } = taskData;
    
    await db.transaction(async (tx) => {
        await tx.insert(schema.tasks).values({
            id: newTaskId,
            ...restOfTask,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        
        if (assignees && assignees.length > 0) {
            await tx.insert(schema.tasksToUsers).values(assignees.map(user => ({
                taskId: newTaskId,
                userId: user.id,
            })));
        }
        if (subtaskItems && subtaskItems.length > 0) {
            await tx.insert(schema.subtasks).values(subtaskItems.map(st => ({ ...st, id: `subtask-${uuidv4()}`, taskId: newTaskId })));
        }
        if (fileItems && fileItems.length > 0) {
            await tx.insert(schema.files).values(fileItems.map(f => ({ ...f, id: `file-${uuidv4()}`, taskId: newTaskId })));
        }
    });
    
    revalidatePath('/tasks');
    revalidatePath('/dashboard');
    return { id: newTaskId, title: taskData.title };
}

export async function updateTaskAction(taskId: string, updates: Partial<Task>) {
    const db = getDb();
    const { assignees, subtasks: subtaskItems, files: fileItems, comments: commentItems, revisions, ...restOfUpdates } = updates;

    await db.transaction(async (tx) => {
        if (Object.keys(restOfUpdates).length > 0) {
            await tx.update(schema.tasks).set({ ...restOfUpdates, updatedAt: new Date() }).where(eq(schema.tasks.id, taskId));
        }

        if (assignees) {
            await tx.delete(schema.tasksToUsers).where(eq(schema.tasksToUsers.taskId, taskId));
            if (assignees.length > 0) {
                await tx.insert(schema.tasksToUsers).values(assignees.map(user => ({ taskId, userId: user.id })));
            }
        }
        
        if (subtaskItems) {
            await tx.delete(schema.subtasks).where(eq(schema.subtasks.taskId, taskId));
            if (subtaskItems.length > 0) {
                await tx.insert(schema.subtasks).values(subtaskItems.map(st => ({...st, taskId})));
            }
        }

        if (fileItems) {
            await tx.delete(schema.files).where(eq(schema.files.taskId, taskId));
            if (fileItems.length > 0) {
                await tx.insert(schema.files).values(fileItems.map(f => ({...f, taskId})));
            }
        }

        if (commentItems) {
            await tx.delete(schema.comments).where(eq(schema.comments.taskId, taskId));
            if (commentItems.length > 0) {
                await tx.insert(schema.comments).values(commentItems.map(c => ({...c, authorId: c.author.id, taskId })));
            }
        }
        
         if (revisions) {
            const newRevision = revisions[revisions.length - 1];
            if (newRevision) {
                await tx.insert(schema.revisions).values({
                    id: newRevision.id,
                    timestamp: new Date(newRevision.timestamp),
                    change: newRevision.change,
                    authorId: newRevision.author.id,
                    taskId: taskId,
                });
            }
        }
    });

    revalidatePath(`/tasks/${taskId}`);
    revalidatePath('/tasks');
    revalidatePath('/dashboard');
    revalidatePath('/performance-report');
}


export async function deleteTaskAction(taskId: string) {
    const db = getDb();
    await db.delete(schema.tasks).where(eq(schema.tasks.id, taskId));
    revalidatePath('/tasks');
    revalidatePath('/dashboard');
}

export async function createNotificationAction(notificationData: Partial<Notification>) {
    const db = getDb();
    await db.insert(schema.notifications).values({ id: `notif-${uuidv4()}`, ...notificationData } as any);
    revalidatePath('/dashboard');
}

export async function updateUserAction(userId: string, data: Partial<User>) {
    const db = getDb();
    await db.update(schema.users).set({ ...data, updatedAt: new Date() }).where(eq(schema.users.id, userId));
    revalidatePath('/settings');
}

export async function deleteUserAction(userId: string) {
    const db = getDb();
    await db.delete(schema.users).where(eq(schema.users.id, userId));
    revalidatePath('/settings');
}

export async function updateNotificationsAction(notificationsToUpdate: Notification[]) {
    const db = getDb();
    await db.transaction(async (tx) => {
        for (const notif of notificationsToUpdate) {
            await tx.update(schema.notifications)
              .set({ read: notif.read })
              .where(eq(schema.notifications.id, notif.id));
        }
    });
    revalidatePath('/dashboard'); // To update unread count in header
}

export async function clearAllNotificationsAction(userId: string) {
    const db = getDb();
    await db.delete(schema.notifications).where(eq(schema.notifications.userId, userId));
    revalidatePath('/dashboard');
}
    