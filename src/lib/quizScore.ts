import type { QuizFormData } from "@/pages/quiz/PublicQuizPage";

export interface ScoreWeights {
  screenTime?: number[];
  symptoms?: number[];
  ageRange?: number[];
  lastVisit?: number[];
  supplements?: number[];
  uvExposure?: number[];
}

interface OptionLike { title: string }

const indexOf = (opts: OptionLike[] | undefined, value: string) => {
  if (!opts || !value) return -1;
  return opts.findIndex((o) => o.title === value);
};

const pickWeight = (weights: number[] | undefined, idx: number, fallback = 50) => {
  if (!weights || idx < 0 || idx >= weights.length) return fallback;
  const v = Number(weights[idx]);
  return isFinite(v) ? v : fallback;
};

interface Options {
  screenTime?: OptionLike[];
  symptoms?: OptionLike[];
  ageRange?: OptionLike[];
  lastVisit?: OptionLike[];
  supplements?: OptionLike[];
  uvExposure?: OptionLike[];
}

/**
 * Variable scoring algorithm. Each question contributes a weighted protection score (0-100).
 * Final score = average of contributing dimensions.
 * Symptoms is multi-select: averages weights of selected items, then inverts not selected count buff.
 */
export function computeProtectionScore(
  data: QuizFormData,
  weights: ScoreWeights,
  options: Options
): number {
  const contributions: number[] = [];

  const screenIdx = indexOf(options.screenTime, data.screenTime);
  if (screenIdx >= 0) contributions.push(pickWeight(weights.screenTime, screenIdx));

  const ageIdx = indexOf(options.ageRange, data.ageRange);
  if (ageIdx >= 0) contributions.push(pickWeight(weights.ageRange, ageIdx));

  const lastIdx = indexOf(options.lastVisit, data.lastVisit);
  if (lastIdx >= 0) contributions.push(pickWeight(weights.lastVisit, lastIdx));

  const supIdx = indexOf(options.supplements, data.supplements);
  if (supIdx >= 0) contributions.push(pickWeight(weights.supplements, supIdx));

  const uvIdx = indexOf(options.uvExposure, data.uvExposure);
  if (uvIdx >= 0) contributions.push(pickWeight(weights.uvExposure, uvIdx));

  // Symptoms: multi-select. Each selected symptom => its weight contributes (lower = worse).
  // If none selected: neutral 75.
  if (options.symptoms && data.symptoms.length > 0) {
    const symWeights = data.symptoms
      .map((s) => indexOf(options.symptoms, s))
      .filter((i) => i >= 0)
      .map((i) => pickWeight(weights.symptoms, i, 60));
    if (symWeights.length > 0) {
      const avg = symWeights.reduce((a, b) => a + b, 0) / symWeights.length;
      // More symptoms = additional penalty
      const penalty = Math.min(15, (symWeights.length - 1) * 5);
      contributions.push(Math.max(0, avg - penalty));
    }
  } else if (options.symptoms) {
    contributions.push(85);
  }

  if (contributions.length === 0) return 50;
  const avg = contributions.reduce((a, b) => a + b, 0) / contributions.length;
  return Math.max(0, Math.min(100, Math.round(avg)));
}
