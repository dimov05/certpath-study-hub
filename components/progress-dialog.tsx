import { useRef, useState } from 'react';
import { Download, RotateCcw, Settings2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadProgress } from '@/lib/progress';
import type { StudyProgress } from '@/lib/types';

export function ProgressDialog({ progress, onReset, onImport }: { progress: StudyProgress; onReset: () => void; onImport: (progress: StudyProgress) => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      onImport(JSON.parse(await file.text()) as StudyProgress);
      setMessage('Progress imported successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not import this file.');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}><Settings2 /><span className="hidden sm:inline">Progress</span></Button>
      {open && <div role="presentation" className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <dialog open aria-labelledby="progress-title" className="relative m-0 w-full max-w-sm rounded-2xl bg-popover p-5 text-popover-foreground shadow-2xl ring-1 ring-foreground/10">
          <div className="flex items-start justify-between gap-3"><div><h2 id="progress-title" className="font-heading text-lg font-semibold">{confirming ? 'Reset all progress?' : 'Progress and portability'}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{confirming ? 'This clears lessons, diagnostics, spaced reviews, scenarios, teach-backs, question history, and mock scores for this certificate on this browser.' : 'Your progress lives in this browser only. Export it to move devices or keep a backup.'}</p></div><Button variant="ghost" size="icon-sm" onClick={() => { setOpen(false); setConfirming(false); }} aria-label="Close"><X /></Button></div>
          {confirming ? <div className="mt-5 flex justify-end gap-2"><Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button><Button variant="destructive" onClick={() => { onReset(); setOpen(false); setConfirming(false); }}>Reset everything</Button></div> : <div className="mt-5 grid gap-3"><Button variant="outline" className="justify-start" onClick={() => downloadProgress(progress)}><Download /> Export progress</Button><Button variant="outline" className="justify-start" onClick={() => inputRef.current?.click()}><Upload /> Import progress</Button><input ref={inputRef} className="hidden" type="file" accept="application/json,.json" onChange={(event) => importFile(event.target.files?.[0])} /><Button variant="destructive" className="justify-start" onClick={() => setConfirming(true)}><RotateCcw /> Reset to zero</Button>{message && <output className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">{message}</output>}</div>}
        </dialog>
      </div>}
    </>
  );
}
