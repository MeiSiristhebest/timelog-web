import { FamilyInviteForm } from "@/features/family/components/family-invite-form";
import { FamilyDataTable } from "@/features/family/components/family-data-table";
import { getFamilyMembers } from "@/features/family/queries";
import { RealtimeRefresh } from "@/features/realtime/components/realtime-refresh";
import { buildInteractionRealtimeTargets } from "@/features/realtime/subscriptions";
import { Users, UserPlus } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function FamilyPage() {
  const t = await getTranslations();
  const members = await getFamilyMembers();
  const acceptedCount = members.filter((member) => member.status === "accepted").length;
  const pendingCount = members.filter((member) => member.status !== "accepted").length;

  return (
    <div className="space-y-6">
      <RealtimeRefresh
        channelName="family-members-refresh"
        targets={buildInteractionRealtimeTargets()}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
         <div>
            <h1 className="text-3xl font-bold text-ink tracking-tight">{t("Family.title")}</h1>
            <p className="text-sm text-muted mt-1">{t("Family.subtitle")}</p>
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <span className="text-2xl font-bold text-ink">{acceptedCount}</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-muted">{t("Dashboard.family")}</span>
            </div>
            <div className="h-8 w-px bg-line" />
            <div className="flex items-center gap-2">
               <span className="text-2xl font-bold text-muted">{pendingCount}</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-muted">{t("Family.pendingMember")}</span>
            </div>
         </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Management Table */}
        <div className="space-y-6">
           <FamilyDataTable members={members} />
        </div>

        {/* Invite Sidebar */}
        <div className="space-y-6">
          <div className="bg-[var(--canvas-elevated)] border border-[var(--line)] rounded-2xl p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-6 text-accent">
                <UserPlus size={18} />
                <h3 className="text-sm font-bold uppercase tracking-widest">{t("Family.invitePending")}</h3>
             </div>
             <FamilyInviteForm />
             <div className="mt-6 pt-6 border-t border-line">
                <p className="text-[10px] leading-relaxed text-muted font-bold italic">
                  {t("Family.previewDesc")}
                </p>
             </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-accent text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Users size={60} />
            </div>
            <h4 className="text-sm font-bold mb-2">{t("Settings.encryptionPolicy")}</h4>
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {t("Family.removeConfirmDesc", { name: t("Branding.heritage") })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
