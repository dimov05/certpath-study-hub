import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Circle, Clock3, FlaskConical, Lightbulb } from 'lucide-react';
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
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Study guide</p><h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Build the decision rules</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Work through concise lessons, then use the practice prompt to turn each idea into a design decision you can defend.</p></div>
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
              <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">Domain {domain.id.slice(1)}</Badge><Badge variant="secondary">{domain.weight}% of exam</Badge><span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" /> {selected.duration} min</span></div>
              <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight">{selected.title}</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{selected.summary}</p>

              <section className="mt-8">
                <div className="mb-4 flex items-center gap-2"><Lightbulb className="size-5 text-emerald-700" /><h3 className="font-semibold">What to know</h3></div>
                <div className="grid gap-3">
                  {selected.keyPoints.map((point, index) => <div key={point} className="flex gap-3 rounded-xl bg-muted/65 p-4"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-background text-xs font-semibold">{index + 1}</span><p className="text-sm leading-6">{point}</p></div>)}
                </div>
              </section>

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
