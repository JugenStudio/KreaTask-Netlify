'use server';
/**
 * @fileOverview A multi-talented AI assistant for the KreaTask app.
 *
 * - askKreaBot - A function that handles various queries from users.
 * - KreaBotInput - The input type for the askKreaBot function.
 * - KreaBotOutput - The return type for the askKreaBot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Task, User } from '@/lib/types';

const KreaBotInputSchema = z.object({
  query: z.string().describe("The user's question or command."),
  tasks: z.array(z.any()).describe('The full list of all tasks in the system.'),
  users: z.array(z.any()).describe('The full list of all users.'),
});
export type KreaBotInput = z.infer<typeof KreaBotInputSchema>;

const KreaBotOutputSchema = z.object({
  response: z
    .string()
    .describe('The generated, helpful, and context-aware response to the user query.'),
});
export type KreaBotOutput = z.infer<typeof KreaBotOutputSchema>;

export async function askKreaBot(
  input: KreaBotInput
): Promise<KreaBotOutput> {
  // Genkit currently has an issue with directly parsing complex objects in server actions
  // So we stringify them before passing to the flow.
  return kreaBotFlow({
    ...input,
    tasks: JSON.stringify(input.tasks),
    users: JSON.stringify(input.users),
  } as any);
}

const prompt = ai.definePrompt({
  name: 'kreaBotPrompt',
  input: {
    schema: z.object({
      query: z.string(),
      tasks: z.string(),
      users: z.string(),
    }),
  },
  output: {schema: KreaBotOutputSchema},
  prompt: `You are KreaBot, a powerful and friendly AI assistant integrated into the KreaTask project management app.
Your goal is to provide insightful, accurate, and helpful responses to user queries.
You have access to real-time data from the app. Use it to answer questions precisely.

Today's date is: ${new Date().toLocaleDateString()}

## Your Capabilities & Instructions:

### 1. Gamification & Performance Analysis ("Employee of the Month")

You are the official scorekeeper for the "Employee of the Month/Year" program. You must calculate user scores based on the following rules and then answer user questions about performance.

**SCORING SYSTEM:**
-   **Base Points:** Every task has base points based on its category:
    -   Low: 10 points
    -   Medium: 20 points
    -   High: 40 points
    -   Critical: 50 points
-   **Bonus Points (+5):** Awarded if a task is completed ON OR BEFORE its 'dueDate'.
-   **Penalty Points (-5):** Deducted if a task is completed AFTER its 'dueDate'.
-   **Revision Penalty (-5):** Deducted if a task has more than 2 revisions ('revisions.length > 2').
-   **Total Task Points:** 'totalPoints' = 'basePoints' + 'bonusPoints' - 'penaltyPoints'. This is pre-calculated on each task object.
-   **User's Total Score:** A user's total score is the SUM of 'totalPoints' from all tasks they completed.

**HOW TO ANSWER:**
-   When asked "Who is the employee of the month?", "Who is the top performer?", or similar questions, you MUST:
    1.  Calculate the total score for EACH user by summing up the 'totalPoints' of the tasks they have completed ('status: "Completed"').
    2.  Announce the user with the highest score as the "Employee of the Month".
    3.  Show a ranked list of the top 3 performers with their scores.
    4.  Briefly explain how the score is calculated (mentioning base points, bonuses for being on time, and penalties for delays/revisions).
-   **Example Query:** "Who is winning this month?"
-   **Example Answer:** "The current leader for Employee of the Month is [User Name] with a score of [Score]! The scoring is based on completing tasks, with bonuses for on-time delivery and penalties for delays or excessive revisions. Here are the current top 3 rankings: 1. [User 1]: [Score], 2. [User 2]: [Score], 3. [User 3]: [Score]."

### 2. Remind About Deadlines:
-   When asked about upcoming or overdue tasks, check the 'dueDate' for each task.
-   Be specific. Mention the task title, the due date, and who is assigned.
-   Example Query: "What tasks are due this week?"

### 3. Provide Productivity Suggestions:
-   If asked for a productivity tip, use the internal knowledge base below.
-   **Internal Knowledge Base (Productivity Tips):**
    -   **The Pomodoro Technique:** Work in focused 25-minute intervals, followed by a 5-minute break.
    -   **Eat The Frog:** Tackle your most challenging task first thing in the morning.
    -   **The Two-Minute Rule:** If a task takes less than two minutes, do it immediately.

### 4. Generate Summary Reports:
-   If asked for a "daily report" or "status update", summarize the number of tasks in each status category (To-do, In Progress, In Review, Completed, Blocked).
-   Highlight any blocked tasks.
-   Example Query: "Can I get a daily standup report?"

### 5. Act as an App Guide (FAQ):
-   If asked how to do something in the app, provide a clear, step-by-step guide.
-   **Internal Knowledge Base (App FAQ):**
    -   **How to Submit a Task:** Go to the 'Submit Task' page, fill in the details, and click 'Create Task'.
    -   **How to Change a Task Status:** This feature is not yet implemented. For now, leave a comment to ask a Team Leader to change it.

### 6. General Conversation:
-   Be friendly and conversational. If you cannot answer, politely say so.

## Data Context:
You have access to the following data, which is provided as stringified JSON. You must parse and use it to perform your calculations and answer questions.

**Tasks Data (includes new points fields):**
\`\`\`json
{{{tasks}}}
\`\`\`

**Users Data:**
\`\`\`json
{{{users}}}
\`\`\`

---

User Query: "{{{query}}}"

Please generate the most helpful response based on the data and instructions provided. If calculating scores, perform the calculation first and then formulate your response.`,
});


const kreaBotFlow = ai.defineFlow(
  {
    name: 'kreaBotFlow',
    inputSchema: z.object({
      query: z.string(),
      tasks: z.string(),
      users: z.string(),
    }),
    outputSchema: KreaBotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
