import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Target,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import type { Certificate, StudyProgress, ViewId } from '@/lib/types';

export function DashboardView({ certificate, progress, onNavigate }: { certificate: Certificate; progress: StudyProgress; onNavigate: (view: ViewId) => void }) {
  const lessons = certificate.domains.flatMap((domain) => domain.lessons);
  const completed = progress.completedLessons.length;
  const percent = Math.round((completed / lessons.length) * 100);
  const attempts = Object.values(progress.questionAttempts);
  const answered = attempts.reduce((sum, item) => sum + item.attempts, 0);
  const correct = attempts.reduce((sum, item) => sum + item.correct, 0);
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
  const bestMock = progress.mockAttempts.length ? Math.max(...progress.mockAttempts.map((item) => item.score)) : 0;
  const nextLesson = lessons.find((item) => !progress.completedLessons.includes(item.id)) ?? lessons[0];
  const nextDomain = certificate.domains.find((domain) => domain.lessons.some((item) => item.id === nextLesson.id)) ?? certificate.domains[0];

  return (
    <div>
      <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
        <div className="max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2"><Badge>{certificate.level}</Badge><span className="text-sm text-muted-foreground">{certificate.provider}</span></div>
          <h1 className="font-heading text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">{certificate.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{certificate.summary}</p>
        </div>
        <Button size="lg" className="h-11 rounded-xl px-4" onClick={() => onNavigate('guide')}>Continue learning <ArrowRight /></Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden border-0 bg-primary text-primary-foreground ring-0 md:col-span-2">
          <div className="absolute -right-12 -top-16 size-52 rounded-full border border-white/10" />
          <div className="absolute -right-2 -top-4 size-32 rounded-full border border-white/10" />
          <CardHeader>
            <CardDescription className="text-primary-foreground/65">Overall journey</CardDescription>
            <CardTitle className="font-heading text-2xl">Your path to exam readiness</CardTitle>
            <CardAction><span className="font-heading text-4xl font-semibold tabular-nums">{percent}%</span></CardAction>
          </CardHeader>
          <CardContent>
            <Progress value={percent} className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-white/15 [&_[data-slot=progress-indicator]]:bg-accent">
              <ProgressLabel className="text-primary-foreground/75">{completed} of {lessons.length} lessons</ProgressLabel><ProgressValue className="text-primary-foreground/75" />
            </Progress>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-foreground/75">
              <span className="flex items-center gap-2"><Clock3 className="size-4" /> {certificate.exam.minutes}-minute exam</span>
              <span className="flex items-center gap-2"><Target className="size-4" /> 80% practice target</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-accent/35 ring-0">
          <CardHeader><CardDescription>Up next · {nextDomain.shortTitle}</CardDescription><CardTitle className="font-heading text-xl">{nextLesson.title}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{nextLesson.summary}</p>
            <Button variant="outline" className="mt-5 w-full justify-between" onClick={() => onNavigate('guide')}>Open lesson <ArrowRight /></Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Curriculum</p><h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">Five domains, one clear path</h2></div>
        <p className="hidden text-sm text-muted-foreground sm:block">Weighted to the published exam blueprint</p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {certificate.domains.map((domain, index) => {
          const domainCompleted = domain.lessons.filter((item) => progress.completedLessons.includes(item.id)).length;
          const domainPercent = Math.round((domainCompleted / domain.lessons.length) * 100);
          return (
            <Card key={domain.id} className="cursor-pointer transition-transform duration-200 hover:-translate-y-0.5" onClick={() => onNavigate('guide')}>
              <CardHeader>
                <div className="mb-2 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">0{index + 1}</span><Badge variant="outline">{domain.weight}%</Badge></div>
                <CardTitle>{domain.title}</CardTitle><CardDescription>{domain.description}</CardDescription>
              </CardHeader>
              <CardContent><Progress value={domainPercent}><ProgressLabel>{domainCompleted}/{domain.lessons.length} lessons</ProgressLabel><ProgressValue /></Progress></CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          [CheckCircle2, `${completed}`, 'Lessons complete'],
          [BrainCircuit, `${answered}`, 'Questions answered'],
          [Target, bestMock ? `${bestMock}%` : `${accuracy}%`, bestMock ? 'Best mock score' : 'Practice accuracy'],
        ].map(([Icon, value, label]) => (
          <div key={label as string} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
            <div className="grid size-10 place-items-center rounded-xl bg-muted text-primary"><Icon className="size-5" /></div>
            <div><p className="text-xl font-semibold tabular-nums">{value as string}</p><p className="text-xs text-muted-foreground">{label as string}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
