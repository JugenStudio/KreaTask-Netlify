"use server";

import { summarizeTaskComments } from "@/ai/flows/summarize-task-comments";
import { z } from "zod";

const SummarizeSchema = z.object({
  commentThread: z.string(),
});

export async function getSummary(formData: FormData) {
  try {
    const validatedData = SummarizeSchema.parse({
      commentThread: formData.get("commentThread"),
    });

    const companyPolicy = "Summaries should be concise, professional, and focus on decisions and action items. Avoid informal language.";

    const result = await summarizeTaskComments({
      commentThread: validatedData.commentThread,
      companyPolicy,
    });
    
    return { summary: result.summary, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { summary: null, error: "Invalid input." };
    }
    return { summary: null, error: "Failed to generate summary." };
  }
}
