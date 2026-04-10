"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Radio,
  Clock,
  Edit2,
  Save,
  X,
  Loader2,
  AlertOctagon,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { updateDeviceNameAction } from "@/features/devices/actions";
import type { DeviceView as Device } from "@/features/devices/queries";
import { DeviceRevokeForm } from "@/features/devices/components/device-revoke-form";

interface DevicesDataTableProps {
  devices: Device[];
}

export function DevicesDataTable({ devices }: DevicesDataTableProps) {
  const t = useTranslations("Devices");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = (device: Device) => {
    setEditingId(device.id);
    setEditedName(device.deviceName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedName("");
  };

  const handleUpdateName = async (deviceId: string) => {
    if (!editedName.trim()) return;
    
    setIsSaving(true);
    const result = await updateDeviceNameAction(deviceId, editedName);
    setIsSaving(false);

    if (result.status === "success") {
      toast.success(t("renameSuccess"));
      setEditingId(null);
    } else {
      toast.error(result.message || t("renameFailed"));
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="bg-canvas-elevated border border-line rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-line bg-canvas-depth/30">
              <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted">{t("tableDevice")}</TableHead>
              <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted">{t("tableState")}</TableHead>
              <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted">{t("tableLastSeen")}</TableHead>
              <TableHead className="px-6 h-14 text-[10px] font-black uppercase tracking-widest text-muted">{t("tableAdded")}</TableHead>
              <TableHead className="w-16 px-6 h-14"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => {
              const isActive = device.status === "active";
              const isEditing = editingId === device.id;

              return (
                <TableRow key={device.id} className="group border-b border-line hover:bg-accent/[0.02] transition-colors">
                  <TableCell className="px-6 py-5">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-2xl bg-canvas-depth border border-line-strong shadow-sm shrink-0">
                        <Radio size={18} className={cn(isActive ? "text-accent" : "text-muted/40")} />
                      </div>
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="flex items-center gap-2 max-w-[240px]">
                            <input 
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="w-full text-sm font-black text-ink bg-canvas-depth border border-accent/40 rounded-xl px-3 py-1.5 outline-none ring-4 ring-accent/5"
                              autoFocus
                            />
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleUpdateName(device.id)}
                                disabled={isSaving}
                                className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                              >
                                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={16} />}
                              </button>
                              <button 
                                onClick={cancelEditing} 
                                className="p-2 text-muted hover:bg-canvas-depth rounded-lg transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/name">
                            <p className="text-sm font-black text-ink truncate">
                              {device.deviceName}
                            </p>
                            {isActive && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button 
                                    onClick={() => startEditing(device)}
                                    className="opacity-0 group-hover/name:opacity-100 p-1.5 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px] font-bold uppercase tracking-widest bg-canvas-elevated text-ink">
                                  {t("renameDevice")}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        )}
                        <p className="text-[10px] text-muted font-bold mt-1.5 uppercase tracking-widest border-l-2 border-accent/30 pl-2">
                          ID: {device.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] font-black px-2 py-0.5 uppercase tracking-widest",
                        isActive 
                          ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600" 
                          : "border-danger/20 bg-danger/5 text-danger shadow-sm shadow-danger/5"
                      )}
                    >
                      <span className={cn(
                        "h-1 w-1 rounded-full mr-1.5",
                        isActive ? "bg-emerald-600 animate-pulse" : "bg-danger"
                      )} />
                      {isActive ? t("statusConnected") : t("statusRevoked")}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs text-muted font-bold">
                      <Clock size={12} className="text-muted/50" />
                      {device.lastSeenAt}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-xs text-muted font-bold">
                    {device.createdAt}
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right">
                    {isActive ? (
                      <DeviceRevokeForm deviceId={device.id} />
                    ) : (
                       <div className="flex justify-end pr-2 text-muted/30">
                          <AlertOctagon size={18} />
                       </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {devices.length === 0 && (
           <div className="p-32 text-center animate-in fade-in zoom-in duration-500 flex flex-col items-center">
              <div className="h-20 w-20 rounded-2xl bg-canvas-depth flex items-center justify-center border border-dashed border-line-strong mb-6 rotate-12">
                <RefreshCw className="h-8 w-8 text-muted/40" />
              </div>
              <h4 className="text-xl font-black text-ink tracking-tight">{t("emptyTitle")}</h4>
              <p className="text-sm text-muted font-bold mt-2 max-w-xs mx-auto uppercase tracking-widest opacity-60">
                {t("emptyDesc")}
              </p>
           </div>
        )}
      </div>
    </TooltipProvider>
  );
}

