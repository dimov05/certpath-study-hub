import type { StudyProgress } from '@/lib/types';

export const progressKey = (slug: string) => `certpath:${slug}:progress:v1`;

export function createEmptyProgress(slug: string): StudyProgress {
  const now = new Date().toISOString();
  return {
    version: 1,
    certificateSlug: slug,
    completedLessons: [],
    completedPlanTasks: [],
    masteredCards: [],
    cardReviews: {},
    questionAttempts: {},
    diagnosticAttempts: [],
    scenarioAttempts: [],
    teachBacks: {},
    mockAttempts: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function readProgress(slug: string): StudyProgress {
  const empty = createEmptyProgress(slug);
  if (typeof window === 'undefined') return empty;
  const raw = window.localStorage.getItem(progressKey(slug));
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw) as Partial<StudyProgress>;
    if (parsed.version !== 1 || parsed.certificateSlug !== slug) return empty;
    return { ...empty, ...parsed } as StudyProgress;
  } catch {
    return empty;
  }
}

export function writeProgress(progress: StudyProgress) {
  window.localStorage.setItem(
    progressKey(progress.certificateSlug),
    JSON.stringify({ ...progress, updatedAt: new Date().toISOString() }),
  );
}

export function downloadProgress(progress: StudyProgress) {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${progress.certificateSlug}-progress.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
