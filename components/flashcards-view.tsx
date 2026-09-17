import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCw, Shuffle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import type { Certificate, StudyProgress } from '@/lib/types';

export function FlashcardsView({ certificate, progress, onToggleMastered }: { certificate: Certificate; progress: StudyProgress; onToggleMastered: (id: string) => void }) {
  const domains = ['All domains', ...Array.from(new Set(certificate.flashcards.map((card) => card.domain)))];
  const [domain, setDomain] = useState('All domains');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const cards = useMemo(() => {
    const filtered = domain === 'All domains' ? certificate.flashcards : certificate.flashcards.filter((card) => card.domain === domain);
    if (!shuffleSeed) return filtered;
    return [...filtered].sort((a, b) => (a.id.charCodeAt(a.id.length - 1) * shuffleSeed) % 17 - (b.id.charCodeAt(b.id.length - 1) * shuffleSeed) % 17);
  }, [certificate.flashcards, domain, shuffleSeed]);
  const card = cards[index] ?? cards[0];

  if (!card) return null;
  const mastered = progress.masteredCards.includes(card.id);
  const overall = Math.round((progress.masteredCards.length / certificate.flashcards.length) * 100);
  const move = (delta: number) => { setIndex((current) => (current + delta + cards.length) % cards.length); setFlipped(false); };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Active recall</p><h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Flashcards</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Answer aloud before you flip. Mark a card mastered only when the rule comes back quickly and precisely.</p></div>
        <div className="flex gap-2"><NativeSelect className="min-w-48" value={domain} onChange={(event) => { setDomain(event.target.value); setIndex(0); setFlipped(false); }}>{domains.map((item) => <NativeSelectOption key={item} value={item}>{item}</NativeSelectOption>)}</NativeSelect><Button variant="outline" size="icon" onClick={() => { setShuffleSeed((value) => value + 1); setIndex(0); setFlipped(false); }} aria-label="Shuffle cards"><Shuffle /></Button></div>
      </div>

      <div className="mt-8"><Progress value={overall}><ProgressLabel>{progress.masteredCards.length} of {certificate.flashcards.length} mastered</ProgressLabel><ProgressValue /></Progress></div>

      <button type="button" onClick={() => setFlipped((value) => !value)} className="mt-8 block w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40" aria-label={flipped ? 'Show question' : 'Show answer'}>
        <Card className={`min-h-[360px] border-0 ring-0 transition-colors ${flipped ? 'bg-primary text-primary-foreground' : 'bg-card shadow-[0_20px_60px_rgb(30_41_59/10%)]'}`}>
          <CardContent className="flex min-h-[360px] flex-col justify-between p-7 sm:p-10">
            <div className="flex items-center justify-between gap-3"><Badge variant={flipped ? 'secondary' : 'outline'}>{card.domain}</Badge><span className={`text-xs ${flipped ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{index + 1} / {cards.length}</span></div>
            <div className="mx-auto max-w-2xl py-12 text-center"><p className={`text-xs font-bold uppercase tracking-[0.16em] ${flipped ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{flipped ? 'Answer' : 'Question'}</p><h2 className="mt-4 font-heading text-3xl font-semibold leading-tight sm:text-4xl">{flipped ? card.back : card.front}</h2></div>
            <div className={`flex items-center justify-center gap-2 text-sm ${flipped ? 'text-primary-foreground/65' : 'text-muted-foreground'}`}><RotateCw className="size-4" /> Click to flip</div>
          </CardContent>
        </Card>
      </button>

      <div className="mt-5 grid grid-cols-[auto_1fr_auto] gap-3"><Button variant="outline" size="icon-lg" onClick={() => move(-1)} aria-label="Previous card"><ArrowLeft /></Button><Button variant={mastered ? 'secondary' : 'default'} className="h-9" onClick={() => onToggleMastered(card.id)}>{mastered ? <><Check /> Mastered</> : 'Mark as mastered'}</Button><Button variant="outline" size="icon-lg" onClick={() => move(1)} aria-label="Next card"><ArrowRight /></Button></div>
    </div>
  );
}
