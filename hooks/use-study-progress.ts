'use client';

import { useCallback, useEffect, useState } from 'react';
import { createEmptyProgress, progressKey, readProgress, writeProgress } from '@/lib/progress';
import type { CardRating, MockAttempt, StudyProgress } from '@/lib/types';

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000).toISOString();

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

  const reviewCard = useCallback((id: string, rating: CardRating) => {
    setProgress((current) => ({
      ...current,
      ...(() => {
        const previous = current.cardReviews[id];
        const ease = Math.max(1.3, (previous?.ease ?? 2.5) + (rating === 'again' ? -0.2 : rating === 'hard' ? -0.15 : rating === 'easy' ? 0.15 : 0));
        const repetitions = rating === 'again' ? 0 : (previous?.repetitions ?? 0) + 1;
        const previousInterval = previous?.intervalDays ?? 0;
        const intervalDays = rating === 'again' ? 1 : rating === 'hard' ? Math.max(1, Math.round(previousInterval * 1.2) || 1) : rating === 'easy' ? Math.max(4, Math.round((previousInterval || 2) * ease * 1.3)) : repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.max(4, Math.round(previousInterval * ease));
        const now = new Date();
        const mastered = rating !== 'again' && repetitions >= 2;
        return {
          cardReviews: {
            ...current.cardReviews,
            [id]: { dueAt: addDays(now, intervalDays), lastReviewedAt: now.toISOString(), intervalDays, ease, repetitions, lastRating: rating },
          },
          masteredCards: mastered
            ? Array.from(new Set([...current.masteredCards, id]))
            : current.masteredCards.filter((item) => item !== id),
        };
      })(),
    }));
  }, []);

  const recordQuestion = useCallback((id: string, correct: boolean, confidence?: 'low' | 'medium' | 'high') => {
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
            lastCorrect: correct,
            lastConfidence: confidence,
          },
        },
      };
    });
  }, []);

  const recordDiagnostic = useCallback((score: number, domainScores: Record<string, number>, incorrectQuestionIds: string[]) => {
    setProgress((current) => ({
      ...current,
      diagnosticAttempts: [...current.diagnosticAttempts, { id: crypto.randomUUID(), date: new Date().toISOString(), score, domainScores, incorrectQuestionIds }],
    }));
  }, []);

  const recordScenario = useCallback((scenarioId: string, score: number, total: number) => {
    setProgress((current) => ({
      ...current,
      scenarioAttempts: [...current.scenarioAttempts.filter((item) => item.scenarioId !== scenarioId), { scenarioId, score, total, date: new Date().toISOString() }],
    }));
  }, []);

  const recordTeachBack = useCallback((lessonId: string, response: string, rating: 'needs-work' | 'clear') => {
    setProgress((current) => ({
      ...current,
      teachBacks: { ...current.teachBacks, [lessonId]: { lessonId, response, rating, updatedAt: new Date().toISOString() } },
    }));
  }, []);

  const recordMock = useCallback((attempt: Omit<MockAttempt, 'id' | 'date'>) => {
    setProgress((current) => ({
      ...current,
      mockAttempts: [
        ...current.mockAttempts,
        { ...attempt, id: crypto.randomUUID(), date: new Date().toISOString() },
      ],
    }));
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(progressKey(slug));
    setProgress(createEmptyProgress(slug));
  }, [slug]);

  const importProgress = useCallback((value: StudyProgress) => {
    if (value.version !== 1 || value.certificateSlug !== slug) throw new Error('This progress file belongs to a different certificate or version.');
    setProgress({ ...createEmptyProgress(slug), ...value });
  }, [slug]);

  return { progress, ready, toggleLesson, togglePlanTask, reviewCard, recordQuestion, recordDiagnostic, recordScenario, recordTeachBack, recordMock, reset, importProgress };
}
