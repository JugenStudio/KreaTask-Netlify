'use server';

/**
 * @fileOverview A flow that summarizes comment threads per task, highlighting key discussion points and action items.
 *
 * - summarizeTaskComments - A function that handles the summarization of task comments.
 * - SummarizeTaskCommentsInput - The input type for the summarizeTaskComments function.
 * - SummarizeTaskCommentsOutput - The return type for the summarizeTaskComments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTaskCommentsInputSchema = z.object({
  commentThread: z
    .string()
    .describe('The complete comment thread for a given task.'),
  companyPolicy: z
    .string()
    .describe('The company policy to adhere to during summarization.'),
});
export type SummarizeTaskCommentsInput = z.infer<
  typeof SummarizeTaskCommentsInputSchema
>;

const SummarizeTaskCommentsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the comment thread, highlighting key discussion points and action items, with author attribution and respecting company policy.'
    ),
});
export type SummarizeTaskCommentsOutput = z.infer<
  typeof SummarizeTaskCommentsOutputSchema
>;

export async function summarizeTaskComments(
  input: SummarizeTaskCommentsInput
): Promise<SummarizeTaskCommentsOutput> {
  return summarizeTaskCommentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTaskCommentsPrompt',
  input: {schema: SummarizeTaskCommentsInputSchema},
  output: {schema: SummarizeTaskCommentsOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing comment threads for tasks.

  Your summary should highlight key discussion points and action items.
  Ensure that you attribute statements and action items to the correct author.
  You must adhere to the following company policy: {{{companyPolicy}}}.

  Comment Thread: {{{commentThread}}}
  Summary: `,
});

const summarizeTaskCommentsFlow = ai.defineFlow(
  {
    name: 'summarizeTaskCommentsFlow',
    inputSchema: SummarizeTaskCommentsInputSchema,
    outputSchema: SummarizeTaskCommentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
