'use server';

/**
 * @fileOverview A flow that takes a high-level goal and generates a list of actionable task suggestions.
 *
 * - generateTaskSuggestions - A function that handles the task generation process.
 * - GenerateTasksInput - The input type for the function.
 * - GenerateTasksOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTasksInputSchema = z.object({
  goal: z
    .string()
    .describe(
      'The high-level goal or project objective provided by the user.'
    ),
});
export type GenerateTasksInput = z.infer<typeof GenerateTasksInputSchema>;

const SuggestedTaskSchema = z.object({
    title: z.string().describe("A concise, actionable title for the suggested task."),
    description: z.string().describe("A brief but clear description of what needs to be done for this task.")
});

const GenerateTasksOutputSchema = z.object({
  suggestions: z
    .array(SuggestedTaskSchema)
    .describe(
      'A list of actionable task suggestions to help achieve the user\'s goal.'
    ),
});
export type GenerateTasksOutput = z.infer<typeof GenerateTasksOutputSchema>;

export async function generateTaskSuggestions(
  input: GenerateTasksInput
): Promise<GenerateTasksOutput> {
  return generateTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTasksPrompt',
  input: {schema: GenerateTasksInputSchema},
  output: {schema: GenerateTasksOutputSchema},
  prompt: `You are an expert project manager. A user will provide a high-level goal, and your job is to break it down into smaller, actionable tasks.

  Based on the user's goal, generate a list of 3-5 clear, concise, and logical task suggestions. Each suggestion must have a title and a description.

  User's Goal: {{{goal}}}
  `,
});

const generateTasksFlow = ai.defineFlow(
  {
    name: 'generateTasksFlow',
    inputSchema: GenerateTasksInputSchema,
    outputSchema: GenerateTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
