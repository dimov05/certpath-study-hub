import { ArrowUpRight, Download, FileText, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Certificate } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ResourcesView({ certificate }: { certificate: Certificate }) {
  return (
    <div className="mx-auto max-w-5xl">
      <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Reference library</p><h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Materials and official sources</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Use the official exam guide for scope and current product documentation for today’s behavior. Downloads are included in the repository.</p></div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {certificate.resources.map((resource) => <Card key={resource.title}><CardHeader><div className="mb-2 flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-muted text-primary">{resource.type === 'official' ? <Link2 className="size-4" /> : <FileText className="size-4" />}</span><Badge variant={resource.type === 'official' ? 'secondary' : 'outline'}>{resource.type === 'official' ? 'Official' : 'Download'}</Badge></div><CardTitle>{resource.title}</CardTitle><CardDescription>{resource.description}</CardDescription></CardHeader><CardContent><a href={resource.href} target={resource.type === 'official' ? '_blank' : undefined} rel={resource.type === 'official' ? 'noreferrer' : undefined} className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between')}>{resource.type === 'official' ? 'Open source' : 'Download file'} {resource.type === 'official' ? <ArrowUpRight /> : <Download />}</a></CardContent></Card>)}
      </div>
      <div className="mt-8 rounded-2xl bg-primary p-6 text-primary-foreground"><h2 className="font-heading text-xl font-semibold">Keep the guide current</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-primary-foreground/70">Claude changes quickly. Before booking, compare the repository’s “Updated” date with the latest official exam guide. Product terminology may evolve even when the architectural principle remains the same.</p><p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/55">Pack updated {certificate.updatedAt}</p></div>
    </div>
  );
}
