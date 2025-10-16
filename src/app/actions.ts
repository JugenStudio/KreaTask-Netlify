
'use server';

import { summarizeTaskComments } from '@/ai/flows/summarize-task-comments';
import { askKreaBot } from '@/ai/flows/kreatask-bot-flow';
import { translateContent } from '@/ai/flows/translate-content-flow';
import { getTaskSuggestion } from '@/ai/flows/generate-tasks-flow';
import { z } from 'zod';
import type { Task, User, Notification, LocalizedString, Subtask, File as FileType } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/db/client';
import * as schema from '@/db/schema';
import { eq, inArray, and, desc, lt, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { isEmployee } from '@/lib/roles';
import { subMonths } from 'date-fns';

import '@/env'; // This is safe to import here as this file is server-only.

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

// ---- NEW DATA FETCHING ACTIONS ----
export async function getInitialDashboardData(userId: string) {
    const db = getDb();
    
    // Fetch current user data
    const currentUser = await db.query.users.findFirst({
        where: eq(schema.users.id, userId),
    });

    if (!currentUser) {
        // This case should ideally not happen if the user is authenticated
        throw new Error("User not found.");
    }

    // Fetch all users if director/admin, otherwise just the current user
    let users: User[];
    if (isEmployee(currentUser.role)) {
        users = [currentUser];
    } else {
        users = await db.query.users.findMany() as User[];
    }

    // Fetch tasks based on user role. We fetch all and filter in memory for simplicity,
    // but this could be optimized with more complex queries if performance becomes an issue.
    const allDbTasks = await db.query.tasks.findMany({
      with: {
        assignees: { with: { user: true } },
        subtasks: true,
        files: true,
        comments: { with: { author: true } },
        revisions: { with: { author: true } },
      },
      orderBy: desc(schema.tasks.createdAt),
    });

    const tasks: Task[] = allDbTasks.map(t => ({
      ...t,
      assignees: t.assignees.map(a => a.user),
    })) as Task[];

    // Fetch notifications for the current user
    const notifications = await db.query.notifications.findMany({
        where: eq(schema.notifications.userId, userId),
        orderBy: desc(schema.notifications.createdAt),
    });

    return {
        currentUser: currentUser as User,
        users,
        allTasks: tasks,
        notifications: notifications as Notification[],
    };
}


// --- DATABASE CRUD ACTIONS (EXISTING) ---

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
            // This is a full replacement, which is what the original logic did.
            // For appending, we'd need a different approach.
            await tx.delete(schema.comments).where(eq(schema.comments.taskId, taskId));
            if (commentItems.length > 0) {
                await tx.insert(schema.comments).values(commentItems.map(c => {
                    const { author, ...restOfComment } = c;
                    return { ...restOfComment, authorId: author.id, taskId };
                }));
            }
        }
        
         if (revisions && revisions.length > 0) {
            // Find the new revision (assuming it's the last one)
            const existingRevisionIds = (await tx.query.revisions.findMany({ where: eq(schema.revisions.taskId, taskId) })).map(r => r.id);
            const newRevision = revisions.find(r => !existingRevisionIds.includes(r.id));
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


/**
 * Server action to clean up old data from the database.
 * This is a destructive operation and should be triggered manually by an admin.
 * - Deletes notifications older than 3 months that have been read.
 * - Deletes tasks older than 3 months that have been 'Completed'.
 */
export async function cleanupOldData() {
  const db = getDb();
  const threeMonthsAgo = subMonths(new Date(), 3);

  try {
    const deletedNotificationsResult = await db.delete(schema.notifications)
      .where(and(
        eq(schema.notifications.read, true),
        lt(schema.notifications.createdAt, threeMonthsAgo)
      ))
      .returning({ id: schema.notifications.id });

    const deletedTasksResult = await db.delete(schema.tasks)
      .where(and(
        eq(schema.tasks.status, 'Completed'),
        lt(schema.tasks.updatedAt, threeMonthsAgo)
      ))
      .returning({ id: schema.tasks.id });

    const message = `Cleanup complete. Deleted ${deletedNotificationsResult.length} notifications and ${deletedTasksResult.length} tasks.`;
    console.log(message);

    revalidatePath('/'); // Revalidate all paths to reflect the changes

    return { success: true, message };
  } catch (error) {
    console.error("Data cleanup failed:", error);
    return { success: false, message: "An error occurred during data cleanup." };
  }
}
