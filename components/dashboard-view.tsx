import {
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  Gauge,
  Target,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { calculateDomainMastery, dueCards, overallMastery, readinessLabel, weakestDomain } from '@/lib/study-engine';
import type { Certificate, StudyProgress, ViewId } from '@/lib/types';

export function DashboardView({ certificate, progress, onNavigate }: { certificate: Certificate; progress: StudyProgress; onNavigate: (view: ViewId) => void }) {
  const lessons = certificate.domains.flatMap((domain) => domain.lessons);
  const completed = progress.completedLessons.length;
  const completionPercent = Math.round((completed / lessons.length) * 100);
  const attempts = Object.values(progress.questionAttempts);
  const answered = attempts.reduce((sum, item) => sum + item.attempts, 0);
  const correct = attempts.reduce((sum, item) => sum + item.correct, 0);
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
  const bestMock = progress.mockAttempts.length ? Math.max(...progress.mockAttempts.map((item) => item.score)) : 0;
  const mastery = calculateDomainMastery(certificate, progress);
  const readiness = overallMastery(certificate, progress);
  const weakest = weakestDomain(certificate, progress);
  const nextDomain = weakest.domain;
  const nextLesson = nextDomain.lessons.find((item) => !progress.completedLessons.includes(item.id)) ?? nextDomain.lessons[0];
  const dueCount = dueCards(certificate, progress).length;

  return (
    <div>
      <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
        <div className="max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2"><Badge>{certificate.level}</Badge><span className="text-sm text-muted-foreground">{certificate.provider}</span></div>
          <h1 className="font-heading text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">{certificate.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{certificate.summary}</p>
        </div>
        <Button size="lg" className="h-11 rounded-xl px-4" onClick={() => onNavigate(progress.diagnosticAttempts.length ? 'guide' : 'diagnostic')}>{progress.diagnosticAttempts.length ? 'Continue learning' : 'Take diagnostic'} <ArrowRight /></Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden border-0 bg-primary text-primary-foreground ring-0 md:col-span-2">
          <div className="absolute -right-12 -top-16 size-52 rounded-full border border-white/10" />
          <div className="absolute -right-2 -top-4 size-32 rounded-full border border-white/10" />
          <CardHeader>
            <CardDescription className="text-primary-foreground/65">Evidence-based mastery</CardDescription>
            <CardTitle className="font-heading text-2xl">{readinessLabel(readiness)}</CardTitle>
            <CardAction><span className="font-heading text-4xl font-semibold tabular-nums">{readiness}%</span></CardAction>
          </CardHeader>
          <CardContent>
            <Progress value={readiness} className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-white/15 [&_[data-slot=progress-indicator]]:bg-accent">
              <ProgressLabel className="text-primary-foreground/75">Combines recall, judgment, application, and exam evidence</ProgressLabel><ProgressValue className="text-primary-foreground/75" />
            </Progress>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-foreground/75">
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4" /> {completionPercent}% curriculum complete</span>
              <span className="flex items-center gap-2"><Target className="size-4" /> 80% practice target</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-accent/35 ring-0">
          <CardHeader><CardDescription>Today’s focus · weakest domain</CardDescription><CardTitle className="font-heading text-xl">{nextDomain.shortTitle}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">Review <strong className="text-foreground">{nextLesson.title}</strong>, then complete a short question set and {Math.min(dueCount, 10)} due cards.</p>
            <Button variant="outline" className="mt-5 w-full justify-between" onClick={() => onNavigate('guide')}>Start focused study <ArrowRight /></Button>
          </CardContent>
        </Card>
      </div>

      {!progress.diagnosticAttempts.length && <Card className="mt-5 border-sky-200 bg-sky-50/70"><CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"><div><p className="font-semibold text-sky-950">Start with a diagnostic baseline</p><p className="mt-1 text-sm leading-6 text-sky-900/70">Thirty blueprint-weighted questions will personalize your mastery map and reveal the best starting domain.</p></div><Button onClick={() => onNavigate('diagnostic')}>Take diagnostic <ArrowRight /></Button></CardContent></Card>}

      <div className="mt-10 flex items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Curriculum</p><h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">Five domains, one clear path</h2></div>
        <p className="hidden text-sm text-muted-foreground sm:block">Weighted to the published exam blueprint</p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {certificate.domains.map((domain, index) => {
          const domainCompleted = domain.lessons.filter((item) => progress.completedLessons.includes(item.id)).length;
          const domainMastery = mastery.find((item) => item.domain.id === domain.id)!;
          return (
            <Card key={domain.id} className="cursor-pointer transition-transform duration-200 hover:-translate-y-0.5" onClick={() => onNavigate('guide')}>
              <CardHeader>
                <div className="mb-2 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">0{index + 1}</span><Badge variant="outline">{domain.weight}%</Badge><Badge variant="secondary" className="ml-auto">{domainMastery.status}</Badge></div>
                <CardTitle>{domain.title}</CardTitle><CardDescription>{domain.description}</CardDescription>
              </CardHeader>
              <CardContent><Progress value={domainMastery.score}><ProgressLabel>{domainCompleted}/{domain.lessons.length} lessons · mastery</ProgressLabel><ProgressValue /></Progress><div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground"><span>Practice {domainMastery.components.practice}%</span><span>Cards {domainMastery.components.flashcards}%</span><span>Mock {domainMastery.components.mock}%</span></div></CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          [CalendarClock, `${dueCount}`, 'Flashcards due'],
          [BrainCircuit, `${answered}`, 'Questions answered'],
          [Gauge, bestMock ? `${bestMock}%` : `${accuracy}%`, bestMock ? 'Best mock score' : 'Practice accuracy'],
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
