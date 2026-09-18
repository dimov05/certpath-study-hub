import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Network, RotateCcw, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Certificate, StudyProgress } from '@/lib/types';

export function ScenarioLabView({ certificate, progress, onRecordScenario }: {
  certificate: Certificate;
  progress: StudyProgress;
  onRecordScenario: (scenarioId: string, score: number, total: number) => void;
}) {
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const architectureScenarios = certificate.scenarios ?? [];
  const scenario = architectureScenarios.find((item) => item.id === scenarioId);
  const domainMap = Object.fromEntries(certificate.domains.map((domain) => [domain.id, domain]));

  const open = (id: string) => { setScenarioId(id); setStep(0); setAnswers([]); setRevealed(false); setFinished(false); };
  const choose = (index: number) => { if (!revealed) setAnswers((current) => [...current.slice(0, step), index]); };
  const next = () => {
    if (!scenario) return;
    if (step === scenario.decisions.length - 1) {
      const score = scenario.decisions.reduce((sum, decision, index) => sum + (answers[index] === decision.answer ? 1 : 0), 0);
      onRecordScenario(scenario.id, score, scenario.decisions.length);
      setFinished(true);
      return;
    }
    setStep((value) => value + 1);
    setRevealed(false);
  };

  if (!scenario) {
    return <div>
      <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Applied architecture</p><h1 className="mt-1 font-heading text-4xl font-semibold tracking-tight">Scenario Lab</h1><p className="mt-3 leading-7 text-muted-foreground">Make architecture decisions inside realistic constraints. Every choice returns immediate engineering feedback, then reveals a complete reference blueprint.</p></div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{architectureScenarios.map((item) => {
        const attempt = progress.scenarioAttempts.find((record) => record.scenarioId === item.id);
        return <Card key={item.id} className="flex flex-col transition-transform duration-200 hover:-translate-y-0.5"><CardHeader><div className="mb-2 flex items-center justify-between gap-2"><Badge variant="outline">{domainMap[item.domainId].shortTitle}</Badge><Badge variant="secondary">{item.difficulty}</Badge></div><CardTitle>{item.title}</CardTitle><CardDescription>{item.situation}</CardDescription></CardHeader><CardContent className="mt-auto"><div className="mb-4 flex items-center justify-between text-xs text-muted-foreground"><span>{item.decisions.length} decisions</span><span>{attempt ? `Best: ${attempt.score}/${attempt.total}` : 'Not attempted'}</span></div><Button className="w-full justify-between" variant={attempt ? 'outline' : 'default'} onClick={() => open(item.id)}>{attempt ? 'Run again' : 'Start scenario'} <ArrowRight /></Button></CardContent></Card>;
      })}</div>
    </div>;
  }

  if (finished) {
    const score = scenario.decisions.reduce((sum, decision, index) => sum + (answers[index] === decision.answer ? 1 : 0), 0);
    return <div className="mx-auto max-w-5xl"><Button variant="ghost" onClick={() => setScenarioId(null)}><ArrowLeft /> All scenarios</Button><div className="mt-5 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]"><aside><Card className="bg-primary text-primary-foreground ring-0"><CardContent className="p-6 text-center"><Network className="mx-auto size-9" /><p className="mt-3 text-sm text-primary-foreground/65">Architecture score</p><p className="font-heading text-5xl font-semibold">{score}/{scenario.decisions.length}</p><p className="mt-2 text-sm text-primary-foreground/75">{score === scenario.decisions.length ? 'Every decision preserved the required boundary.' : 'Review the decision rules, then run the scenario again.'}</p></CardContent></Card><Button className="mt-4 w-full" variant="outline" onClick={() => open(scenario.id)}><RotateCcw /> Retry scenario</Button></aside><section><Badge variant="outline">Reference architecture</Badge><h1 className="mt-3 font-heading text-3xl font-semibold">{scenario.title}</h1><div className="mt-5 space-y-3">{scenario.blueprint.map((item, index) => <div key={item} className="flex gap-3 rounded-xl border bg-card p-4"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span><p className="text-sm font-medium leading-6">{item}</p></div>)}</div><h2 className="mt-8 font-heading text-xl font-semibold">Your decisions</h2><div className="mt-3 space-y-3">{scenario.decisions.map((decision, index) => { const correct = answers[index] === decision.answer; return <div key={decision.prompt} className={`rounded-xl border p-4 ${correct ? 'border-emerald-200 bg-emerald-50/65' : 'border-amber-200 bg-amber-50/65'}`}><div className="flex gap-2">{correct ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" /> : <XCircle className="mt-0.5 size-5 shrink-0 text-amber-700" />}<div><p className="text-sm font-semibold">{decision.prompt}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{decision.principle}</p></div></div></div>; })}</div></section></div></div>;
  }

  const decision = scenario.decisions[step];
  const selected = answers[step];
  const correct = selected === decision.answer;
  return <div className="mx-auto max-w-5xl">
    <Button variant="ghost" onClick={() => setScenarioId(null)}><ArrowLeft /> All scenarios</Button>
    <div className="mt-4 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]"><aside><Card className="bg-muted/50"><CardContent className="p-5"><Badge>{scenario.difficulty}</Badge><h1 className="mt-3 font-heading text-2xl font-semibold">{scenario.title}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{scenario.situation}</p><div className="mt-5 border-t pt-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Goal</p><p className="mt-2 text-sm leading-6">{scenario.goal}</p></div><div className="mt-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Constraints</p><ul className="mt-2 space-y-2">{scenario.constraints.map((item) => <li key={item} className="flex gap-2 text-sm leading-5"><span>—</span><span>{item}</span></li>)}</ul></div></CardContent></Card></aside><section><div className="flex items-center justify-between text-sm"><span className="font-semibold">Decision {step + 1} of {scenario.decisions.length}</span><span className="text-muted-foreground">{domainMap[scenario.domainId].shortTitle}</span></div><Progress className="mt-3" value={(step + (revealed ? 1 : 0)) / scenario.decisions.length * 100} /><Card className="mt-5"><CardContent className="p-6 sm:p-8"><h2 className="text-xl font-semibold leading-8">{decision.prompt}</h2><div className="mt-6 space-y-3">{decision.options.map((option, index) => { const isSelected = selected === index; const isAnswer = index === decision.answer; const style = revealed ? isAnswer ? 'border-emerald-300 bg-emerald-50' : isSelected ? 'border-red-300 bg-red-50' : 'opacity-60' : isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/15' : 'hover:border-primary/45 hover:bg-muted/35'; return <button key={option.label} type="button" disabled={revealed} onClick={() => choose(index)} className={`w-full rounded-xl border p-4 text-left transition-all ${style}`}><p className="text-sm font-semibold leading-6">{option.label}</p>{revealed && (isSelected || isAnswer) && <p className="mt-2 text-sm leading-6 text-muted-foreground">{option.feedback}</p>}</button>; })}</div>{revealed && <div className={`mt-5 rounded-xl border p-4 ${correct ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><p className="text-sm font-semibold">{correct ? 'Strong decision' : 'Reconsider the boundary'}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{decision.principle}</p></div>}<div className="mt-6 flex justify-end">{revealed ? <Button onClick={next}>{step === scenario.decisions.length - 1 ? 'See architecture' : 'Next decision'} <ArrowRight /></Button> : <Button disabled={selected === undefined} onClick={() => setRevealed(true)}>Evaluate decision</Button>}</div></CardContent></Card></section></div>
  </div>;
}
