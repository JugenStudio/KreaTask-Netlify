"use client";

import { useState } from "react";
import { useFormStatus, useFormState } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Loader2 } from "lucide-react";
import type { Comment as CommentType, User } from "@/lib/types";
import { getSummary } from "@/app/actions";
import { Separator } from "../ui/separator";

interface CommentSectionProps {
  comments: CommentType[];
  currentUser: User;
}

const initialState = {
  summary: null,
  error: null,
};

function SummarizeButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="sm" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Summarizing...
        </>
      ) : (
        <>
          <Bot className="mr-2 h-4 w-4" />
          Summarize with AI
        </>
      )}
    </Button>
  );
}

export function CommentSection({ comments, currentUser }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [commentList, setCommentList] = useState(comments);
  const [state, formAction] = useFormState(getSummary, initialState);

  const handlePostComment = () => {
    if (newComment.trim()) {
      const comment: CommentType = {
        id: `comment-${Date.now()}`,
        author: currentUser,
        timestamp: new Date().toISOString(),
        content: newComment,
      };
      setCommentList([comment, ...commentList]);
      setNewComment("");
    }
  };

  const formatCommentThread = () => {
    return commentList
      .slice()
      .reverse()
      .map(c => `${c.author.name}: "${c.content}"`)
      .join("\n");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-headline font-semibold">Comments</h3>
        <form action={formAction}>
           <input type="hidden" name="commentThread" value={formatCommentThread()} />
           <SummarizeButton />
        </form>
      </div>
      
      {state.summary && (
        <Card className="bg-secondary">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-md font-headline">AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{state.summary}</p>
          </CardContent>
        </Card>
      )}
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="space-y-4">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="w-full space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handlePostComment} disabled={!newComment.trim()}>Post Comment</Button>
            </div>
          </div>
        </div>
      </div>
      <Separator />
      <div className="space-y-6">
        {commentList.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="w-full rounded-md bg-secondary p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{comment.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.timestamp).toLocaleString()}
                </p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
