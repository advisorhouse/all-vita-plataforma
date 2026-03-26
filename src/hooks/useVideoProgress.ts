import { useState, useCallback } from "react";
import type { VideoProgress } from "@/lib/video-library";

const STORAGE_KEY = "vl_video_progress";

function loadProgress(): Record<string, VideoProgress> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function useVideoProgress() {
  const [progress, setProgress] = useState<Record<string, VideoProgress>>(loadProgress);

  const persist = (next: Record<string, VideoProgress>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProgress(next);
  };

  const updateProgress = useCallback((videoId: string, percent: number) => {
    const prev = loadProgress();
    const existing = prev[videoId];
    const completed = percent >= 70;
    const entry: VideoProgress = {
      videoId,
      percentWatched: Math.max(existing?.percentWatched ?? 0, percent),
      completed: existing?.completed || completed,
      lastWatchedAt: new Date().toISOString(),
    };
    persist({ ...prev, [videoId]: entry });
  }, []);

  const getProgress = useCallback((videoId: string): VideoProgress | null => {
    return progress[videoId] ?? null;
  }, [progress]);

  const isCompleted = useCallback((videoId: string): boolean => {
    return progress[videoId]?.completed ?? false;
  }, [progress]);

  const completedCount = Object.values(progress).filter((p) => p.completed).length;

  const watchedIds = Object.keys(progress);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress({});
  }, []);

  return {
    progress,
    updateProgress,
    getProgress,
    isCompleted,
    completedCount,
    watchedIds,
    reset,
  };
}
