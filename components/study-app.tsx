'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  BrainCircuit,
  CalendarDays,
  ClipboardCheck,
  Compass,
  FileQuestion,
  Flame,
  Layers3,
  Library,
  Network,
  Sparkles,
  Target,
} from 'lucide-react';
import { DashboardView } from '@/components/dashboard-view';
import { DiagnosticView } from '@/components/diagnostic-view';
import { FlashcardsView } from '@/components/flashcards-view';
import { GuideView } from '@/components/guide-view';
import { MockExamView } from '@/components/mock-exam-view';
import { PlanView } from '@/components/plan-view';
import { PracticeView } from '@/components/practice-view';
import { ProgressDialog } from '@/components/progress-dialog';
import { ResourcesView } from '@/components/resources-view';
import { ScenarioLabView } from '@/components/scenario-lab-view';
import { Badge } from '@/components/ui/badge';
import { certificates, defaultCertificate, getCertificate } from '@/content/registry';
import { useStudyProgress } from '@/hooks/use-study-progress';
import type { ViewId } from '@/lib/types';

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: Layers3 },
  { id: 'diagnostic' as const, label: 'Diagnostic', icon: ClipboardCheck },
  { id: 'guide' as const, label: 'Study guide', icon: BookOpen },
  { id: 'flashcards' as const, label: 'Flashcards', icon: BrainCircuit },
  { id: 'practice' as const, label: 'Practice', icon: FileQuestion },
  { id: 'scenarios' as const, label: 'Scenario Lab', icon: Network },
  { id: 'mock' as const, label: 'Mock exam', icon: Target },
  { id: 'plan' as const, label: 'Study plan', icon: CalendarDays },
  { id: 'resources' as const, label: 'Resources', icon: Library },
];

export function StudyApp() {
  const [certificateSlug, setCertificateSlug] = useState(defaultCertificate.slug);
  const [view, setView] = useState<ViewId>('dashboard');
  const certificate = getCertificate(certificateSlug) ?? defaultCertificate;
  const progressState = useStudyProgress(certificate.slug);

  useEffect(() => {
    const savedCertificate = window.localStorage.getItem('certpath:active-certificate');
    // oxlint-disable-next-line react/react-compiler -- restore the learner's last path after SSR
    if (savedCertificate && getCertificate(savedCertificate)) setCertificateSlug(savedCertificate);
    const sync = () => {
      const hash = window.location.hash.replace('#', '') as ViewId;
      if (navItems.some((item) => item.id === hash)) setView(hash);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const changeCertificate = (slug: string) => {
    if (!getCertificate(slug)) return;
    setCertificateSlug(slug);
    window.localStorage.setItem('certpath:active-certificate', slug);
    navigate('dashboard');
  };

  const navigate = (next: ViewId) => {
    setView(next);
    window.location.hash = next;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const content = {
    dashboard: <DashboardView certificate={certificate} progress={progressState.progress} onNavigate={navigate} />,
    diagnostic: <DiagnosticView certificate={certificate} progress={progressState.progress} onRecordDiagnostic={progressState.recordDiagnostic} onNavigate={navigate} />,
    guide: <GuideView certificate={certificate} progress={progressState.progress} onToggleLesson={progressState.toggleLesson} onRecordTeachBack={progressState.recordTeachBack} />,
    flashcards: <FlashcardsView certificate={certificate} progress={progressState.progress} onReviewCard={progressState.reviewCard} />,
    practice: <PracticeView certificate={certificate} onRecordQuestion={progressState.recordQuestion} />,
    scenarios: <ScenarioLabView certificate={certificate} progress={progressState.progress} onRecordScenario={progressState.recordScenario} />,
    mock: <MockExamView certificate={certificate} progress={progressState.progress} onRecordMock={progressState.recordMock} />,
    plan: <PlanView certificate={certificate} progress={progressState.progress} onToggleTask={progressState.togglePlanTask} />,
    resources: <ResourcesView certificate={certificate} />,
  }[view];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <button type="button" className="flex items-center gap-3 text-left" onClick={() => navigate('dashboard')}>
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Compass className="size-5" aria-hidden="true" /></div>
            <div><p className="font-heading text-lg font-semibold leading-none tracking-tight">CertPath</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Learn with direction</p></div>
          </button>
          <div className="flex items-center gap-2">
            {certificates.length > 1 && <label className="hidden items-center gap-2 text-xs font-medium text-muted-foreground md:flex"><span>Path</span><select value={certificate.slug} onChange={(event) => changeCertificate(event.target.value)} className="h-9 max-w-56 rounded-lg border border-input bg-background px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring">{certificates.map((item) => <option key={item.slug} value={item.slug}>{item.shortTitle}</option>)}</select></label>}
            <Badge variant="outline" className="hidden md:inline-flex"><Sparkles /> Free & local-first</Badge><ProgressDialog progress={progressState.progress} onReset={progressState.reset} onImport={progressState.importProgress} />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t px-4 py-2 lg:hidden" aria-label="Mobile navigation">
          {navItems.map((item) => <button key={item.id} type="button" onClick={() => navigate(item.id)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${view === item.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}><item.icon className="size-3.5" />{item.label}</button>)}
        </nav>
      </header>

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] border-r border-border/70 px-5 py-8 lg:block">
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Workspace</p>
          <nav className="mt-3 space-y-1" aria-label="Primary navigation">
            {navItems.map((item) => <button key={item.id} type="button" onClick={() => navigate(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${view === item.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><item.icon className="size-4" aria-hidden="true" />{item.label}</button>)}
          </nav>
          <div className="mt-8 rounded-2xl border border-border bg-card p-4"><div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Flame className="size-4 text-orange-500" /> Study rhythm</div><p className="text-xs leading-relaxed text-muted-foreground">Small, regular sessions beat occasional cramming. Aim for five focused sessions each week.</p></div>
          <div className="absolute bottom-6 left-5 right-5 rounded-xl bg-muted/55 p-3"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Current certificate</p><p className="mt-1 text-xs font-medium leading-5">{certificate.shortTitle}</p></div>
        </aside>
        <section className="min-w-0 px-5 py-8 sm:px-8 lg:px-10 lg:py-10"><div className="mx-auto max-w-6xl">{content}</div></section>
      </div>
    </main>
  );
}
