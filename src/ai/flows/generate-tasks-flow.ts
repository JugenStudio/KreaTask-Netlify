
'use server';
/**
 * @fileOverview An AI assistant to generate structured task suggestions from a user's idea.
 *
 * - getTaskSuggestion - A function that takes a user's idea and suggests task details.
 * - TaskSuggestionInput - The input type for the getTaskSuggestion function.
 * - TaskSuggestionOutput - The return type for the getTaskSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { TaskCategory, User } from '@/lib/types';
import { format } from 'date-fns';

const TaskSuggestionInputSchema = z.object({
  idea: z.string().describe("The user's raw idea or command for a task."),
  users: z.array(z.any()).describe('A list of available users to whom the task can be assigned.'),
});
export type TaskSuggestionInput = z.infer<typeof TaskSuggestionInputSchema>;

const TaskSuggestionOutputSchema = z.object({
  title: z.string().describe('A clear and concise title for the task.'),
  description: z.string().describe('A detailed description of what needs to be done.'),
  category: z.nativeEnum(z.enum(['Low', 'Medium', 'High', 'Critical'])).describe('The priority level of the task.'),
  dueDate: z.string().describe(`The suggested due date in 'yyyy-MM-dd' format.`),
  assigneeId: z.string().optional().describe('The ID of the most suitable user to be assigned this task.'),
});
export type TaskSuggestionOutput = z.infer<typeof TaskSuggestionOutputSchema>;

export async function getTaskSuggestion(
  input: TaskSuggestionInput
): Promise<TaskSuggestionOutput> {
  return generateTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTasksPrompt',
  input: {
    schema: z.object({
      idea: z.string(),
      users: z.string(),
      currentDate: z.string(),
    }),
  },
  output: {schema: TaskSuggestionOutputSchema},
  prompt: `You are an expert project manager assistant. Your task is to analyze a user's idea and convert it into a structured task by extracting key information.

  **Instructions:**
  1.  **Analyze the User's Idea:** Carefully read the user's input to understand the main goal.
  2.  **Extract Title:** Create a short, clear task title from the core request.
  3.  **Extract Description:** Extract any additional details, context, or instructions to use as the task description.
  4.  **Determine Category (Priority):**
      - If you see words like "critical", "urgent", "must-do", or "ASAP", set category to "Critical".
      - If you see "high priority", "important", or "significant", set category to "High".
      - If you see "medium priority", "standard", or "biasa", set category to "Medium".
      - If you see "low priority", "santai", "jika ada waktu", or if no priority is mentioned, default to "Low".
  5.  **Determine Due Date:**
      - The current date is: {{{currentDate}}}.
      - Analyze phrases like "besok", "lusa", "minggu depan", "hari Jumat", or specific dates.
      - Calculate and return the date in "yyyy-MM-dd" format.
      - If no date is mentioned, suggest a reasonable deadline (e.g., 3-7 days from now).
  6.  **Suggest Assignee:**
      - From the provided list of users, identify the best person for the task based on their name or role mentioned in the prompt.
      - If a specific person is named (e.g., "tugaskan ke Sasi"), find that user's ID.
      - If no one is mentioned, do not suggest an assignee (leave 'assigneeId' empty).
  7.  **Handle Typos:** Be tolerant of minor typos or grammatical errors in the user's input. Infer the user's intent.

  **Data Context:**
  - Today's Date: {{{currentDate}}}
  - Available Users (JSON): \`\`\`json
    {{{users}}}
    \`\`\`

  ---
  User's Idea: "{{{idea}}}"
  ---

  Now, generate the structured task object.
  `,
});

const generateTasksFlow = ai.defineFlow(
  {
    name: 'generateTasksFlow',
    inputSchema: TaskSuggestionInputSchema,
    outputSchema: TaskSuggestionOutputSchema,
  },
  async ({ idea, users }) => {
    const {output} = await prompt({
      idea,
      users: JSON.stringify(users.map(u => ({ id: u.id, name: u.name, role: u.role, jabatan: u.jabatan }))),
      currentDate: format(new Date(), 'yyyy-MM-dd'),
    });
    return output!;
  }
);
