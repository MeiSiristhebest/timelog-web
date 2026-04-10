import { Bell, AlertCircle, MessageCircle, Heart, Share2, Filter, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "interaction",
    title: "New Comment on Archive #RCV-102",
    description: "Grandma just finished listening to 'The First Summer' and left a profound memory.",
    time: "2h ago",
    isUnread: true,
    icon: <MessageCircle className="h-4 w-4 text-emerald-500" />
  },
  {
    id: "2",
    type: "system",
    title: "Storybox Pairing Success",
    description: "Device 'Living Room Speaker' has been successfully linked to the Heritage Audio protocol.",
    time: "5h ago",
    isUnread: true,
    icon: <Share2 className="h-4 w-4 text-accent" />
  },
  {
    id: "3",
    type: "alert",
    title: "Storage Threshold Reached",
    description: "Your archival vault is at 92%. Consider exporting old memories to permanent storage.",
    time: "1d ago",
    isUnread: false,
    icon: <AlertCircle className="h-4 w-4 text-danger" />
  },
  {
    id: "4",
    type: "interaction",
    title: "Memory Reacted",
    description: "Sarah loved your story 'The Old Oak Tree'.",
    time: "2d ago",
    isUnread: false,
    icon: <Heart className="h-4 w-4 text-rose-500" />
  }
];

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-ink tracking-tight">Activity Archive</h1>
          <p className="text-sm text-muted font-bold uppercase tracking-widest mt-1">Real-time chronicle of family interactions & hardware status</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-canvas-elevated border border-line text-ink hover:border-accent/40 shadow-sm transition-all outline-none">
              <CheckCheck size={14} className="text-emerald-500" />
              Mark all read
           </button>
           <button className="p-2.5 rounded-xl bg-canvas-elevated border border-line text-muted hover:text-ink hover:border-accent/40 transition-all shadow-sm outline-none">
              <Filter size={16} />
           </button>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_NOTIFICATIONS.map((notif) => (
          <div 
            key={notif.id} 
            className={cn(
              "p-6 rounded-3xl border transition-all hover:bg-accent/[0.01] group relative shadow-sm overflow-hidden",
              notif.isUnread ? "bg-canvas-elevated border-line border-l-4 border-l-accent" : "bg-canvas-depth border-line"
            )}
          >
            {notif.isUnread && (
              <div className="absolute top-0 right-0 p-4">
                 <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-lg shadow-accent/50" />
              </div>
            )}
            
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-2xl border bg-canvas-depth border-line shrink-0 group-hover:rotate-6 transition-transform shadow-sm",
                notif.isUnread ? "text-accent" : "text-muted opacity-60"
              )}>
                {notif.icon}
              </div>
              <div className="min-w-0 pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn(
                    "font-black text-sm tracking-tight",
                    notif.isUnread ? "text-ink" : "text-muted"
                  )}>
                    {notif.title}
                  </h4>
                  <Badge variant="outline" className="text-[9px] font-black px-1.5 py-0 uppercase tracking-widest border-line text-muted opacity-60">
                    {notif.type}
                  </Badge>
                </div>
                <p className={cn(
                  "text-xs font-bold leading-relaxed pr-4",
                  notif.isUnread ? "text-ink" : "text-muted opacity-80"
                )}>
                  {notif.description}
                </p>
                <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-muted/60 bg-canvas-depth border border-line w-fit px-2 py-0.5 rounded-md">
                   <Bell size={10} />
                   {notif.time}
                </div>
              </div>
            </div>
          </div>
        ))}

        {MOCK_NOTIFICATIONS.length === 0 && (
          <div className="p-32 text-center flex flex-col items-center">
            <div className="h-20 w-20 rounded-2xl bg-canvas-depth flex items-center justify-center border border-dashed border-line rotate-12 mb-6">
               <Bell className="h-10 w-10 text-muted/20" />
            </div>
            <h4 className="text-xl font-black text-ink">Zero Interference</h4>
            <p className="text-sm text-muted font-bold mt-2 max-w-xs leading-relaxed uppercase tracking-widest opacity-60">
               Your activity archive is currently silent. New alerts will materialize here as they occur.
            </p>
          </div>
        )}
      </div>

      <div className="pt-8 border-t border-line flex justify-center">
         <button className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-accent transition-colors flex items-center gap-2 px-6 py-3 rounded-full hover:bg-accent/5">
            Load Archival History
            <Share2 size={12} />
         </button>
      </div>
    </div>
  );
}
