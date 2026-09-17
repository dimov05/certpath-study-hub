import { CalendarDays, Check, Clock3 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import type { Certificate, StudyProgress } from '@/lib/types';

export function PlanView({ certificate, progress, onToggleTask }: { certificate: Certificate; progress: StudyProgress; onToggleTask: (id: string) => void }) {
  const tasks = certificate.plan.flatMap((week) => week.tasks);
  const complete = progress.completedPlanTasks.length;
  const percent = Math.round((complete / tasks.length) * 100);
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Learning path</p><h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Six-week study plan</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Five focused sessions each week. Keep at least half your time active: build, diagram, explain, or solve.</p></div><div className="min-w-60"><Progress value={percent}><ProgressLabel>{complete}/{tasks.length} sessions</ProgressLabel><ProgressValue /></Progress></div></div>
      <div className="mt-8 space-y-5">
        {certificate.plan.map((week) => {
          const weekComplete = week.tasks.filter((task) => progress.completedPlanTasks.includes(task.id)).length;
          return <section key={week.week} className="overflow-hidden rounded-2xl border bg-card"><header className="flex flex-col justify-between gap-3 border-b bg-muted/35 p-5 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><span className="grid size-11 place-items-center rounded-xl bg-primary font-heading text-lg font-semibold text-primary-foreground">{week.week}</span><div><h2 className="font-semibold">{week.title}</h2><p className="mt-0.5 text-sm text-muted-foreground">{week.outcome}</p></div></div><span className="text-xs font-medium text-muted-foreground">{weekComplete}/{week.tasks.length} complete</span></header><div className="divide-y">{week.tasks.map((task) => { const done = progress.completedPlanTasks.includes(task.id); return <label key={task.id} className="group flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-muted/25"><Checkbox checked={done} onCheckedChange={() => onToggleTask(task.id)} aria-label={`Mark ${task.label} complete`} /><span className={`flex-1 text-sm ${done ? 'text-muted-foreground line-through' : ''}`}>{task.label}</span><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3.5" /> {task.minutes} min</span>{done && <Check className="size-4 text-emerald-600" />}</label>; })}</div></section>;
        })}
      </div>
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-emerald-950"><CalendarDays className="mt-0.5 size-5 shrink-0" /><div><p className="font-semibold">Booking threshold</p><p className="mt-1 text-sm leading-6">Aim for at least 80% on two fresh timed mocks, no domain below 70%, and enough pace to finish in 105 minutes with 15 minutes to review.</p></div></div>
    </div>
  );
}
