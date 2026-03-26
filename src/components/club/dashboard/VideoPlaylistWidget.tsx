import React from "react";
import { motion } from "framer-motion";
import { Play, Check, ArrowRight, BookOpen, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import { useMilestone3M } from "@/hooks/useMilestone3M";
import {
  getEligibleTiers,
  getVideosByTier,
  recommendVideo,
} from "@/lib/video-library";

// Cover images
import cover11 from "@/assets/cover-1-1.jpg";
import cover12 from "@/assets/cover-1-2.jpg";
import cover13 from "@/assets/cover-1-3.jpg";
import cover14 from "@/assets/cover-1-4.jpg";
import cover21 from "@/assets/cover-2-1.jpg";
import cover22 from "@/assets/cover-2-2.jpg";
import cover23 from "@/assets/cover-2-3.jpg";
import cover24 from "@/assets/cover-2-4.jpg";

const coverMap: Record<string, string> = {
  "cover-1-1": cover11, "cover-1-2": cover12, "cover-1-3": cover13, "cover-1-4": cover14,
  "cover-2-1": cover21, "cover-2-2": cover22, "cover-2-3": cover23, "cover-2-4": cover24,
};

const VideoPlaylistWidget: React.FC = () => {
  const navigate = useNavigate();
  const milestone = useMilestone3M();
  const videoProgress = useVideoProgress();

  const activeMonths = milestone.state.active_months;
  const isElite = milestone.state.elite_status;
  const eligibleTiers = getEligibleTiers(activeMonths, isElite);

  const firstTierVideos = eligibleTiers.length > 0
    ? getVideosByTier(eligibleTiers[0]).slice(0, 5)
    : [];

  const recommended = recommendVideo(
    activeMonths, isElite,
    milestone.state.average_consistency,
    videoProgress.watchedIds,
  );

  const heroVideo = recommended ?? firstTierVideos[0];
  if (!heroVideo) return null;

  const heroCover = coverMap[heroVideo.coverImage];
  const playlistVideos = firstTierVideos.filter((v) => v.id !== heroVideo.id).slice(0, 3);

  return (
    <Card className="border border-border shadow-md overflow-hidden bg-card">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-5 lg:p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <BookOpen className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Aprender Saúde</h2>
              <p className="text-sm text-muted-foreground">Vídeos educativos selecionados para você</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/club/content")}
            className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Ver tudo
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Two-column layout: Player + Playlist */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 p-5 lg:p-6">
          {/* Column 1 — Hero Player (3/5) */}
          <div
            className="lg:col-span-3 relative rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => navigate("/club/content")}
          >
            <div className="relative w-full h-full min-h-[240px]">
              {heroCover ? (
                <img
                  src={heroCover}
                  alt={heroVideo.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="h-full w-full bg-secondary" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  className="h-14 w-14 rounded-full bg-background/90 backdrop-blur-md flex items-center justify-center shadow-2xl ring-2 ring-background/20"
                >
                  <Play className="h-6 w-6 text-accent ml-0.5" />
                </motion.div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold text-accent-foreground uppercase tracking-widest">
                  Recomendado
                </span>
                <h3 className="text-xl font-bold text-background mt-2 leading-tight drop-shadow-lg">
                  {heroVideo.title}
                </h3>
                <p className="text-sm text-background/70 mt-1 line-clamp-1">{heroVideo.subtitle}</p>
                <span className="inline-flex items-center gap-1 mt-2 rounded-md bg-background/15 backdrop-blur-sm px-2 py-1 text-[11px] text-background/80">
                  <Clock className="h-3 w-3" />
                  {heroVideo.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2 — Playlist (2/5) */}
          <div className="lg:col-span-2 flex flex-col gap-2 lg:pl-4 mt-4 lg:mt-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 lg:mb-0">
              Próximos
            </p>
            {playlistVideos.map((video) => {
              const cover = coverMap[video.coverImage];
              const completed = videoProgress.isCompleted(video.id);
              return (
                <button
                  key={video.id}
                  onClick={() => navigate("/club/content")}
                  className="group/item flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-2.5 text-left transition-all hover:shadow-md hover:border-accent/30 hover:bg-secondary/50"
                >
                  <div className="relative h-[60px] w-[100px] shrink-0 rounded-lg overflow-hidden">
                    {cover ? (
                      <img src={cover} alt={video.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-secondary" />
                    )}
                    <div className="absolute inset-0 bg-foreground/10" />
                    {completed ? (
                      <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                        <Check className="h-3 w-3 text-accent-foreground" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <div className="h-7 w-7 rounded-full bg-background/80 flex items-center justify-center">
                          <Play className="h-3 w-3 text-accent ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium leading-snug line-clamp-2",
                      completed ? "text-muted-foreground" : "text-foreground"
                    )}>
                      {video.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {video.duration}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPlaylistWidget;
