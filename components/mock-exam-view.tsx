import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, Flag, RotateCcw, Target, Trophy, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Progress } from '@/components/ui/progress';
import { overallMastery, readinessLabel } from '@/lib/study-engine';
import type { Certificate, MockAttempt, Question, StudyProgress } from '@/lib/types';

const sameAnswers = (left: string[] = [], right: string[]) => [...left].sort().join(',') === [...right].sort().join(',');
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
type ExamMode = { id: string; label: string; questions: number; minutes: number; description: string };

function weightedQuestions(certificate: Certificate, count: number) {
  if (count >= certificate.questions.length) return shuffle(certificate.questions);
  const allocations = certificate.domains.map((domain) => {
    const exact = count * domain.weight / 100;
    return { domain, count: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let remaining = count - allocations.reduce((sum, item) => sum + item.count, 0);
  for (const item of [...allocations].sort((a, b) => b.remainder - a.remainder)) { if (!remaining) break; item.count += 1; remaining -= 1; }
  return shuffle(allocations.flatMap(({ domain, count: take }) => shuffle(certificate.questions.filter((question) => question.domainId === domain.id)).slice(0, take)));
}

export function MockExamView({ certificate, progress, onRecordMock }: { certificate: Certificate; progress: StudyProgress; onRecordMock: (attempt: Omit<MockAttempt, 'id' | 'date'>) => void }) {
  const latestAttempt = progress.mockAttempts.at(-1);
  const modes: ExamMode[] = [
    { id: 'full', label: 'Full simulation', questions: certificate.questions.length, minutes: certificate.exam.minutes, description: 'Complete randomized exam using the official domain weighting.' },
    { id: 'sprint', label: '30-question sprint', questions: 30, minutes: Math.round(certificate.exam.minutes / 2), description: 'Blueprint-weighted practice with half the time and question count.' },
    { id: 'missed', label: 'Retry missed concepts', questions: Math.min(20, latestAttempt?.incorrectQuestionIds?.length ?? 0), minutes: 40, description: 'A focused retake using questions missed on your latest mock.' },
  ];
  const [modeId, setModeId] = useState('full');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startingSeconds, setStartingSeconds] = useState(0);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [confidence, setConfidence] = useState<Record<string, 'low' | 'medium' | 'high'>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [result, setResult] = useState<(Omit<MockAttempt, 'id' | 'date'> & { previousScore?: number }) | null>(null);
  const question = examQuestions[current];
  const answeredCount = Object.keys(answers).filter((id) => answers[id]?.length).length;
  const domainMap = useMemo(() => Object.fromEntries(certificate.domains.map((item) => [item.id, item])), [certificate.domains]);

  const submitExam = useCallback(() => {
    if (!examQuestions.length) return;
    let correct = 0;
    const incorrect: string[] = [];
    const unanswered: string[] = [];
    const domainTotals: Record<string, { correct: number; total: number }> = {};
    const confidenceTotals: Record<string, { correct: number; total: number }> = {};
    for (const item of examQuestions) {
      domainTotals[item.domainId] ??= { correct: 0, total: 0 };
      domainTotals[item.domainId].total += 1;
      const isCorrect = sameAnswers(answers[item.id], item.answer);
      if (isCorrect) { correct += 1; domainTotals[item.domainId].correct += 1; } else incorrect.push(item.id);
      if (!answers[item.id]?.length) unanswered.push(item.id);
      const level = confidence[item.id];
      if (level) { confidenceTotals[level] ??= { correct: 0, total: 0 }; confidenceTotals[level].total += 1; if (isCorrect) confidenceTotals[level].correct += 1; }
    }
    const score = Math.round(correct / examQuestions.length * 100);
    const domainScores = Object.fromEntries(Object.entries(domainTotals).map(([id, value]) => [id, Math.round(value.correct / value.total * 100)]));
    const confidenceAccuracy = Object.fromEntries(Object.entries(confidenceTotals).map(([level, value]) => [level, Math.round(value.correct / value.total * 100)]));
    const attempt = { score, domainScores, mode: modeId, timeSpentSeconds: startingSeconds - seconds, incorrectQuestionIds: incorrect, unansweredQuestionIds: unanswered, flaggedQuestionIds: flagged, confidenceAccuracy };
    setResult({ ...attempt, previousScore: progress.mockAttempts.at(-1)?.score });
    setStarted(false);
    onRecordMock(attempt);
  }, [answers, confidence, examQuestions, flagged, modeId, onRecordMock, progress.mockAttempts, seconds, setResult, setStarted, startingSeconds]);

  useEffect(() => {
    if (!started || result) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [started, result]);
  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- time expiry submits the active exam
    if (started && seconds === 0 && !result) submitExam();
  }, [seconds, started, result, submitExam]);

  const begin = (requestedMode = modeId) => {
    const mode = modes.find((item) => item.id === requestedMode) ?? modes[0];
    const missedIds = latestAttempt?.incorrectQuestionIds ?? [];
    const questions = requestedMode === 'missed'
      ? shuffle(certificate.questions.filter((item) => missedIds.includes(item.id))).slice(0, mode.questions)
      : weightedQuestions(certificate, mode.questions);
    if (!questions.length) return;
    const duration = mode.minutes * 60;
    setModeId(requestedMode); setExamQuestions(questions); setStarted(true); setSeconds(duration); setStartingSeconds(duration); setCurrent(0); setAnswers({}); setConfidence({}); setFlagged([]); setResult(null);
  };
  const choose = (option: string) => {
    if (!question || result) return;
    const existing = answers[question.id] ?? [];
    const next = question.select === 1 ? [option] : existing.includes(option) ? existing.filter((item) => item !== option) : existing.length < question.select ? [...existing, option] : existing;
    setAnswers((value) => ({ ...value, [question.id]: next }));
  };
  const timer = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  if (!started && !result) {
    const mastery = overallMastery(certificate, progress);
    const selectedMode = modes.find((item) => item.id === modeId) ?? modes[0];
    return <div className="mx-auto max-w-5xl"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Timed simulation</p><h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">Mock exam</h1><p className="mx-auto mt-3 max-w-2xl leading-7 text-muted-foreground">Randomized, blueprint-weighted simulations with confidence calibration, focused retakes, attempt comparison, and readiness tracking.</p></div>
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_310px]"><Card><CardContent className="p-6 sm:p-8"><label className="text-sm font-semibold" htmlFor="exam-mode">Choose exam mode</label><NativeSelect id="exam-mode" className="mt-2 w-full" value={modeId} onChange={(event) => setModeId(event.target.value)}>{modes.map((mode) => <NativeSelectOption key={mode.id} value={mode.id} disabled={mode.id === 'missed' && !mode.questions}>{mode.label}{mode.id === 'missed' && !mode.questions ? ' · complete a mock first' : ''}</NativeSelectOption>)}</NativeSelect><p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedMode.description}</p><div className="mt-6 grid grid-cols-3 gap-3">{[[selectedMode.questions, 'Questions'], [selectedMode.minutes, 'Minutes'], ['80%', 'Target']].map(([value, label]) => <div key={label as string} className="rounded-xl bg-muted/60 p-4 text-center"><p className="font-heading text-2xl font-semibold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>)}</div><div className="mt-6 rounded-xl bg-primary p-5 text-primary-foreground"><p className="font-semibold">Exam conditions</p><ul className="mt-3 grid gap-2 text-sm text-primary-foreground/75 sm:grid-cols-2"><li>• Explanations appear only after submission.</li><li>• Exact match is required for multi-select.</li><li>• Flag uncertain questions and keep moving.</li><li>• Rate confidence before leaving each item.</li></ul></div><Button className="mt-6 w-full" size="lg" onClick={() => begin()}>Start {selectedMode.label.toLowerCase()} <ArrowRight /></Button></CardContent></Card>
        <aside className="space-y-4"><Card className="border-0 bg-accent/35 ring-0"><CardContent className="p-6"><Target className="size-6 text-primary" /><p className="mt-3 text-sm text-muted-foreground">Readiness estimate</p><p className="font-heading text-4xl font-semibold">{mastery}%</p><p className="mt-1 text-sm font-semibold">{readinessLabel(mastery)}</p><p className="mt-3 text-xs leading-5 text-muted-foreground">Combines lessons, practice, retained cards, diagnostic, scenarios, teach-back, and mock evidence.</p></CardContent></Card>{progress.mockAttempts.length > 0 && <Card><CardContent className="p-5"><p className="text-sm font-semibold">Recent attempts</p><div className="mt-3 space-y-3">{progress.mockAttempts.slice(-4).reverse().map((attempt) => <div key={attempt.id} className="flex items-center justify-between border-b pb-2 text-sm last:border-0 last:pb-0"><div><p className="font-medium">{attempt.mode === 'sprint' ? 'Sprint' : attempt.mode === 'missed' ? 'Focused retake' : 'Full exam'}</p><p className="text-xs text-muted-foreground">{new Date(attempt.date).toLocaleDateString()}</p></div><strong>{attempt.score}%</strong></div>)}</div></CardContent></Card>}</aside></div>
    </div>;
  }

  if (result) {
    const passed = result.score >= 80;
    const selected = answers[question.id] ?? [];
    const delta = result.previousScore === undefined ? null : result.score - result.previousScore;
    return <div className="mx-auto max-w-6xl"><div className="grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)]"><aside><Card className={passed ? 'bg-emerald-50' : 'bg-amber-50'}><CardContent className="p-6 text-center"><Trophy className={`mx-auto size-10 ${passed ? 'text-emerald-700' : 'text-amber-700'}`} /><p className="mt-3 text-sm text-muted-foreground">Final score</p><p className="font-heading text-5xl font-semibold">{result.score}%</p><p className="mt-2 text-sm">{passed ? 'Practice-ready result' : 'Keep repairing weak domains'}</p>{delta !== null && <Badge className="mt-3" variant={delta >= 0 ? 'default' : 'destructive'}>{delta >= 0 ? '+' : ''}{delta} points vs previous</Badge>}</CardContent></Card><div className="mt-4 space-y-3">{certificate.domains.map((domain) => result.domainScores[domain.id] !== undefined && <div key={domain.id} className="rounded-xl border bg-card p-3"><div className="mb-2 flex items-center justify-between text-xs"><span>{domain.shortTitle}</span><strong>{result.domainScores[domain.id]}%</strong></div><Progress value={result.domainScores[domain.id]} /></div>)}</div><Card className="mt-4"><CardContent className="p-4"><p className="text-sm font-semibold">Confidence calibration</p><div className="mt-3 grid grid-cols-3 gap-2">{(['low', 'medium', 'high'] as const).map((level) => <div key={level} className="rounded-lg bg-muted/60 p-2 text-center"><p className="text-xs capitalize text-muted-foreground">{level}</p><p className="font-semibold">{result.confidenceAccuracy?.[level] ?? '—'}{result.confidenceAccuracy?.[level] !== undefined ? '%' : ''}</p></div>)}</div><p className="mt-3 text-xs leading-5 text-muted-foreground">High confidence with low accuracy signals a dangerous blind spot.</p></CardContent></Card><div className="mt-4 grid gap-2"><Button onClick={() => begin('missed')} disabled={!result.incorrectQuestionIds?.length}><RotateCcw /> Retry missed concepts</Button><Button variant="outline" onClick={() => { setResult(null); setExamQuestions([]); }}>Choose another exam</Button></div></aside>
      <section><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Review answers</p><h1 className="font-heading text-2xl font-semibold">Question {current + 1}</h1></div><div className="flex gap-2"><Button variant="outline" size="icon" disabled={current === 0} onClick={() => setCurrent((value) => value - 1)}><ArrowLeft /></Button><Button variant="outline" size="icon" disabled={current === examQuestions.length - 1} onClick={() => setCurrent((value) => value + 1)}><ArrowRight /></Button></div></div><Card><CardContent className="p-6"><div className="flex gap-2"><Badge variant="outline">{domainMap[question.domainId].shortTitle}</Badge>{confidence[question.id] && <Badge variant="secondary">{confidence[question.id]} confidence</Badge>}</div><h2 className="mt-5 text-lg font-semibold leading-7">{question.prompt}</h2><div className="mt-5 space-y-2">{question.options.map((option) => { const answer = question.answer.includes(option.id); const chosen = selected.includes(option.id); return <div key={option.id} className={`flex gap-3 rounded-xl border p-3 text-sm ${answer ? 'border-emerald-300 bg-emerald-50' : chosen ? 'border-red-300 bg-red-50' : 'opacity-60'}`}><span className="grid size-6 shrink-0 place-items-center rounded-md bg-background font-bold">{answer ? <Check className="size-4 text-emerald-700" /> : chosen ? <X className="size-4 text-red-700" /> : option.id}</span><span>{option.text}</span></div>; })}</div><div className="mt-5 rounded-xl bg-muted p-4 text-sm leading-6"><strong>Decision rule:</strong> {question.explanation}</div></CardContent></Card></section></div></div>;
  }

  const selected = answers[question.id] ?? [];
  const timeWarning = seconds < 15 * 60;
  return <div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-4"><div><p className="text-xs text-muted-foreground">Mock exam</p><p className="font-semibold">Question {current + 1} of {examQuestions.length}</p></div><div className="flex items-center gap-4"><span className={`flex items-center gap-2 font-mono text-lg font-semibold ${timeWarning ? 'text-red-600' : ''}`}><Clock3 className="size-5" /> {timer}</span><Button variant="outline" onClick={submitExam}>Submit exam</Button></div></div><div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]"><Card><CardContent className="p-6 sm:p-8"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{domainMap[question.domainId].shortTitle}</Badge>{question.select > 1 && <Badge variant="secondary">Select {question.select}</Badge>}<Button variant="ghost" size="sm" className="ml-auto" onClick={() => setFlagged((items) => items.includes(question.id) ? items.filter((id) => id !== question.id) : [...items, question.id])}><Flag className={flagged.includes(question.id) ? 'fill-current text-amber-600' : ''} /> {flagged.includes(question.id) ? 'Flagged' : 'Flag'}</Button></div><h2 className="mt-6 text-xl font-semibold leading-8">{question.prompt}</h2><div className="mt-6 space-y-3">{question.options.map((option) => <button key={option.id} type="button" onClick={() => choose(option.id)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm leading-6 transition-all ${selected.includes(option.id) ? 'border-primary bg-primary/5 ring-2 ring-primary/15' : 'hover:border-primary/45 hover:bg-muted/35'}`}><span className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${selected.includes(option.id) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{option.id}</span><span>{option.text}</span></button>)}</div><div className="mt-6 rounded-xl bg-muted/55 p-4"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Confidence</p><div className="mt-2 flex gap-2">{(['low', 'medium', 'high'] as const).map((level) => <Button key={level} type="button" size="sm" variant={confidence[question.id] === level ? 'default' : 'outline'} onClick={() => setConfidence((current) => ({ ...current, [question.id]: level }))} className="capitalize">{level}</Button>)}</div></div><div className="mt-7 flex justify-between"><Button variant="outline" disabled={current === 0} onClick={() => setCurrent((value) => value - 1)}><ArrowLeft /> Previous</Button><Button onClick={() => setCurrent((value) => Math.min(examQuestions.length - 1, value + 1))}>{current === examQuestions.length - 1 ? 'Review grid' : 'Next'} <ArrowRight /></Button></div></CardContent></Card><aside className="rounded-2xl border bg-card p-4"><div className="mb-3 flex justify-between text-sm"><span>Answered</span><strong>{answeredCount}/{examQuestions.length}</strong></div><div className="grid grid-cols-6 gap-2">{examQuestions.map((item, itemIndex) => <button key={item.id} type="button" onClick={() => setCurrent(itemIndex)} className={`relative grid aspect-square place-items-center rounded-lg text-xs font-semibold ${itemIndex === current ? 'bg-primary text-primary-foreground' : answers[item.id]?.length ? 'bg-accent/55' : 'bg-muted text-muted-foreground'}`}>{itemIndex + 1}{flagged.includes(item.id) && <span className="absolute right-1 top-1 size-1.5 rounded-full bg-amber-500" />}</button>)}</div><p className="mt-4 text-xs leading-5 text-muted-foreground">Filled = answered · dot = flagged. Unanswered items are scored incorrect.</p></aside></div></div>;
}
