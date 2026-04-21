import { notFound } from "next/navigation";
import { StoryCommentForm } from "@/features/stories/components/story-comment-form";
import { StoryAudioPlayer } from "@/features/stories/components/story-audio-player";
import { StoryReactionForm } from "@/features/stories/components/story-reaction-form";
import { RealtimeRefresh } from "@/features/realtime/components/realtime-refresh";
import { buildStoryDetailRealtimeTargets } from "@/features/realtime/subscriptions";
import { getStoryById, type StoryDetail } from "@/features/stories/queries";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

type StoryDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

import { PlaybackProvider } from "@/features/stories/context/playback-context";
import { WaveformPlayer } from "@/features/stories/components/playback-room/waveform-player";
import { InteractiveTranscript } from "@/features/stories/components/playback-room/interactive-transcript";
import { EditableStoryTitle } from "@/features/stories/components/editable-story-title";
import { FavoriteButton } from "@/features/stories/components/favorite-button";
import { StoryCommentItem } from "@/features/stories/components/story-comment-item";
import { ArchiveButton } from "@/features/stories/components/archive-button";

async function StoryDetailContent({ storyPromise }: { storyPromise: Promise<StoryDetail> }) {
  const t = await getTranslations("Stories");
  const td = await getTranslations("Dashboard");
  const story = await storyPromise;
  console.log("Story detail:", story); // Debug log
  if (!story) {
    console.log("Story not found, calling notFound()"); // Debug log
    notFound();
  }

  const handleRefreshUrl = async () => {
    "use client";
    const response = await fetch(`/api/stories/${story.id}/playback`, { cache: "no-store" });
    const data = await response.json();
    return data.signedUrl;
  };

  return (
    <PlaybackProvider>
      <RealtimeRefresh
        channelName={`story-detail-${story.id}`}
        targets={buildStoryDetailRealtimeTargets(story.id)}
      />
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex-1">
          <p className="eyebrow flex items-center gap-3">
            {td("storyDetail")}
            {story.isFavorite && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 text-amber-600 rounded-full text-[10px] tracking-widest font-bold border border-amber-400/20">
                {t("activeVault")}
              </span>
            )}
          </p>
          
          <div className="flex items-start justify-between gap-6">
            <EditableStoryTitle storyId={story.id} initialTitle={story.title} />
            <div className="mt-6">
              <FavoriteButton storyId={story.id} initialValue={story.isFavorite} />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm uppercase tracking-[0.2em] text-muted">
            <span className="flex items-center gap-2">
               <div className="w-1 h-4 bg-accent" />
               {story.speakerLabel}
            </span>
            <span>{story.startedAtLabel}</span>
            <span>{story.durationLabel}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <section className="ambient-ring rounded-[2rem] overflow-hidden">
            {story.playback.isReady && story.playback.signedUrl ? (
              <WaveformPlayer
                storyId={story.id}
                src={story.playback.signedUrl}
                expiresAtEpochMs={story.playback.expiresAtEpochMs}
                onRefreshUrl={handleRefreshUrl}
              />
            ) : (
              <div className="rounded-[2rem] border border-line bg-black/10 p-10 text-center">
                <p className="display text-3xl text-ink">{story.syncStatus}</p>
                <p className="mt-4 text-muted max-w-md mx-auto leading-relaxed">
                  {t("playbackProcessingNote")}
                </p>
              </div>
            )}
          </section>

          <aside className="grid grid-cols-2 gap-4">
              <div className="rounded-[1.5rem] border border-line bg-black/10 p-5">
                <p className="eyebrow">{t("community")}</p>
                <div className="mt-8 flex items-baseline gap-2">
                   <span className="display text-4xl text-ink">{story.reactionCount}</span>
                   <span className="text-xs uppercase tracking-widest text-muted">{t("reactions", { count: story.reactionCount })}</span>
                </div>
             </div>
              <div className="rounded-[1.5rem] border border-line bg-black/10 p-5">
                <p className="eyebrow">{t("dialogue")}</p>
                <div className="mt-8 flex items-baseline gap-2">
                   <span className="display text-4xl text-ink">{story.commentCount}</span>
                   <span className="text-xs uppercase tracking-widest text-muted">{t("comments", { count: story.commentCount })}</span>
                </div>
             </div>
          </aside>
        </div>

        <section className="panel rounded-[2rem] p-8 min-h-[500px] border border-line/50 bg-white/5 backdrop-blur-sm">
           <InteractiveTranscript storyId={story.id} content={story.transcript} />
        </section>
      </div>

      <div className="mt-12 grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-[2rem] border border-line bg-black/10 p-8">
          <p className="eyebrow">{t("interactions")}</p>
          <div className="mt-8">
            <StoryReactionForm
              storyId={story.id}
              hasHearted={story.viewerHasHearted}
            />
          </div>
          <div className="mt-10 space-y-4">
            {story.reactions.length > 0 ? (
              story.reactions.map((reaction) => (
                <div
                  key={reaction.type}
                  className="flex items-center justify-between rounded-[1.25rem] border border-line bg-black/10 px-6 py-4"
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-muted font-medium">
                    {reaction.label}
                  </span>
                  <span className="display text-3xl text-ink">
                    {reaction.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted italic text-center py-4">
                {t("noReactionsYet")}
              </p>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-line bg-black/10 p-8 flex flex-col">
          <p className="eyebrow mb-8">{t("householdConversation")}</p>
          <div className="space-y-8 flex-1">
            <StoryCommentForm storyId={story.id} />

            <div className="space-y-6 pt-6 border-t border-line">
              {story.comments.length > 0 ? (
                story.comments.map((comment) => (
                  <StoryCommentItem
                    key={comment.id}
                    comment={comment}
                    storyId={story.id}
                  />
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-line border-dashed p-12 text-center opacity-50">
                  <p className="text-sm text-muted">
                    {t("noCommentsYet")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-line/30 flex justify-end">
            <ArchiveButton storyId={story.id} />
          </div>
        </article>
      </div>
    </PlaybackProvider>
  );
}



export default async function StoryDetailPage({
  params,
}: StoryDetailPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const storyPromise = getStoryById(id) as Promise<StoryDetail>;

  return (
    <section className="panel ambient-ring rounded-[2rem] p-8 md:p-10">
      <Suspense fallback={<StoryDetailSkeleton />}>
        <StoryDetailContent storyPromise={storyPromise} />
      </Suspense>
    </section>
  );
}

function StoryDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-4 w-24 bg-muted/10 rounded" />
      <div className="h-12 w-3/4 bg-ink/10 rounded" />
      <div className="h-4 w-1/2 bg-muted/10 rounded" />
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="h-64 bg-black/5 rounded-[1.5rem]" />
        <div className="h-64 bg-black/5 rounded-[1.5rem]" />
      </div>
    </div>
  );
}
