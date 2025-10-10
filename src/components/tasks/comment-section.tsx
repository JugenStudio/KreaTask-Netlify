
"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Loader2, MoreVertical, Edit, Trash2 } from "lucide-react";
import type { Comment as CommentType, User } from "@/lib/types";
import { getSummary } from "@/app/actions";
import { Separator } from "../ui/separator";
import { useLanguage } from "@/providers/language-provider";
import { getTranslations } from "@/app/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentSectionProps {
  taskId: string;
  comments: CommentType[];
  currentUser: User;
  onUpdateComments: (comments: CommentType[]) => void;
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

export function CommentSection({ taskId, comments, currentUser, onUpdateComments }: CommentSectionProps) {
  const [localComments, setLocalComments] = useState<CommentType[]>(comments);
  const [newComment, setNewComment] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [editingComment, setEditingComment] = useState<CommentType | null>(null);
  const [editingText, setEditingText] = useState("");
  const [state, formAction] = useActionState(getSummary, initialState);
  const { locale, t } = useLanguage();

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsPosting(true);
    const translationResult = await getTranslations(newComment);
    if (translationResult.error) {
        console.error("Translation failed:", translationResult.error);
        translationResult.data = { en: newComment, id: newComment };
    }

    const comment: CommentType = {
      id: `comment-${Date.now()}`,
      author: currentUser,
      timestamp: new Date().toISOString(),
      content: translationResult.data!,
    };
    
    const updatedComments = [...localComments, comment];
    setLocalComments(updatedComments); // Update UI locally
    onUpdateComments(updatedComments); // Propagate change to parent
    
    setNewComment("");
    setIsPosting(false);
  };
  
  const handleDeleteComment = (commentId: string) => {
    const updatedComments = localComments.filter(c => c.id !== commentId);
    setLocalComments(updatedComments);
    onUpdateComments(updatedComments);
  };
  
  const handleEditComment = (comment: CommentType) => {
    setEditingComment(comment);
    setEditingText(comment.content[locale]);
  }

  const handleSaveEdit = async () => {
    if (!editingComment || !editingText.trim()) return;

    setIsPosting(true);
    const translationResult = await getTranslations(editingText);
    const finalContent = translationResult.error ? { en: editingText, id: editingText } : translationResult.data!;

    const updatedComments = localComments.map(c => 
      c.id === editingComment.id ? { ...c, content: finalContent, timestamp: new Date().toISOString() } : c
    );
    
    setLocalComments(updatedComments);
    onUpdateComments(updatedComments);

    setEditingComment(null);
    setEditingText("");
    setIsPosting(false);
  };


  const formatCommentThread = () => {
    return [...localComments]
      .reverse()
      .map(c => `${c.author.name}: "${c.content[locale]}"`)
      .join("\n");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-headline font-semibold">{t('comments.title')}</h3>
        {localComments.length > 1 && (
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
        {[...localComments].reverse().map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="w-full rounded-md bg-secondary p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{comment.author.name}</p>
                <div className="flex items-center">
                    <p className="text-xs text-muted-foreground mr-2">
                    {new Date(comment.timestamp).toLocaleString()}
                    </p>
                    {comment.author.id === currentUser.id && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
              </div>
              {editingComment?.id === comment.id ? (
                <div className="mt-2 space-y-2">
                    <Textarea 
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      disabled={isPosting}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingComment(null)} disabled={isPosting}>Cancel</Button>
                        <Button size="sm" onClick={handleSaveEdit} disabled={isPosting}>
                          {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                          Save
                        </Button>
                    </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {comment.content[locale]}
                </p>
              )}
            </div>
          </div>
        ))}
        {localComments.length === 0 && (
          <div className="text-center text-muted-foreground py-6">
            <p className="text-sm">No comments yet.</p>
            <p className="text-xs">Be the first to say something!</p>
          </div>
        )}
      </div>
    </div>
  );
}

    