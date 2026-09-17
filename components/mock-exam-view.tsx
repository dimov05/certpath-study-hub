import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, Flag, RotateCcw, Trophy, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Certificate } from '@/lib/types';

const sameAnswers = (left: string[] = [], right: string[]) => [...left].sort().join(',') === [...right].sort().join(',');

export function MockExamView({ certificate, onRecordMock }: { certificate: Certificate; onRecordMock: (score: number, domains: Record<string, number>) => void }) {
  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(certificate.exam.minutes * 60);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [result, setResult] = useState<{ score: number; domains: Record<string, number> } | null>(null);
  const question = certificate.questions[current];
  const answeredCount = Object.keys(answers).filter((id) => answers[id]?.length).length;
  const domainMap = useMemo(() => Object.fromEntries(certificate.domains.map((item) => [item.id, item])), [certificate.domains]);

  const submitExam = useCallback(() => {
    let correct = 0;
    const domainTotals: Record<string, { correct: number; total: number }> = {};
    for (const item of certificate.questions) {
      domainTotals[item.domainId] ??= { correct: 0, total: 0 };
      domainTotals[item.domainId].total += 1;
      if (sameAnswers(answers[item.id], item.answer)) {
        correct += 1;
        domainTotals[item.domainId].correct += 1;
      }
    }
    const score = Math.round((correct / certificate.questions.length) * 100);
    const domains = Object.fromEntries(Object.entries(domainTotals).map(([id, value]) => [id, Math.round((value.correct / value.total) * 100)]));
    setResult({ score, domains });
    setStarted(false);
    onRecordMock(score, domains);
  }, [answers, certificate.questions, onRecordMock]);

  useEffect(() => {
    if (!started || result) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [started, result]);

  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- submitting is the required side effect when the countdown expires
    if (started && seconds === 0 && !result) submitExam();
  }, [seconds, started, result, submitExam]);

  function begin() { setStarted(true); setSeconds(certificate.exam.minutes * 60); setCurrent(0); setAnswers({}); setFlagged([]); setResult(null); }
  function choose(option: string) {
    if (result) return;
    const existing = answers[question.id] ?? [];
    const next = question.select === 1 ? [option] : existing.includes(option) ? existing.filter((item) => item !== option) : existing.length < question.select ? [...existing, option] : existing;
    setAnswers((value) => ({ ...value, [question.id]: next }));
  }
  const timer = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  if (!started && !result) {
    return <div className="mx-auto max-w-3xl"><div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Timed simulation</p><h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">Full mock exam</h1><p className="mx-auto mt-3 max-w-xl leading-7 text-muted-foreground">Replicate the real pressure: 60 original scenario questions, 120 minutes, no notes, and domain-weighted results.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-3">{[[certificate.exam.questions, 'Questions'], [certificate.exam.minutes, 'Minutes'], ['80%', 'Practice target']].map(([value, label]) => <Card key={label as string}><CardContent className="p-6 text-center"><p className="font-heading text-3xl font-semibold">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></CardContent></Card>)}</div><Card className="mt-6 bg-primary text-primary-foreground ring-0"><CardContent className="p-6 sm:p-8"><h2 className="font-heading text-xl font-semibold">Before you begin</h2><ul className="mt-4 grid gap-3 text-sm text-primary-foreground/75 sm:grid-cols-2"><li>• Close documentation and notes.</li><li>• Answer every question.</li><li>• Multi-response items require an exact match.</li><li>• Flag uncertainty and keep moving.</li></ul><Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/85" onClick={begin}>Start 120-minute exam <ArrowRight /></Button></CardContent></Card></div>;
  }

  if (result) {
    const passed = result.score >= 80;
    const selected = answers[question.id] ?? [];
    return <div className="mx-auto max-w-5xl"><div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]"><aside><Card className={passed ? 'bg-emerald-50' : 'bg-amber-50'}><CardContent className="p-6 text-center"><Trophy className={`mx-auto size-10 ${passed ? 'text-emerald-700' : 'text-amber-700'}`} /><p className="mt-3 text-sm text-muted-foreground">Final score</p><p className="font-heading text-5xl font-semibold">{result.score}%</p><p className="mt-2 text-sm">{passed ? 'Practice-ready result' : 'Keep repairing weak domains'}</p></CardContent></Card><div className="mt-4 space-y-3">{certificate.domains.map((domain) => <div key={domain.id} className="rounded-xl border bg-card p-3"><div className="mb-2 flex items-center justify-between text-xs"><span>{domain.shortTitle}</span><strong>{result.domains[domain.id]}%</strong></div><Progress value={result.domains[domain.id]} /></div>)}</div><Button className="mt-5 w-full" onClick={begin}><RotateCcw /> Retake mock</Button></aside><section><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Review answers</p><h1 className="font-heading text-2xl font-semibold">Question {current + 1}</h1></div><div className="flex gap-2"><Button variant="outline" size="icon" disabled={current === 0} onClick={() => setCurrent((value) => value - 1)}><ArrowLeft /></Button><Button variant="outline" size="icon" disabled={current === certificate.questions.length - 1} onClick={() => setCurrent((value) => value + 1)}><ArrowRight /></Button></div></div><Card><CardContent className="p-6"><Badge variant="outline">{domainMap[question.domainId].shortTitle}</Badge><h2 className="mt-5 text-lg font-semibold leading-7">{question.prompt}</h2><div className="mt-5 space-y-2">{question.options.map((option) => { const answer = question.answer.includes(option.id); const chosen = selected.includes(option.id); return <div key={option.id} className={`flex gap-3 rounded-xl border p-3 text-sm ${answer ? 'border-emerald-300 bg-emerald-50' : chosen ? 'border-red-300 bg-red-50' : 'opacity-60'}`}><span className="grid size-6 shrink-0 place-items-center rounded-md bg-background font-bold">{answer ? <Check className="size-4 text-emerald-700" /> : chosen ? <X className="size-4 text-red-700" /> : option.id}</span><span>{option.text}</span></div>; })}</div><div className="mt-5 rounded-xl bg-muted p-4 text-sm leading-6"><strong>Why:</strong> {question.explanation}</div></CardContent></Card></section></div></div>;
  }

  const selected = answers[question.id] ?? [];
  const timeWarning = seconds < 15 * 60;
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-4"><div><p className="text-xs text-muted-foreground">Mock exam</p><p className="font-semibold">Question {current + 1} of {certificate.questions.length}</p></div><div className="flex items-center gap-4"><span className={`flex items-center gap-2 font-mono text-lg font-semibold ${timeWarning ? 'text-red-600' : ''}`}><Clock3 className="size-5" /> {timer}</span><Button variant="outline" onClick={submitExam}>Submit exam</Button></div></div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <Card><CardContent className="p-6 sm:p-8"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{domainMap[question.domainId].shortTitle}</Badge>{question.select > 1 && <Badge variant="secondary">Select {question.select}</Badge>}<Button variant="ghost" size="sm" className="ml-auto" onClick={() => setFlagged((items) => items.includes(question.id) ? items.filter((id) => id !== question.id) : [...items, question.id])}><Flag className={flagged.includes(question.id) ? 'fill-current text-amber-600' : ''} /> {flagged.includes(question.id) ? 'Flagged' : 'Flag'}</Button></div><h2 className="mt-6 text-xl font-semibold leading-8">{question.prompt}</h2><div className="mt-6 space-y-3">{question.options.map((option) => <button key={option.id} type="button" onClick={() => choose(option.id)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm leading-6 transition-all ${selected.includes(option.id) ? 'border-primary bg-primary/5 ring-2 ring-primary/15' : 'hover:border-primary/45 hover:bg-muted/35'}`}><span className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${selected.includes(option.id) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{option.id}</span><span>{option.text}</span></button>)}</div><div className="mt-7 flex justify-between"><Button variant="outline" disabled={current === 0} onClick={() => setCurrent((value) => value - 1)}><ArrowLeft /> Previous</Button><Button onClick={() => setCurrent((value) => Math.min(certificate.questions.length - 1, value + 1))}>{current === certificate.questions.length - 1 ? 'Review grid' : 'Next'} <ArrowRight /></Button></div></CardContent></Card>
        <aside className="rounded-2xl border bg-card p-4"><div className="mb-3 flex justify-between text-sm"><span>Answered</span><strong>{answeredCount}/{certificate.questions.length}</strong></div><div className="grid grid-cols-6 gap-2">{certificate.questions.map((item, itemIndex) => <button key={item.id} type="button" onClick={() => setCurrent(itemIndex)} className={`relative grid aspect-square place-items-center rounded-lg text-xs font-semibold ${itemIndex === current ? 'bg-primary text-primary-foreground' : answers[item.id]?.length ? 'bg-accent/55' : 'bg-muted text-muted-foreground'}`}>{itemIndex + 1}{flagged.includes(item.id) && <span className="absolute right-1 top-1 size-1.5 rounded-full bg-amber-500" />}</button>)}</div><p className="mt-4 text-xs leading-5 text-muted-foreground">Green = answered · dot = flagged. Unanswered items are scored incorrect.</p></aside>
      </div>
    </div>
  );
}
