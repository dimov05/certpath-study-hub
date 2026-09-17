import { useMemo, useState } from 'react';
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import type { Certificate, Question } from '@/lib/types';

const sameAnswers = (left: string[], right: string[]) => [...left].sort().join(',') === [...right].sort().join(',');
const pickQuestions = (questions: Question[], domain: string, count = 10) => {
  const pool = domain === 'all' ? questions : questions.filter((question) => question.domainId === domain);
  return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
};

export function PracticeView({ certificate, onRecordQuestion }: { certificate: Certificate; onRecordQuestion: (id: string, correct: boolean) => void }) {
  const [domain, setDomain] = useState('all');
  const [questions, setQuestions] = useState<Question[]>(() => pickQuestions(certificate.questions, 'all'));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const finished = index >= questions.length;
  const question = questions[index];
  const correct = question ? sameAnswers(selected, question.answer) : false;
  const domainMap = useMemo(() => Object.fromEntries(certificate.domains.map((item) => [item.id, item])), [certificate.domains]);

  const restart = () => { setQuestions(pickQuestions(certificate.questions, domain)); setIndex(0); setSelected([]); setChecked(false); setScore(0); };
  const choose = (option: string) => {
    if (checked) return;
    if (question.select === 1) setSelected([option]);
    else setSelected((current) => current.includes(option) ? current.filter((item) => item !== option) : current.length < question.select ? [...current, option] : current);
  };
  const submit = () => { if (selected.length !== question.select) return; setChecked(true); onRecordQuestion(question.id, correct); if (correct) setScore((value) => value + 1); };
  const next = () => { setIndex((value) => value + 1); setSelected([]); setChecked(false); };

  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    return <div className="mx-auto max-w-2xl py-10 text-center"><div className={`mx-auto grid size-20 place-items-center rounded-full ${percent >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}><span className="text-2xl font-semibold">{percent}%</span></div><h1 className="mt-6 font-heading text-3xl font-semibold">Practice session complete</h1><p className="mt-3 text-muted-foreground">You answered {score} of {questions.length} correctly. {percent >= 80 ? 'Strong work—keep the rule, not just the answer.' : 'Review the explanations and target the decision rules that fooled you.'}</p><Button className="mt-7" onClick={restart}><RotateCcw /> New session</Button></div>;
  }

  const domainInfo = domainMap[question.domainId];
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Question practice</p><h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Train the judgment</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">A fresh 10-question set with immediate explanations.</p></div>
        <div className="flex gap-2"><NativeSelect className="min-w-52" value={domain} onChange={(event) => setDomain(event.target.value)}><NativeSelectOption value="all">All domains</NativeSelectOption>{certificate.domains.map((item) => <NativeSelectOption key={item.id} value={item.id}>{item.shortTitle}</NativeSelectOption>)}</NativeSelect><Button variant="outline" onClick={restart}><RotateCcw /> Restart</Button></div>
      </div>
      <div className="mt-8"><Progress value={(index / questions.length) * 100}><ProgressLabel>Question {index + 1} of {questions.length}</ProgressLabel><ProgressValue /></Progress></div>

      <Card className="mt-6">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{domainInfo.shortTitle}</Badge>{question.select > 1 && <Badge variant="secondary">Select {question.select}</Badge>}<span className="ml-auto text-sm font-medium">Score {score}/{index + (checked ? 1 : 0)}</span></div>
          <h2 className="mt-6 text-xl font-semibold leading-8">{question.prompt}</h2>
          <div className="mt-6 space-y-3">
            {question.options.map((option) => {
              const isSelected = selected.includes(option.id);
              const isAnswer = question.answer.includes(option.id);
              const style = checked ? isAnswer ? 'border-emerald-400 bg-emerald-50 text-emerald-950' : isSelected ? 'border-red-300 bg-red-50 text-red-950' : 'border-border bg-background opacity-65' : isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/15' : 'border-border bg-background hover:border-primary/45 hover:bg-muted/35';
              return <button key={option.id} type="button" onClick={() => choose(option.id)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm leading-6 transition-all ${style}`}><span className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${isSelected || (checked && isAnswer) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{checked && isAnswer ? <Check className="size-4" /> : checked && isSelected ? <X className="size-4" /> : option.id}</span><span>{option.text}</span></button>;
            })}
          </div>
          {checked && <div className={`mt-6 rounded-xl border p-4 ${correct ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><p className="font-semibold">{correct ? 'Correct' : 'Not quite'}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{question.explanation}</p></div>}
          <div className="mt-6 flex justify-end">{checked ? <Button onClick={next}>{index === questions.length - 1 ? 'See results' : 'Next question'} <ArrowRight /></Button> : <Button disabled={selected.length !== question.select} onClick={submit}>Check answer</Button>}</div>
        </CardContent>
      </Card>
    </div>
  );
}
