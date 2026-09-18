import type { Certificate, Domain, Flashcard, StudyProgress } from '@/lib/types';

const normalize = (value: string) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();

export function cardDomainId(card: Flashcard, certificate: Certificate) {
  const cardTokens = new Set(normalize(card.domain).split(' '));
  return certificate.domains
    .map((domain) => {
      const tokens = new Set(`${normalize(domain.shortTitle)} ${normalize(domain.title)}`.split(' '));
      const overlap = [...cardTokens].filter((token) => token.length > 2 && tokens.has(token)).length;
      return { id: domain.id, overlap };
    })
    .sort((a, b) => b.overlap - a.overlap)[0]?.id ?? certificate.domains[0].id;
}

export function dueCards(certificate: Certificate, progress: StudyProgress, domainId?: string) {
  const now = Date.now();
  return certificate.flashcards.filter((card) => {
    if (domainId && cardDomainId(card, certificate) !== domainId) return false;
    const review = progress.cardReviews[card.id];
    return !review || new Date(review.dueAt).getTime() <= now;
  });
}

export type DomainMastery = {
  domain: Domain;
  score: number;
  status: 'Not started' | 'Learning' | 'Practicing' | 'Strong' | 'Mastered';
  components: {
    lessons: number;
    practice: number;
    flashcards: number;
    diagnostic: number;
    mock: number;
    scenarios: number;
    teachBack: number;
  };
};

const ratio = (value: number, total: number) => total ? value / total : 0;

export function calculateDomainMastery(certificate: Certificate, progress: StudyProgress): DomainMastery[] {
  const latestDiagnostic = progress.diagnosticAttempts.at(-1);
  const latestMock = progress.mockAttempts.at(-1);

  return certificate.domains.map((domain) => {
    const questions = certificate.questions.filter((question) => question.domainId === domain.id);
    const attempts = questions.map((question) => progress.questionAttempts[question.id]).filter(Boolean);
    const attemptedQuestions = attempts.length;
    const totalAttempts = attempts.reduce((sum, item) => sum + item.attempts, 0);
    const correctAttempts = attempts.reduce((sum, item) => sum + item.correct, 0);
    const breadth = Math.min(1, attemptedQuestions / Math.min(6, questions.length));
    const cards = certificate.flashcards.filter((card) => cardDomainId(card, certificate) === domain.id);
    const retainedCards = cards.filter((card) => (progress.cardReviews[card.id]?.repetitions ?? 0) >= 2).length;
    const scenarioAttempts = progress.scenarioAttempts.filter((item) => item.scenarioId.startsWith(`${domain.id}-`));
    const scenarioScore = scenarioAttempts.length ? scenarioAttempts.reduce((sum, item) => sum + ratio(item.score, item.total), 0) / scenarioAttempts.length : 0;
    const teachBacks = domain.lessons.filter((lesson) => progress.teachBacks[lesson.id]?.rating === 'clear').length;

    const components = {
      lessons: Math.round(ratio(domain.lessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length, domain.lessons.length) * 100),
      practice: Math.round(ratio(correctAttempts, totalAttempts) * breadth * 100),
      flashcards: Math.round(ratio(retainedCards, cards.length) * 100),
      diagnostic: latestDiagnostic?.domainScores[domain.id] ?? 0,
      mock: latestMock?.domainScores[domain.id] ?? 0,
      scenarios: Math.round(scenarioScore * 100),
      teachBack: Math.round(ratio(teachBacks, domain.lessons.length) * 100),
    };
    const score = Math.round(
      components.lessons * 0.15 +
      components.practice * 0.25 +
      components.flashcards * 0.2 +
      components.diagnostic * 0.15 +
      components.mock * 0.15 +
      components.scenarios * 0.05 +
      components.teachBack * 0.05,
    );
    const status = score === 0 ? 'Not started' : score < 40 ? 'Learning' : score < 70 ? 'Practicing' : score < 85 ? 'Strong' : 'Mastered';
    return { domain, score, status, components };
  });
}

export function overallMastery(certificate: Certificate, progress: StudyProgress) {
  const domains = calculateDomainMastery(certificate, progress);
  return Math.round(domains.reduce((sum, item) => sum + item.score * (item.domain.weight / 100), 0));
}

export function weakestDomain(certificate: Certificate, progress: StudyProgress) {
  return [...calculateDomainMastery(certificate, progress)].sort((a, b) => a.score - b.score)[0];
}

export function readinessLabel(score: number) {
  if (score < 35) return 'Building foundations';
  if (score < 60) return 'Developing';
  if (score < 75) return 'Nearly ready';
  if (score < 85) return 'Practice ready';
  return 'Exam ready';
}
