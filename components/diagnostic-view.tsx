import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, RotateCcw, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Certificate, Question, StudyProgress, ViewId } from '@/lib/types';

const sameAnswers = (left: string[] = [], right: string[]) => [...left].sort().join(',') === [...right].sort().join(',');
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function createDiagnostic(certificate: Certificate) {
  const target = 30;
  const counts = certificate.domains.map((domain) => {
    const exact = target * domain.weight / 100;
    return { domain, count: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let remaining = target - counts.reduce((sum, item) => sum + item.count, 0);
  for (const item of [...counts].sort((a, b) => b.remainder - a.remainder)) {
    if (!remaining) break;
    item.count += 1;
    remaining -= 1;
  }
  return shuffle(counts.flatMap(({ domain, count }) => shuffle(certificate.questions.filter((question) => question.domainId === domain.id)).slice(0, count)));
}

export function DiagnosticView({ certificate, progress, onRecordDiagnostic, onNavigate }: {
  certificate: Certificate;
  progress: StudyProgress;
  onRecordDiagnostic: (score: number, domainScores: Record<string, number>, incorrectQuestionIds: string[]) => void;
  onNavigate: (view: ViewId) => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<{ score: number; domainScores: Record<string, number>; incorrect: string[] } | null>(null);
  const latest = progress.diagnosticAttempts.at(-1);
  const question = questions[index];
  const domainMap = useMemo(() => Object.fromEntries(certificate.domains.map((domain) => [domain.id, domain])), [certificate.domains]);

  const begin = () => { setQuestions(createDiagnostic(certificate)); setIndex(0); setAnswers({}); setResult(null); };
  const choose = (option: string) => {
    if (!question) return;
    const existing = answers[question.id] ?? [];
    const next = question.select === 1 ? [option] : existing.includes(option) ? existing.filter((item) => item !== option) : existing.length < question.select ? [...existing, option] : existing;
    setAnswers((current) => ({ ...current, [question.id]: next }));
  };
  const submit = () => {
    const domainTotals: Record<string, { correct: number; total: number }> = {};
    const incorrect: string[] = [];
    let correct = 0;
    for (const item of questions) {
      domainTotals[item.domainId] ??= { correct: 0, total: 0 };
      domainTotals[item.domainId].total += 1;
      if (sameAnswers(answers[item.id], item.answer)) { correct += 1; domainTotals[item.domainId].correct += 1; }
      else incorrect.push(item.id);
    }
    const score = Math.round(correct / questions.length * 100);
    const domainScores = Object.fromEntries(Object.entries(domainTotals).map(([id, value]) => [id, Math.round(value.correct / value.total * 100)]));
    setResult({ score, domainScores, incorrect });
    onRecordDiagnostic(score, domainScores, incorrect);
  };

  if (!questions.length && !result) {
    return <div className="mx-auto max-w-4xl">
      <div className="text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><Compass className="size-6" /></div><p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Personal baseline</p><h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">Diagnostic assessment</h1><p className="mx-auto mt-3 max-w-2xl leading-7 text-muted-foreground">Thirty blueprint-weighted questions identify your strongest and weakest domains. Explanations stay hidden until submission, and everything is stored only in this browser.</p></div>
      {latest && <Card className="mt-7 border-emerald-200 bg-emerald-50/65"><CardContent className="p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-emerald-950">Latest baseline</p><p className="mt-1 text-sm text-emerald-900/70">{new Date(latest.date).toLocaleDateString()} · {latest.score}% overall</p></div><div className="flex flex-wrap gap-2">{certificate.domains.map((domain) => <Badge key={domain.id} variant="outline">{domain.shortTitle}: {latest.domainScores[domain.id] ?? 0}%</Badge>)}</div></div></CardContent></Card>}
      <div className="mt-7 grid gap-4 sm:grid-cols-3">{[['30', 'Questions'], ['~35 min', 'Estimated time'], ['5', 'Domain scores']].map(([value, label]) => <Card key={label}><CardContent className="p-6 text-center"><p className="font-heading text-3xl font-semibold">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></CardContent></Card>)}</div>
      <Card className="mt-5 bg-primary text-primary-foreground ring-0"><CardContent className="p-6 sm:p-8"><h2 className="font-heading text-xl font-semibold">Use this as a true baseline</h2><ul className="mt-4 grid gap-3 text-sm text-primary-foreground/75 sm:grid-cols-2"><li>• Do not use notes or documentation.</li><li>• Make your best choice when uncertain.</li><li>• Multi-select answers require an exact match.</li><li>• Retake after a substantial study cycle.</li></ul><Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/85" onClick={begin}>{latest ? 'Retake diagnostic' : 'Start diagnostic'} <ArrowRight /></Button></CardContent></Card>
    </div>;
  }

  if (result) {
    const weakest = certificate.domains.map((domain) => ({ domain, score: result.domainScores[domain.id] ?? 0 })).sort((a, b) => a.score - b.score)[0];
    return <div className="mx-auto max-w-5xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Diagnostic complete</p><h1 className="mt-1 font-heading text-4xl font-semibold">Your starting map</h1><p className="mt-2 text-muted-foreground">Start with {weakest.domain.shortTitle}; it has the largest immediate opportunity.</p></div><div className="rounded-2xl bg-primary px-6 py-4 text-center text-primary-foreground"><p className="text-xs text-primary-foreground/65">Baseline</p><p className="font-heading text-4xl font-semibold">{result.score}%</p></div></div>
      <div className="mt-7 grid gap-4 md:grid-cols-5">{certificate.domains.map((domain) => { const value = result.domainScores[domain.id] ?? 0; return <Card key={domain.id} className={domain.id === weakest.domain.id ? 'border-amber-300 bg-amber-50/60' : ''}><CardContent className="p-4"><p className="text-xs font-semibold text-muted-foreground">{domain.shortTitle}</p><p className="mt-2 font-heading text-3xl font-semibold">{value}%</p><Progress className="mt-3" value={value} /></CardContent></Card>; })}</div>
      <Card className="mt-6"><CardContent className="p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-heading text-xl font-semibold">Recommended next move</h2><p className="mt-1 text-sm text-muted-foreground">Study the weakest domain, then use practice and spaced repetition before another diagnostic.</p></div><div className="flex gap-2"><Button variant="outline" onClick={begin}><RotateCcw /> Retake</Button><Button onClick={() => onNavigate('guide')}>Open study guide <ArrowRight /></Button></div></div></CardContent></Card>
      <div className="mt-8"><h2 className="font-heading text-2xl font-semibold">Review missed decisions</h2><div className="mt-4 space-y-4">{questions.filter((item) => result.incorrect.includes(item.id)).map((item) => <Card key={item.id}><CardContent className="p-5"><Badge variant="outline">{domainMap[item.domainId].shortTitle}</Badge><p className="mt-3 font-semibold leading-6">{item.prompt}</p><div className="mt-3 space-y-2">{item.options.map((option) => <div key={option.id} className={`flex gap-2 rounded-lg p-2 text-sm ${item.answer.includes(option.id) ? 'bg-emerald-50 text-emerald-950' : answers[item.id]?.includes(option.id) ? 'bg-red-50 text-red-950' : 'bg-muted/40 text-muted-foreground'}`}><span>{item.answer.includes(option.id) ? <Check className="size-4" /> : answers[item.id]?.includes(option.id) ? <X className="size-4" /> : option.id}</span><span>{option.text}</span></div>)}</div><p className="mt-3 text-sm leading-6 text-muted-foreground"><strong className="text-foreground">Decision rule:</strong> {item.explanation}</p></CardContent></Card>)}</div></div>
    </div>;
  }

  const selected = answers[question.id] ?? [];
  return <div className="mx-auto max-w-4xl">
    <div className="flex items-center justify-between gap-4"><div><p className="text-xs text-muted-foreground">Diagnostic assessment</p><p className="font-semibold">Question {index + 1} of {questions.length}</p></div><Button variant="outline" disabled={Object.keys(answers).length === 0} onClick={submit}>Submit assessment</Button></div>
    <Progress className="mt-4" value={index / questions.length * 100} />
    <Card className="mt-5"><CardContent className="p-6 sm:p-8"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{domainMap[question.domainId].shortTitle}</Badge>{question.select > 1 && <Badge variant="secondary">Select {question.select}</Badge>}<span className="ml-auto text-xs text-muted-foreground">{Object.keys(answers).length}/{questions.length} answered</span></div><h2 className="mt-6 text-xl font-semibold leading-8">{question.prompt}</h2><div className="mt-6 space-y-3">{question.options.map((option) => <button key={option.id} type="button" onClick={() => choose(option.id)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm leading-6 transition-all ${selected.includes(option.id) ? 'border-primary bg-primary/5 ring-2 ring-primary/15' : 'hover:border-primary/45 hover:bg-muted/35'}`}><span className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${selected.includes(option.id) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{option.id}</span><span>{option.text}</span></button>)}</div><div className="mt-7 flex justify-between"><Button variant="outline" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}><ArrowLeft /> Previous</Button>{index === questions.length - 1 ? <Button onClick={submit}>Finish diagnostic</Button> : <Button onClick={() => setIndex((value) => value + 1)}>Next <ArrowRight /></Button>}</div></CardContent></Card>
  </div>;
}
