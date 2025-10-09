"use server";

import { summarizeTaskComments } from "@/ai/flows/summarize-task-comments";
import { askKreaBot } from "@/ai/flows/kreatask-bot-flow";
import { generateTaskSuggestions } from "@/ai/flows/generate-tasks-flow";
import { z } from "zod";
import type { Task, User } from "@/lib/types";

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
    console.error("KreaBot action error:", error);
    return { response: null, error: "Sorry, I encountered an error. Please try again." };
  }
}

const GenerateTasksSchema = z.object({
  goal: z.string(),
});

export async function getTaskSuggestions(goal: string) {
  try {
    const validatedData = GenerateTasksSchema.parse({ goal });
    const result = await generateTaskSuggestions(validatedData);
    return { suggestions: result.suggestions, error: null };
  } catch (error) {
    console.error("Generate Tasks action error:", error);
    if (error instanceof z.ZodError) {
      return { suggestions: null, error: "Invalid goal provided." };
    }
    return { suggestions: null, error: "Sorry, I couldn't generate task suggestions right now." };
  }
}
