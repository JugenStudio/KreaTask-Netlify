
'use server';

/**
 * @fileOverview A flow that parses a natural language command to pre-fill a task form.
 *
 * - generateTaskFromPrompt - A function that handles the task parsing process.
 * - GenerateTaskFromPromptInput - The input type for the function.
 * - GenerateTaskFrom-prompt-output - The return type for the function.
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
  prompt: `You are a powerful AI assistant for the KreaTask app. Your primary function is to parse a user's natural language command and intelligently extract structured information to pre-fill a new task form. Be flexible and forgiving with user input, such as typos.

  Today's date is ${new Date().toISOString().split('T')[0]}. Use this as the reference point for any relative date calculations.

  **Instructions:**
  Analyze the user's command and extract the following entities. Use your reasoning to infer the user's intent even if the language isn't perfect.

  1.  **title**: Identify the main goal or objective of the task.
  2.  **description**: Extract any additional details, context, or specific instructions that should be included in the description.
  3.  **category**: Determine the task's priority level. Use the following keywords as a guide:
      -   "Low" or "Rendah": Keywords like "prioritas rendah", "tidak penting", "santai".
      -   "Medium" or "Menengah": Keywords like "prioritas sedang", "biasa", "standar", "normal".
      -   "High" or "Tinggi": Keywords like "prioritas tinggi", "penting", "agak mendesak".
      -   "Critical" or "Kritis": Keywords like "sangat penting", "urgent", "mendesak", "segera", "kritis".
  4.  **dueDate**: Identify the deadline. You must understand relative dates (e.g., "today", "tomorrow", "besok", "lusa", "next Friday", "Jumat depan") and specific dates. Convert the final date into 'YYYY-MM-DD' format.
  5.  **assigneeName**: Determine who the task is for. The name MUST exactly match one of the names from the provided \`assignableUsers\` list. If the command says "untuk saya" or implies the user themselves, leave this field empty. If you cannot find a matching name, leave it empty.
  6.  **subtasks**: If the command mentions multiple steps, a checklist, or a breakdown of work, extract these as an array of strings.

  **Available Users for Assignment:**
  {{#each assignableUsers}}- {{this}}{{/each}}

  ---
  User Command: "{{command}}"
  ---
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
