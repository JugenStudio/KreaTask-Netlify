
"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Loader2 } from "lucide-react";
import type { Comment as CommentType, User } from "@/lib/types";
import { getSummary } from "@/app/actions";
import { Separator } from "../ui/separator";
import { useLanguage } from "@/providers/language-provider";
import { getTranslations } from "@/app/actions";

interface CommentSectionProps {
  taskId: string;
  comments: CommentType[];
  currentUser: User;
  onAddComment: (comment: CommentType) => void;
}

const initialState = {
  summary: null,
  error: null,
};

function SummarizeButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button size="sm" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('comments.summarizing_button')}
        </>
      ) : (
        <>
          <Bot className="mr-2 h-4 w-4" />
          {t('comments.summarize_button')}
        </>
      )}
    </Button>
  );
}

export function CommentSection({ taskId, comments, currentUser, onAddComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [state, formAction] = useActionState(getSummary, initialState);
  const { locale, t } = useLanguage();

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setIsPosting(true);

    // Translate the comment
    const translationResult = await getTranslations(newComment);
    if (translationResult.error) {
        console.error("Translation failed:", translationResult.error);
        // Fallback to using the original text if translation fails
        translationResult.data = { en: newComment, id: newComment };
    }

    const comment: CommentType = {
      id: `comment-${Date.now()}`,
      author: currentUser,
      timestamp: new Date().toISOString(),
      content: translationResult.data!,
    };
    
    onAddComment(comment);
    setNewComment("");
    setIsPosting(false);
  };

  const formatCommentThread = () => {
    return comments
      .slice()
      .reverse()
      .map(c => `${c.author.name}: "${c.content[locale]}"`)
      .join("\n");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-headline font-semibold">{t('comments.title')}</h3>
        {comments.length > 0 && (
            <form action={formAction}>
                <input type="hidden" name="commentThread" value={formatCommentThread()} />
                <SummarizeButton />
            </form>
        )}
      </div>
      
      {state.summary && (
        <Card className="bg-secondary">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-md font-headline">{t('comments.ai_summary_title')}</CardTitle>
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
              placeholder={t('comments.add_comment_placeholder')}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isPosting}
            />
            <div className="flex justify-end">
              <Button onClick={handlePostComment} disabled={!newComment.trim() || isPosting}>
                {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('comments.post_button')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Separator />
      <div className="space-y-6">
        {comments.map((comment) => (
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
                {comment.content[locale]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

    