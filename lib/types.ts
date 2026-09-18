export type DomainId = string;

export type LessonDetails = {
  objectives: string[];
  mentalModel: string;
  steps?: { title: string; detail: string }[];
  sections: {
    title: string;
    paragraphs: string[];
    bullets?: string[];
    code?: { language: string; source: string; caption: string };
  }[];
  scenario?: {
    title: string;
    situation: string;
    walkthrough: string[];
    takeaway: string;
  };
  checks: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
  resources: { title: string; href: string; note: string }[];
};

export type Lesson = {
  id: string;
  title: string;
  duration: number;
  summary: string;
  keyPoints: string[];
  examTraps: string[];
  practice: string;
  details?: LessonDetails;
};

export type Domain = {
  id: DomainId;
  title: string;
  shortTitle: string;
  weight: number;
  color: string;
  description: string;
  lessons: Lesson[];
};

export type Question = {
  id: string;
  number: number;
  domainId: DomainId;
  prompt: string;
  select: number;
  options: { id: string; text: string }[];
  answer: string[];
  explanation: string;
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  domain: string;
};

export type StudyWeek = {
  week: number;
  title: string;
  outcome: string;
  tasks: { id: string; label: string; minutes: number }[];
};

export type Certificate = {
  slug: string;
  provider: string;
  title: string;
  shortTitle: string;
  level: string;
  summary: string;
  updatedAt: string;
  exam: {
    questions: number;
    minutes: number;
    passingScore: string;
    price: string;
    validity: string;
  };
  domains: Domain[];
  questions: Question[];
  flashcards: Flashcard[];
  plan: StudyWeek[];
  resources: { title: string; description: string; href: string; type: 'official' | 'download' }[];
};

export type StudyProgress = {
  version: 1;
  certificateSlug: string;
  completedLessons: string[];
  completedPlanTasks: string[];
  masteredCards: string[];
  questionAttempts: Record<string, { attempts: number; correct: number; lastAnsweredAt: string }>;
  mockAttempts: { id: string; date: string; score: number; domainScores: Record<string, number> }[];
  lastVisitedLesson?: string;
  createdAt: string;
  updatedAt: string;
};

export type ViewId = 'dashboard' | 'guide' | 'flashcards' | 'practice' | 'mock' | 'plan' | 'resources';
