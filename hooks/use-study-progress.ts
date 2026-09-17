'use client';

import { useCallback, useEffect, useState } from 'react';
import { createEmptyProgress, progressKey, readProgress, writeProgress } from '@/lib/progress';
import type { StudyProgress } from '@/lib/types';

export function useStudyProgress(slug: string) {
  const [progress, setProgress] = useState<StudyProgress>(() => createEmptyProgress(slug));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- hydrate browser-owned progress after SSR
    setReady(false);
    setProgress(readProgress(slug));
    setReady(true);
  }, [slug]);

  useEffect(() => {
    if (ready && progress.certificateSlug === slug) writeProgress(progress);
  }, [progress, ready, slug]);

  const toggleLesson = useCallback((id: string) => {
    setProgress((current) => ({
      ...current,
      completedLessons: current.completedLessons.includes(id)
        ? current.completedLessons.filter((item) => item !== id)
        : [...current.completedLessons, id],
      lastVisitedLesson: id,
    }));
  }, []);

  const togglePlanTask = useCallback((id: string) => {
    setProgress((current) => ({
      ...current,
      completedPlanTasks: current.completedPlanTasks.includes(id)
        ? current.completedPlanTasks.filter((item) => item !== id)
        : [...current.completedPlanTasks, id],
    }));
  }, []);

  const toggleMasteredCard = useCallback((id: string) => {
    setProgress((current) => ({
      ...current,
      masteredCards: current.masteredCards.includes(id)
        ? current.masteredCards.filter((item) => item !== id)
        : [...current.masteredCards, id],
    }));
  }, []);

  const recordQuestion = useCallback((id: string, correct: boolean) => {
    setProgress((current) => {
      const existing = current.questionAttempts[id] ?? { attempts: 0, correct: 0, lastAnsweredAt: '' };
      return {
        ...current,
        questionAttempts: {
          ...current.questionAttempts,
          [id]: {
            attempts: existing.attempts + 1,
            correct: existing.correct + (correct ? 1 : 0),
            lastAnsweredAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const recordMock = useCallback((score: number, domainScores: Record<string, number>) => {
    setProgress((current) => ({
      ...current,
      mockAttempts: [
        ...current.mockAttempts,
        { id: crypto.randomUUID(), date: new Date().toISOString(), score, domainScores },
      ],
    }));
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(progressKey(slug));
    setProgress(createEmptyProgress(slug));
  }, [slug]);

  const importProgress = useCallback((value: StudyProgress) => {
    if (value.version !== 1 || value.certificateSlug !== slug) throw new Error('This progress file belongs to a different certificate or version.');
    setProgress(value);
  }, [slug]);

  return { progress, ready, toggleLesson, togglePlanTask, toggleMasteredCard, recordQuestion, recordMock, reset, importProgress };
}
