import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Check, ChevronRight, ChevronLeft, ArrowLeft, Clock, Lock,
  Eye, Sparkles, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useMilestone3M } from "@/hooks/useMilestone3M";
import { useVideoProgress } from "@/hooks/useVideoProgress";
import {
  TIERS,
  VIDEO_CATALOG,
  getEligibleTiers,
  getVideosByTier,
  getRelatedVideos,
  recommendVideo,
  type VideoItem,
  type VideoTier,
  type TierInfo,
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
import cover31 from "@/assets/cover-3-1.jpg";
import cover32 from "@/assets/cover-3-2.jpg";
import cover33 from "@/assets/cover-3-3.jpg";
import cover34 from "@/assets/cover-3-4.jpg";
import cover41 from "@/assets/cover-4-1.jpg";
import cover42 from "@/assets/cover-4-2.jpg";
import cover43 from "@/assets/cover-4-3.jpg";
import cover44 from "@/assets/cover-4-4.jpg";

const coverMap: Record<string, string> = {
  "cover-1-1": cover11, "cover-1-2": cover12, "cover-1-3": cover13, "cover-1-4": cover14,
  "cover-2-1": cover21, "cover-2-2": cover22, "cover-2-3": cover23, "cover-2-4": cover24,
  "cover-3-1": cover31, "cover-3-2": cover32, "cover-3-3": cover33, "cover-3-4": cover34,
  "cover-4-1": cover41, "cover-4-2": cover42, "cover-4-3": cover43, "cover-4-4": cover44,
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const ClubContent: React.FC = () => {
  const milestone = useMilestone3M();
  const videoProgress = useVideoProgress();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [simulatedPercent, setSimulatedPercent] = useState(0);

  const activeMonths = milestone.state.active_months;
  const isElite = milestone.state.elite_status;
  const eligibleTiers = getEligibleTiers(activeMonths, isElite);

  const recommended = recommendVideo(
    activeMonths, isElite,
    milestone.state.average_consistency,
    videoProgress.watchedIds
  );

  const totalWatched = videoProgress.completedCount;
  const totalAvailable = VIDEO_CATALOG.filter(v => eligibleTiers.includes(v.tier)).length;

  // ─── Video Detail View ─────────────────────────────────────
  if (selectedVideo) {
    const related = getRelatedVideos(selectedVideo.id, 3);
    const progress = videoProgress.getProgress(selectedVideo.id);
    const completed = videoProgress.isCompleted(selectedVideo.id);
    const cover = coverMap[selectedVideo.coverImage];

    const handleSimulateWatch = () => {
      const next = Math.min(simulatedPercent + 25, 100);
      setSimulatedPercent(next);
      videoProgress.updateProgress(selectedVideo.id, next);
    };

    return (
      <div className="space-y-6 pb-12">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => { setSelectedVideo(null); setSimulatedPercent(0); }}
          className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors pt-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar aos vídeos
        </motion.button>

        {/* Hero player */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border border-border shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={cover}
                    alt={selectedVideo.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  <button
                    onClick={handleSimulateWatch}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "h-16 w-16 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm",
                        completed ? "bg-accent" : "bg-background/90"
                      )}
                    >
                      {completed ? (
                        <Check className="h-6 w-6 text-accent-foreground" />
                      ) : (
                        <Play className="h-6 w-6 text-foreground ml-1" />
                      )}
                    </motion.div>
                  </button>

                  {/* Bottom info */}
                  <div className="absolute bottom-4 left-5 right-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          {selectedVideo.tags.map(t => (
                            <span key={t} className="rounded-full bg-background/20 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-background uppercase tracking-wider">
                              {t}
                            </span>
                          ))}
                        </div>
                        <h1 className="text-2xl font-semibold text-background">{selectedVideo.title}</h1>
                        <p className="text-sm text-background/70 mt-0.5">{selectedVideo.subtitle}</p>
                      </div>
                      <span className="rounded-lg bg-background/20 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-background">
                        {selectedVideo.duration}
                      </span>
                    </div>
                  </div>
                </AspectRatio>
              </div>

              {/* Progress bar */}
              {(simulatedPercent > 0 || (progress && progress.percentWatched > 0)) && (
                <div className="px-5 py-4 border-t border-border">
                  <Progress
                    value={Math.max(simulatedPercent, progress?.percentWatched ?? 0)}
                    className="h-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {completed ? "Conteúdo concluído" : `${Math.max(simulatedPercent, progress?.percentWatched ?? 0)}% assistido`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Description */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border border-border shadow-sm">
            <CardContent className="p-6">
              <p className="text-base text-muted-foreground leading-relaxed">
                {selectedVideo.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Related */}
        {related.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4">
            <p className="text-base font-semibold text-foreground">
              Assista também
            </p>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {related.map((rv) => (
                <NetflixCard
                  key={rv.id}
                  video={rv}
                  completed={videoProgress.isCompleted(rv.id)}
                  progress={videoProgress.getProgress(rv.id)?.percentWatched ?? 0}
                  onClick={() => { setSelectedVideo(rv); setSimulatedPercent(0); }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // ─── Library View (Netflix-style) ──────────────────────────
  return (
    <div className="space-y-8 pb-12">
      {/* Hero — featured / recommended */}
      {recommended && (
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <Card
            className="border border-border shadow-sm overflow-hidden cursor-pointer group"
            onClick={() => setSelectedVideo(recommended)}
          >
            <CardContent className="p-0">
              <div className="relative">
                <AspectRatio ratio={21 / 9}>
                  <img
                    src={coverMap[recommended.coverImage]}
                    alt={recommended.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center px-6 sm:px-8">
                    <div className="max-w-md space-y-3">
                      <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                        Recomendado para você
                      </span>
                      <h2 className="text-2xl font-semibold text-background leading-tight">
                        {recommended.title}
                      </h2>
                      <p className="text-sm text-background/70 leading-relaxed line-clamp-2">
                        {recommended.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 rounded-xl bg-background/90 px-5 py-3 text-base font-medium text-foreground shadow-sm">
                          <Play className="h-5 w-5" />
                          Assistir
                        </div>
                        <span className="text-sm text-background/60 flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {recommended.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </AspectRatio>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats bar */}
      <motion.div custom={0.5} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{totalWatched}</span> de {totalAvailable} assistidos
            </span>
          </div>
          <div className="flex-1">
            <Progress value={totalAvailable > 0 ? (totalWatched / totalAvailable) * 100 : 0} className="h-2" />
          </div>
        </div>
      </motion.div>

      {/* Tier rows — Netflix horizontal scroll */}
      {TIERS.map((tier, tierIndex) => {
        const isEligible = eligibleTiers.includes(tier.id);
        const videos = getVideosByTier(tier.id);

        return (
          <motion.div
            key={tier.id}
            custom={tierIndex + 1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {/* Tier header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isEligible && <Lock className="h-4 w-4 text-muted-foreground/40" />}
                <h2 className={cn(
                  "text-lg font-semibold",
                  isEligible ? "text-foreground" : "text-muted-foreground/50"
                )}>
                  {tier.label}
                </h2>
              </div>
              {isEligible && (
                <span className="text-sm text-muted-foreground">
                  {videos.filter(v => videoProgress.isCompleted(v.id)).length}/{videos.length}
                </span>
              )}
            </div>
            <p className={cn(
              "text-sm -mt-1",
              isEligible ? "text-muted-foreground" : "text-muted-foreground/40"
            )}>
              {isEligible ? tier.subtitle : getTierLockMessage(tier)}
            </p>

            {/* Horizontal scroll row */}
            {isEligible ? (
              <ScrollRow>
                {videos.map((video) => (
                  <NetflixCard
                    key={video.id}
                    video={video}
                    completed={videoProgress.isCompleted(video.id)}
                    progress={videoProgress.getProgress(video.id)?.percentWatched ?? 0}
                    onClick={() => setSelectedVideo(video)}
                  />
                ))}
              </ScrollRow>
            ) : (
              <ScrollRow>
                {videos.map((video) => (
                  <LockedCard key={video.id} video={video} />
                ))}
              </ScrollRow>
            )}
          </motion.div>
        );
      })}

      {/* Debug */}
      {process.env.NODE_ENV === "development" && (
        <div className="pt-4 border-t border-border space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            Debug · Months: {activeMonths} · Elite: {isElite ? "Yes" : "No"}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="text-[11px] h-7 rounded-xl" onClick={videoProgress.reset}>Reset</Button>
            <Button variant="outline" size="sm" className="text-[11px] h-7 rounded-xl" onClick={() => milestone.setMonths(1)}>1m</Button>
            <Button variant="outline" size="sm" className="text-[11px] h-7 rounded-xl" onClick={() => milestone.setMonths(4)}>4m</Button>
            <Button variant="outline" size="sm" className="text-[11px] h-7 rounded-xl" onClick={() => milestone.setMonths(13)}>13m</Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Horizontal Scroll Container ─────────────────────────────
const ScrollRow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative group/row">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-background to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-background to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {children}
      </div>
    </div>
  );
};

// ─── Netflix-style Video Card ────────────────────────────────
interface NetflixCardProps {
  video: VideoItem;
  completed: boolean;
  progress: number;
  onClick: () => void;
}

const NetflixCard: React.FC<NetflixCardProps> = ({ video, completed, progress, onClick }) => {
  const cover = coverMap[video.coverImage];

  return (
    <button
      onClick={onClick}
      className="group/card flex-shrink-0 w-[240px] sm:w-[260px] rounded-2xl overflow-hidden border border-border bg-card text-left transition-all hover:shadow-lg hover:border-accent/30"
      style={{ scrollSnapAlign: "start" }}
    >
      {/* Cover */}
      <div className="relative h-[140px] sm:h-[156px] overflow-hidden">
        <img
          src={cover}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm",
            completed ? "bg-accent" : "bg-background/90"
          )}>
            {completed ? (
              <Check className="h-5 w-5 text-accent-foreground" />
            ) : (
              <Play className="h-5 w-5 text-foreground ml-0.5" />
            )}
          </div>
        </div>

        {/* Duration badge */}
        <span className="absolute bottom-2.5 right-2.5 rounded-lg bg-foreground/70 px-2 py-1 text-xs font-medium text-background backdrop-blur-sm">
          {video.duration}
        </span>

        {/* Progress bar at bottom of thumbnail */}
        {progress > 0 && !completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/10">
            <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        {completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-1">
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">{video.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{video.subtitle}</p>
        <div className="flex items-center gap-2 pt-1.5">
          {video.tags.slice(0, 2).map(t => (
            <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};

// ─── Locked Card ─────────────────────────────────────────────
const LockedCard: React.FC<{ video: VideoItem }> = ({ video }) => (
  <div
    className="flex-shrink-0 w-[240px] sm:w-[260px] rounded-2xl overflow-hidden border border-border/50 bg-card/50 opacity-40"
    style={{ scrollSnapAlign: "start" }}
  >
    <div className="relative h-[140px] sm:h-[156px] bg-secondary/30 flex items-center justify-center">
      <Lock className="h-6 w-6 text-muted-foreground/30" />
    </div>
    <div className="p-4 space-y-1">
      <p className="text-sm font-medium text-muted-foreground/50 line-clamp-2">{video.title}</p>
      <p className="text-xs text-muted-foreground/30 line-clamp-1">{video.subtitle}</p>
    </div>
  </div>
);

function getTierLockMessage(tier: TierInfo): string {
  if (tier.requiresElite) return "Disponível para membros Elite Vision.";
  return `Disponível após ${tier.minMonths} ${tier.minMonths === 1 ? "mês" : "meses"} de jornada.`;
}

export default ClubContent;
