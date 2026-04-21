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
  if (!story) {
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

      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow flex items-center gap-3">
            {td("storyDetail")}
            {story.isFavorite && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-400/10 text-amber-600 rounded-full text-[9px] tracking-widest font-bold border border-amber-400/20">
                {t("activeVault")}
              </span>
            )}
          </p>
          <FavoriteButton storyId={story.id} initialValue={story.isFavorite} />
        </div>

        <div className="space-y-2">
          <EditableStoryTitle storyId={story.id} initialTitle={story.title} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm uppercase tracking-[0.15em] text-muted/80 font-medium">
            <span className="flex items-center gap-1.5">
               <div className="w-1 h-3 bg-accent rounded-full" />
               {story.speakerLabel}
            </span>
            <span className="text-muted/60">•</span>
            <span>{story.startedAtLabel}</span>
            <span className="text-muted/60">•</span>
            <span>{story.durationLabel}</span>
          </div>
        </div>
      </div>

      {/* Audio Player Section */}
      <section className="ambient-ring rounded-[1.75rem] overflow-hidden mt-8">
        {story.playback.isReady && story.playback.signedUrl ? (
          <WaveformPlayer
            storyId={story.id}
            src={story.playback.signedUrl}
            expiresAtEpochMs={story.playback.expiresAtEpochMs}
            onRefreshUrl={handleRefreshUrl}
          />
        ) : (
          <div className="rounded-[1.75rem] border border-line bg-black/5 p-8 text-center">
            <p className="display text-2xl text-ink">{story.syncStatus}</p>
            <p className="mt-3 text-sm text-muted max-w-sm mx-auto leading-relaxed">
              {t("playbackProcessingNote")}
            </p>
          </div>
        )}
      </section>

      {/* Statistics Cards - Compact Grid */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="rounded-xl border border-line/60 bg-canvas-elevated/50 p-4 text-center">
          <p className="eyebrow text-[10px] mb-2">{t("community")}</p>
          <div className="flex items-baseline justify-center gap-1">
             <span className="display text-2xl text-ink font-bold">{story.reactionCount}</span>
             <span className="text-[10px] uppercase tracking-wider text-muted/70">{t("reactions", { count: story.reactionCount })}</span>
          </div>
        </div>
        <div className="rounded-xl border border-line/60 bg-canvas-elevated/50 p-4 text-center">
          <p className="eyebrow text-[10px] mb-2">{t("dialogue")}</p>
          <div className="flex items-baseline justify-center gap-1">
             <span className="display text-2xl text-ink font-bold">{story.commentCount}</span>
             <span className="text-[10px] uppercase tracking-wider text-muted/70">{t("comments", { count: story.commentCount })}</span>
          </div>
        </div>
        <div className="rounded-xl border border-line/60 bg-canvas-elevated/50 p-4 text-center">
          <p className="eyebrow text-[10px] mb-2">{t("duration")}</p>
          <div className="flex items-baseline justify-center gap-1">
             <span className="display text-xl text-ink font-bold">{story.durationLabel}</span>
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      <section className="panel rounded-xl p-5 md:p-6 border border-line/40 bg-canvas-elevated/30 backdrop-blur-sm mt-8">
        <InteractiveTranscript storyId={story.id} content={story.transcript} />
      </section>

      {/* Interactions Section */}
      <div className="mt-10 space-y-6">
        {/* Reactions Section */}
        <article className="rounded-xl border border-line/60 bg-canvas-elevated/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="eyebrow">{t("interactions")}</p>
            <div className="text-xs text-muted/70 uppercase tracking-wider">
              {story.reactions.length} reactions
            </div>
          </div>

          <div className="mb-5">
            <StoryReactionForm
              storyId={story.id}
              hasHearted={story.viewerHasHearted}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {story.reactions.length > 0 ? (
              story.reactions.map((reaction) => (
                <div
                  key={reaction.type}
                  className="flex items-center justify-between rounded-lg border border-line/40 bg-canvas-depth/50 px-3 py-2.5 hover:bg-canvas-depth/70 transition-colors"
                >
                  <span className="text-xs uppercase tracking-[0.15em] text-muted/80 font-medium">
                    {reaction.label}
                  </span>
                  <span className="display text-xl text-ink font-bold">
                    {reaction.count}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-6">
                <p className="text-sm text-muted/70 italic">
                  {t("noReactionsYet")}
                </p>
              </div>
            )}
          </div>
        </article>

        {/* Comments Section */}
        <article className="rounded-xl border border-line/60 bg-canvas-elevated/40 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <p className="eyebrow">{t("householdConversation")}</p>
            <div className="text-xs text-muted/70 uppercase tracking-wider">
              {story.comments.length} {t("comments", { count: story.comments.length })}
            </div>
          </div>

          <div className="space-y-5 flex-1">
            <StoryCommentForm storyId={story.id} />

            <div className="space-y-4 pt-5 border-t border-line/30">
              {story.comments.length > 0 ? (
                story.comments.map((comment) => (
                  <StoryCommentItem
                    key={comment.id}
                    comment={comment}
                    storyId={story.id}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-line/30 border-dashed p-8 text-center opacity-60">
                  <p className="text-sm text-muted/70">
                    {t("noCommentsYet")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-line/30 flex justify-end">
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
    <div className="animate-pulse space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 bg-muted/10 rounded" />
        <div className="h-8 w-8 bg-muted/10 rounded-full" />
      </div>

      <div className="space-y-2">
        <div className="h-10 w-3/4 bg-ink/10 rounded" />
        <div className="h-4 w-1/2 bg-muted/10 rounded" />
      </div>

      {/* Audio Player */}
      <div className="h-48 bg-black/5 rounded-xl mt-6" />

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="h-16 bg-muted/10 rounded-lg" />
        <div className="h-16 bg-muted/10 rounded-lg" />
        <div className="h-16 bg-muted/10 rounded-lg" />
      </div>

      {/* Transcript */}
      <div className="h-64 bg-muted/10 rounded-lg mt-6" />

      {/* Interactions */}
      <div className="space-y-4">
        <div className="h-32 bg-muted/10 rounded-lg" />
        <div className="h-48 bg-muted/10 rounded-lg" />
      </div>
    </div>
  );
}
