
'use server';
/**
 * @fileOverview A flow that translates text into English and Indonesian.
 *
 * - translateContent - A function that handles the translation process.
 * - TranslateContentInput - The input type for the function.
 * - TranslateContentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const TranslateContentInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
});
export type TranslateContentInput = z.infer<typeof TranslateContentInputSchema>;

export const TranslateContentOutputSchema = z.object({
  en: z.string().describe('The English translation.'),
  id: z.string().describe('The Indonesian translation.'),
});
export type TranslateContentOutput = z.infer<
  typeof TranslateContentOutputSchema
>;

export async function translateContent(
  input: TranslateContentInput
): Promise<TranslateContentOutput> {
  return translateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateContentPrompt',
  input: {schema: TranslateContentInputSchema},
  output: {schema: TranslateContentOutputSchema},
  prompt: `You are an expert translator. You will be given a text. Your task is to determine the original language and provide its translation in both English (en) and Indonesian (id).

  Return the result as a JSON object with "en" and "id" keys.

  Text to translate: {{{text}}}
  `,
});

const translateContentFlow = ai.defineFlow(
  {
    name: 'translateContentFlow',
    inputSchema: TranslateContentInputSchema,
    outputSchema: TranslateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
