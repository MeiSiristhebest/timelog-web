"use client";

import { useActionState, useEffect, useState } from "react";
import { PenLine, Save, Loader2, Sparkles, X } from "lucide-react";
import { updateArchiveNameAction, type FamilyActionState } from "../actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/hooks/use-translation";
import { motion, AnimatePresence } from "framer-motion";

interface ArchiveNameFormProps {
  initialName: string;
}

export function ArchiveNameForm({ initialName }: ArchiveNameFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [isPending, setIsPending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name === initialName) {
      setIsEditing(false);
      return;
    }

    setIsPending(true);
    const result = await updateArchiveNameAction(name);
    setIsPending(false);

    if (result.status === "success") {
      toast.success(result.message);
      setIsEditing(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="panel p-6 bg-panel border-line group overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-accent/10 rounded-xl group-hover:scale-110 transition-transform duration-500">
          <Sparkles className="h-5 w-5 text-accent-strong" />
        </div>
        <h3 className="display text-xl text-ink tracking-tight font-black">{t("Settings.Naming.groupTitle")}</h3>
      </div>

      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div 
            key="display"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-4xl display text-ink tracking-tighter leading-none">
                {name || t("Settings.Naming.unnamed")}
              </p>
              <p className="text-[10px] text-muted mt-3 uppercase tracking-[0.2em] font-black opacity-60">
                {t("Settings.Naming.helperText")}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="h-10 w-10 rounded-full bg-canvas-elevated border border-line flex items-center justify-center text-muted hover:text-accent hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all outline-none"
            >
              <PenLine className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            <div className="relative">
              <Input
                name="archiveName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("Settings.Naming.placeholder")}
                className="text-2xl display h-16 bg-canvas-elevated border-line focus:ring-accent rounded-2xl px-6"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setName(initialName);
                  setIsEditing(false);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-line text-[11px] font-black uppercase tracking-widest text-muted hover:bg-canvas-depth hover:text-ink transition-all"
              >
                <X className="h-3 w-3" />
                {t("Settings.Naming.cancel")}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-8 py-2.5 bg-ink text-canvas rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-accent hover:text-accent-foreground shadow-xl shadow-ink/10 disabled:opacity-50 transition-all hover:-translate-y-0.5"
              >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                {t("Settings.Naming.save")}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
