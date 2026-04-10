"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateStoryTitleAction, type StoryActionState } from "../actions";
import { toast } from "sonner";
import { Check, Edit3, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface EditableStoryTitleProps {
  storyId: string;
  initialTitle: string;
}

export function EditableStoryTitle({ storyId, initialTitle }: EditableStoryTitleProps) {
  const t = useTranslations("Stories");
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(initialTitle);

  const [state, formAction, isPending] = useActionState(
    async (_prevState: StoryActionState, formData: FormData) => {
      const newTitle = formData.get("title") as string;
      if (newTitle.trim() === initialTitle) {
        setIsEditing(false);
        return { status: "idle", message: null } as StoryActionState;
      }
      return updateStoryTitleAction(storyId, newTitle);
    },
    { status: "idle", message: null }
  );

  useEffect(() => {
    if (state.status === "success") {
      setIsEditing(false);
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, initialTitle]);

  const handleCancel = () => {
    setLocalTitle(initialTitle);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form
        action={formAction}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 animate-in fade-in slide-in-from-left-2 duration-300"
      >
        <input
          autoFocus
          name="title"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleCancel();
          }}
          className="display text-4xl text-ink md:text-6xl bg-transparent border-b-2 border-accent outline-none w-full max-w-4xl leading-[1.1] selection:bg-accent/20"
          placeholder={t("transcriptPlaceholder")}
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="p-2 rounded-full bg-accent text-white shadow-lg hover:bg-accent-strong transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 rounded-full bg-canvas border border-line text-muted hover:text-ink transition-all active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="group relative pt-4">
      <h1 className="display text-4xl text-ink md:text-6xl max-w-4xl leading-[1.1] pr-12">
        {localTitle}
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-line-strong hover:text-accent hover:bg-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-300"
          title="Edit archive title"
        >
          <Edit3 className="h-6 w-6" />
        </button>
      </h1>
    </div>
  );
}
