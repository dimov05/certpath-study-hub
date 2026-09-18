import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpenCheck, Braces, Check, CheckCircle2, Circle, Clock3, ExternalLink, FlaskConical, GraduationCap, Lightbulb, ListChecks, Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import type { Certificate, StudyProgress } from '@/lib/types';

export function GuideView({ certificate, progress, onToggleLesson }: { certificate: Certificate; progress: StudyProgress; onToggleLesson: (id: string) => void }) {
  const allLessons = certificate.domains.flatMap((domain) => domain.lessons);
  const initialId = progress.lastVisitedLesson && allLessons.some((lesson) => lesson.id === progress.lastVisitedLesson) ? progress.lastVisitedLesson : allLessons[0].id;
  const [selectedId, setSelectedId] = useState(initialId);
  const [checkAnswers, setCheckAnswers] = useState<Record<string, number>>({});
  const [revealedChecks, setRevealedChecks] = useState<string[]>([]);
  const selectedIndex = allLessons.findIndex((lesson) => lesson.id === selectedId);
  const selected = allLessons[selectedIndex];
  const domain = certificate.domains.find((item) => item.lessons.some((lesson) => lesson.id === selectedId))!;
  const completed = progress.completedLessons.includes(selected.id);
  const domainCompleted = domain.lessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length;
  const domainPercent = Math.round((domainCompleted / domain.lessons.length) * 100);
  const grouped = useMemo(() => certificate.domains, [certificate]);

  const move = (direction: number) => {
    const next = allLessons[selectedIndex + direction];
    if (next) setSelectedId(next.id);
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Study guide</p><h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Learn it, trace it, apply it</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Each module teaches the mental model, walks through the architecture, applies it to a production scenario, and finishes with knowledge checks.</p></div>
        <NativeSelect className="w-full sm:w-80" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} aria-label="Choose lesson">
          {grouped.map((item) => <optgroup key={item.id} label={item.shortTitle}>{item.lessons.map((lesson) => <NativeSelectOption key={lesson.id} value={lesson.id}>{lesson.title}</NativeSelectOption>)}</optgroup>)}
        </NativeSelect>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden space-y-5 xl:block">
          {certificate.domains.map((item, index) => (
            <div key={item.id}>
              <div className="mb-2 flex items-center justify-between px-2"><p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">0{index + 1} · {item.shortTitle}</p><span className="text-xs text-muted-foreground">{item.weight}%</span></div>
              <div className="space-y-1">
                {item.lessons.map((lesson) => {
                  const isComplete = progress.completedLessons.includes(lesson.id);
                  const isActive = lesson.id === selectedId;
                  return <button key={lesson.id} type="button" onClick={() => setSelectedId(lesson.id)} className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{isComplete ? <Check className={`mt-0.5 size-4 shrink-0 ${isActive ? '' : 'text-emerald-600'}`} /> : <Circle className="mt-0.5 size-4 shrink-0 opacity-45" />}<span>{lesson.title}</span></button>;
                })}
              </div>
            </div>
          ))}
        </aside>

        <article>
          <Card className="overflow-visible">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">Domain {domain.id.slice(1)}</Badge><Badge variant="secondary">{domain.weight}% of exam</Badge><Badge variant="secondary">Self-contained lesson</Badge><span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" /> {selected.duration} min</span></div>
              <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight">{selected.title}</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{selected.summary}</p>

              {selected.details ? <>
                <section className="mt-8 rounded-2xl border bg-muted/30 p-5 sm:p-6">
                  <div className="mb-4 flex items-center gap-2"><GraduationCap className="size-5 text-primary" /><h3 className="font-semibold">By the end of this lesson</h3></div>
                  <ul className="grid gap-3 sm:grid-cols-2">{selected.details.objectives.map((objective) => <li key={objective} className="flex gap-2.5 text-sm leading-6"><CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" /><span>{objective}</span></li>)}</ul>
                </section>

                <section className="mt-6 rounded-2xl bg-primary p-5 text-primary-foreground sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/60">Mental model</p>
                  <p className="mt-3 font-heading text-xl leading-8">{selected.details.mentalModel}</p>
                </section>

                {selected.details.steps && <section className="mt-9">
                  <div className="mb-4 flex items-center gap-2"><Route className="size-5 text-primary" /><h3 className="font-semibold">Architecture flow</h3></div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{selected.details.steps.map((step, index) => <div key={step.title} className="rounded-xl border bg-card p-4"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span><p className="font-semibold">{step.title}</p></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p></div>)}</div>
                </section>}

                <div className="mt-10 space-y-10">
                  {selected.details.sections.map((section) => <section key={section.title}>
                    <h3 className="font-heading text-2xl font-semibold tracking-tight">{section.title}</h3>
                    <div className="mt-4 space-y-4">{section.paragraphs.map((paragraph) => <p key={paragraph} className="text-[15px] leading-7 text-muted-foreground">{paragraph}</p>)}</div>
                    {section.bullets && <ul className="mt-5 space-y-3">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-3 rounded-xl bg-muted/55 p-3.5 text-sm leading-6"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" /><span>{bullet}</span></li>)}</ul>}
                    {section.code && <div className="mt-5 overflow-hidden rounded-2xl border bg-[#101827] text-slate-100"><div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><span className="flex items-center gap-2 text-xs font-semibold"><Braces className="size-4 text-emerald-300" />{section.code.language}</span><span className="text-[11px] text-slate-400">{section.code.caption}</span></div><pre className="overflow-x-auto p-5 text-[12px] leading-6"><code>{section.code.source}</code></pre></div>}
                  </section>)}
                </div>

                {selected.details.scenario && <section className="mt-10 rounded-2xl border border-sky-200 bg-sky-50/70 p-5 text-sky-950 sm:p-6">
                  <div className="mb-3 flex items-center gap-2"><BookOpenCheck className="size-5" /><h3 className="font-semibold">{selected.details.scenario.title}</h3></div>
                  <p className="text-sm leading-6">{selected.details.scenario.situation}</p>
                  <ol className="mt-5 space-y-3">{selected.details.scenario.walkthrough.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-900 text-xs font-bold text-white">{index + 1}</span><span>{step}</span></li>)}</ol>
                  <p className="mt-5 border-t border-sky-200 pt-4 text-sm font-semibold leading-6">Decision rule: {selected.details.scenario.takeaway}</p>
                </section>}

                <section className="mt-10">
                  <div className="mb-4 flex items-center gap-2"><ListChecks className="size-5 text-primary" /><h3 className="font-semibold">Check your understanding</h3></div>
                  <div className="space-y-5">{selected.details.checks.map((check, checkIndex) => {
                    const checkId = `${selected.id}-${checkIndex}`;
                    const selectedAnswer = checkAnswers[checkId];
                    const revealed = revealedChecks.includes(checkId);
                    return <div key={check.question} className="rounded-2xl border p-5"><p className="font-semibold leading-6">{checkIndex + 1}. {check.question}</p><div className="mt-4 grid gap-2">{check.options.map((option, optionIndex) => { const chosen = selectedAnswer === optionIndex; const correct = revealed && optionIndex === check.answer; const incorrect = revealed && chosen && optionIndex !== check.answer; return <button key={option} type="button" disabled={revealed} onClick={() => setCheckAnswers((current) => ({ ...current, [checkId]: optionIndex }))} className={`flex items-start gap-3 rounded-xl border p-3 text-left text-sm leading-6 transition-colors ${correct ? 'border-emerald-300 bg-emerald-50' : incorrect ? 'border-red-300 bg-red-50' : chosen ? 'border-primary bg-primary/5' : 'hover:bg-muted/45'}`}><span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-xs font-bold">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span></button>; })}</div><div className="mt-4 flex items-center gap-3"><Button size="sm" variant="outline" disabled={selectedAnswer === undefined || revealed} onClick={() => setRevealedChecks((current) => [...current, checkId])}>Check answer</Button>{revealed && <span className={`text-xs font-semibold ${selectedAnswer === check.answer ? 'text-emerald-700' : 'text-red-700'}`}>{selectedAnswer === check.answer ? 'Correct' : 'Review the rule'}</span>}</div>{revealed && <p className="mt-3 rounded-lg bg-muted p-3 text-sm leading-6">{check.explanation}</p>}</div>;
                  })}</div>
                </section>

                <section className="mt-10">
                  <div className="mb-1 flex items-center gap-2"><ExternalLink className="size-5 text-primary" /><h3 className="font-semibold">Optional source verification</h3></div>
                  <p className="mb-4 text-sm leading-6 text-muted-foreground">This lesson contains the material you need. Use these official links only to verify current product behavior or explore further.</p>
                  <div className="grid gap-3 sm:grid-cols-2">{selected.details.resources.map((resource) => <a key={resource.href} href={resource.href} target="_blank" rel="noreferrer" className="rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/35"><p className="flex items-center gap-2 text-sm font-semibold">{resource.title}<ExternalLink className="size-3.5" /></p><p className="mt-1 text-xs leading-5 text-muted-foreground">{resource.note}</p></a>)}</div>
                </section>
              </> : <section className="mt-8">
                <div className="mb-4 flex items-center gap-2"><Lightbulb className="size-5 text-emerald-700" /><h3 className="font-semibold">What to know</h3></div>
                <div className="grid gap-3">
                  {selected.keyPoints.map((point, index) => <div key={point} className="flex gap-3 rounded-xl bg-muted/65 p-4"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-background text-xs font-semibold">{index + 1}</span><p className="text-sm leading-6">{point}</p></div>)}
                </div>
              </section>}

              <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-amber-950">
                <div className="mb-3 flex items-center gap-2"><AlertTriangle className="size-5" /><h3 className="font-semibold">Exam traps</h3></div>
                <ul className="space-y-2 text-sm leading-6">{selected.examTraps.map((trap) => <li key={trap} className="flex gap-2"><span aria-hidden="true">—</span><span>{trap}</span></li>)}</ul>
              </section>

              <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-emerald-950">
                <div className="mb-3 flex items-center gap-2"><FlaskConical className="size-5" /><h3 className="font-semibold">Apply it</h3></div><p className="text-sm leading-6">{selected.practice}</p>
              </section>

              <div className="mt-8"><Progress value={domainPercent}><ProgressLabel>{domain.shortTitle} progress</ProgressLabel><ProgressValue /></Progress></div>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
                <Button variant="outline" disabled={selectedIndex === 0} onClick={() => move(-1)}><ArrowLeft /> Previous</Button>
                <Button variant={completed ? 'secondary' : 'default'} onClick={() => onToggleLesson(selected.id)}>{completed ? <><Check /> Completed</> : <>Mark complete <Check /></>}</Button>
                <Button variant="outline" disabled={selectedIndex === allLessons.length - 1} onClick={() => move(1)}>Next <ArrowRight /></Button>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  );
}
