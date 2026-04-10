"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DeviceRevokeForm } from "./device-revoke-form";
import { PenLine, Save, X, Loader2 } from "lucide-react";
import { updateDeviceNameAction } from "../actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface DeviceCardProps {
  device: {
    id: string;
    deviceName: string;
    createdAt: string;
    status: string;
    lastSeenAt: string;
  };
}

export function DeviceCard({ device }: DeviceCardProps) {
  const t = useTranslations("Devices");
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(device.deviceName);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateName = async () => {
    if (!editedName.trim()) return;
    
    setIsSaving(true);
    const result = await updateDeviceNameAction(device.id, editedName);
    setIsSaving(false);

    if (result.status === "success") {
      toast.success(t("renameSuccess"));
      setIsEditing(false);
    } else {
      toast.error(result.message || t("renameFailed"));
    }
  };

  const isActive = device.status === "active";

  return (
    <article className={cn(
      "panel p-6 border transition-all",
      isEditing ? "border-accent/40 bg-accent/5 ring-1 ring-accent/20" : "border-line bg-canvas hover:border-line-strong"
    )}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-[200px]">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="display text-2xl text-ink bg-canvas border border-accent/30 rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-accent/10 w-full"
                autoFocus
              />
              <button 
                onClick={handleUpdateName}
                disabled={isSaving}
                className="p-2 bg-accent text-white rounded-lg hover:bg-accent-strong transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditedName(device.deviceName);
                }}
                className="p-2 bg-canvas-depth text-muted rounded-lg hover:bg-canvas-depth/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 group/title">
              <p className="display text-2xl text-ink">{device.deviceName}</p>
              {isActive && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-full hover:bg-canvas-depth text-muted/40 opacity-0 group-hover/title:opacity-100 transition-all hover:text-accent-strong"
                >
                  <PenLine className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
          <p className="mt-2 text-xs uppercase tracking-widest text-muted">{device.createdAt}</p>
        </div>
        
        <Badge
          variant={isActive ? "success" : "destructive"}
          className="rounded-full px-4 py-1 text-[10px] uppercase tracking-[0.2em]"
        >
          {isActive ? t("statusConnected") : t("statusRevoked")}
        </Badge>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-line/50 pt-5">
        <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-accent animate-pulse" : "bg-muted/30")} />
            <p className="text-[10px] uppercase tracking-widest text-muted font-bold">
              {device.lastSeenAt}
            </p>
        </div>
        
        <div>
          {isActive ? (
            <DeviceRevokeForm deviceId={device.id} />
          ) : (
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted/50 font-bold italic">
              {t("statusRevoked")}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
