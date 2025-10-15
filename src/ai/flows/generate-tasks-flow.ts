'use server';

/**
 * @fileOverview A flow that parses a natural language command to pre-fill a task form.
 *
 * - generateTaskFromPrompt - A function that handles the task parsing process.
 * - GenerateTaskFromPromptInput - The input type for the function.
 * - GenerateTaskFromPromptOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { TaskCategory } from '@/lib/types';


const GenerateTaskFromPromptInputSchema = z.object({
  command: z.string().describe('The natural language command from the user.'),
  assignableUsers: z.array(z.string()).describe('A list of names of users who can be assigned tasks.'),
});
export type GenerateTaskFromPromptInput = z.infer<typeof GenerateTaskFromPromptInputSchema>;


const GenerateTaskFromPromptOutputSchema = z.object({
  title: z.string().optional().describe("The extracted task title. Should be concise and clear."),
  description: z.string().optional().describe("The extracted task description, containing additional details."),
  category: z.nativeEnum(TaskCategory).optional().describe("The extracted priority/category of the task."),
  dueDate: z.string().optional().describe("The extracted due date in 'YYYY-MM-DD' format. The AI should calculate the date based on relative terms like 'tomorrow' or 'next Friday'."),
  assigneeName: z.string().optional().describe("The name of the user to assign the task to. Must be one of the provided assignableUsers."),
  subtasks: z.array(z.string()).optional().describe("A list of subtasks or checklist items if mentioned.")
});
export type GenerateTaskFromPromptOutput = z.infer<typeof GenerateTaskFromPromptOutputSchema>;


export async function generateTaskFromPrompt(
  input: GenerateTaskFromPromptInput
): Promise<GenerateTaskFromPromptOutput> {
  return generateTaskFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTaskFromPrompt',
  input: {schema: GenerateTaskFromPromptInputSchema},
  output: {schema: GenerateTaskFromPromptOutputSchema},
  prompt: `You are an AI assistant for the KreaTask app. Your job is to parse a user's natural language command and extract structured information to pre-fill a new task form.

  Analyze the user's command and extract the following entities:
  1.  **title**: The main goal of the task.
  2.  **description**: Any additional details, instructions, or context.
  3.  **category**: Identify the priority. Keywords like "prioritas tinggi", "sangat penting", "urgent" should map to "High" or "Critical". "biasa", "tidak urgent" should map to "Low" or "Medium".
  4.  **dueDate**: Identify the deadline. You must understand relative dates like "today", "tomorrow", "next Friday", or specific dates. Convert it to 'YYYY-MM-DD' format. Today's date is ${new Date().toISOString().split('T')[0]}.
  5.  **assigneeName**: Identify the person the task is for. The name MUST exactly match one of the names from the provided \`assignableUsers\` list. If no matching name is found, leave it empty.
  6.  **subtasks**: If the command mentions multiple steps or a checklist, extract them as an array of strings.

  Here is the list of users you can assign tasks to:
  {{#each assignableUsers}}- {{this}}{{/each}}

  User Command: "{{command}}"
  `,
});

const generateTaskFromPromptFlow = ai.defineFlow(
  {
    name: 'generateTaskFromPromptFlow',
    inputSchema: GenerateTaskFromPromptInputSchema,
    outputSchema: GenerateTaskFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
