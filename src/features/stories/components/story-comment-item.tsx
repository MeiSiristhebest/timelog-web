"use client";

import { useState } from "react";
import { StoryCommentItem as CommentType } from "../presentation";
import { VoiceCommentPlayer } from "./comment-room/voice-comment-player";
import { PenLine, Trash2, Save, X, Loader2 } from "lucide-react";
import { updateCommentAction, deleteCommentAction } from "../../interactions/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface StoryCommentItemProps {
  comment: CommentType;
  storyId: string;
}

export function StoryCommentItem({ comment, storyId }: StoryCommentItemProps) {
  const t = useTranslations();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = async () => {
    if (!editedContent.trim()) return;
    setIsSaving(true);
    const result = await updateCommentAction(comment.id, editedContent, storyId);
    setIsSaving(false);
    
    if (result.status === "success") {
      toast.success(t("Interactions.commentRevised"));
      setIsEditing(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteCommentAction(comment.id, storyId);
    setIsDeleting(false);

    if (result.status === "success") {
      toast.success(t("Interactions.commentWithdrawn"));
      setShowDeleteConfirm(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-[1.5rem] border border-line/50 bg-canvas-depth/30 p-6 hover:bg-canvas-depth/50 transition-all",
        isEditing && "border-accent/30 bg-accent/5"
      )}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent font-black">
            {comment.authorLabel}
          </p>
          {isEditing && (
            <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-accent-strong rounded font-black uppercase tracking-widest">{t("Interactions.editingBadge")}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted font-bold">
            {comment.createdAtLabel}
          </p>
          
          {/* Management Controls */}
          {!isEditing && !showDeleteConfirm && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {comment.type === "text" && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-full hover:bg-accent/10 text-muted hover:text-accent-strong transition-colors"
                >
                  <PenLine className="h-3.5 w-3.5" />
                </button>
              )}
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-full hover:bg-destructive/10 text-muted hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-4 text-[15px] leading-relaxed text-ink bg-canvas border border-line rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none resize-none min-h-[100px] font-medium"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={handleUpdate}
                disabled={isSaving}
                className="px-6 py-2 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-accent-strong transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                {t("Common.confirm")}
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(comment.content);
                }}
                className="px-6 py-2 bg-canvas-depth text-muted rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-canvas-depth/80 transition-colors"
              >
                <X className="h-3 w-3" />
                {t("Common.cancel")}
              </button>
            </div>
          </div>
        ) : showDeleteConfirm ? (
          <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-4 flex items-center justify-between gap-4">
            <p className="text-[11px] text-destructive font-bold italic">{t("Interactions.deleteConfirm")}</p>
            <div className="flex gap-4 shrink-0">
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-[11px] font-black uppercase tracking-widest text-destructive hover:underline disabled:opacity-50"
              >
                {isDeleting ? t("Interactions.withdrawing") : t("Common.confirm")}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="text-[11px] font-black uppercase tracking-widest text-muted hover:underline"
              >
                {t("Common.cancel")}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1">
            {comment.type === "audio" && comment.audioUrl ? (
              <VoiceCommentPlayer url={comment.audioUrl} />
            ) : (
              <p className="text-[15px] leading-relaxed text-ink/90 whitespace-pre-wrap font-medium">
                {comment.content}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
