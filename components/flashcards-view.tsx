import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarClock, RotateCw, Shuffle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { cardDomainId, dueCards } from '@/lib/study-engine';
import type { CardRating, Certificate, StudyProgress } from '@/lib/types';

export function FlashcardsView({ certificate, progress, onReviewCard }: { certificate: Certificate; progress: StudyProgress; onReviewCard: (id: string, rating: CardRating) => void }) {
  const [domain, setDomain] = useState('all');
  const [mode, setMode] = useState<'due' | 'all'>('due');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const due = dueCards(certificate, progress, domain === 'all' ? undefined : domain);
  const cards = useMemo(() => {
    const filtered = mode === 'due'
      ? dueCards(certificate, progress, domain === 'all' ? undefined : domain)
      : certificate.flashcards.filter((card) => domain === 'all' || cardDomainId(card, certificate) === domain);
    if (!shuffleSeed) return filtered;
    return [...filtered].sort((a, b) => (a.id.charCodeAt(a.id.length - 1) * shuffleSeed) % 17 - (b.id.charCodeAt(b.id.length - 1) * shuffleSeed) % 17);
  }, [certificate, domain, mode, progress, shuffleSeed]);
  const card = cards[index] ?? cards[0];
  const retained = Object.values(progress.cardReviews).filter((review) => review.repetitions >= 2).length;
  const overall = Math.round(retained / certificate.flashcards.length * 100);
  const move = (delta: number) => { setIndex((current) => (current + delta + cards.length) % cards.length); setFlipped(false); };
  const rate = (rating: CardRating) => { if (!card) return; onReviewCard(card.id, rating); setIndex(0); setFlipped(false); };

  return <div className="mx-auto max-w-4xl">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Spaced repetition</p><h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Flashcard review</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Recall the answer before flipping, then rate how difficult retrieval felt. CertPath schedules the next review automatically.</p></div><div className="flex flex-wrap gap-2"><NativeSelect value={mode} onChange={(event) => { setMode(event.target.value as 'due' | 'all'); setIndex(0); setFlipped(false); }}><NativeSelectOption value="due">Due now ({due.length})</NativeSelectOption><NativeSelectOption value="all">Browse all</NativeSelectOption></NativeSelect><NativeSelect value={domain} onChange={(event) => { setDomain(event.target.value); setIndex(0); setFlipped(false); }}><NativeSelectOption value="all">All domains</NativeSelectOption>{certificate.domains.map((item) => <NativeSelectOption key={item.id} value={item.id}>{item.shortTitle}</NativeSelectOption>)}</NativeSelect><Button variant="outline" size="icon" onClick={() => { setShuffleSeed((value) => value + 1); setIndex(0); setFlipped(false); }} aria-label="Shuffle cards"><Shuffle /></Button></div></div>
    <div className="mt-8"><Progress value={overall}><ProgressLabel>{retained} of {certificate.flashcards.length} retained across reviews</ProgressLabel><ProgressValue /></Progress></div>

    {!card ? <Card className="mt-8 border-emerald-200 bg-emerald-50/65"><CardContent className="p-10 text-center"><CalendarClock className="mx-auto size-10 text-emerald-700" /><h2 className="mt-4 font-heading text-2xl font-semibold">Review queue complete</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Nothing else is due in this selection. Return when the schedule brings cards back, or browse the full deck.</p><Button className="mt-5" variant="outline" onClick={() => setMode('all')}>Browse all cards</Button></CardContent></Card> : <>
      <button type="button" onClick={() => setFlipped((value) => !value)} className="mt-8 block w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40" aria-label={flipped ? 'Show question' : 'Show answer'}><Card className={`min-h-[360px] border-0 ring-0 transition-colors ${flipped ? 'bg-primary text-primary-foreground' : 'bg-card shadow-[0_20px_60px_rgb(30_41_59/10%)]'}`}><CardContent className="flex min-h-[360px] flex-col justify-between p-7 sm:p-10"><div className="flex items-center justify-between gap-3"><Badge variant={flipped ? 'secondary' : 'outline'}>{card.domain}</Badge><span className={`text-xs ${flipped ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{index + 1} / {cards.length}</span></div><div className="mx-auto max-w-2xl py-12 text-center"><p className={`text-xs font-bold uppercase tracking-[0.16em] ${flipped ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{flipped ? 'Answer' : 'Question'}</p><h2 className="mt-4 font-heading text-3xl font-semibold leading-tight sm:text-4xl">{flipped ? card.back : card.front}</h2></div><div className={`flex items-center justify-center gap-2 text-sm ${flipped ? 'text-primary-foreground/65' : 'text-muted-foreground'}`}><RotateCw className="size-4" /> Click to flip</div></CardContent></Card></button>
      {flipped ? <div className="mt-5"><p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">How hard was it to recall?</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Button variant="destructive" onClick={() => rate('again')}>Again · 1d</Button><Button variant="outline" className="border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100" onClick={() => rate('hard')}>Hard</Button><Button variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100" onClick={() => rate('good')}>Good</Button><Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => rate('easy')}>Easy</Button></div></div> : <div className="mt-5 grid grid-cols-[auto_1fr_auto] gap-3"><Button variant="outline" size="icon-lg" onClick={() => move(-1)} aria-label="Previous card"><ArrowLeft /></Button><Button onClick={() => setFlipped(true)}>Reveal answer</Button><Button variant="outline" size="icon-lg" onClick={() => move(1)} aria-label="Next card"><ArrowRight /></Button></div>}
    </>}
  </div>;
}
