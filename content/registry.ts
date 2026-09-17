import { claudeArchitectFoundations } from '@/content/certificates/claude-architect-foundations';
import type { Certificate } from '@/lib/types';

export const certificates: Certificate[] = [claudeArchitectFoundations];
export const defaultCertificate = claudeArchitectFoundations;

export function getCertificate(slug: string) {
  return certificates.find((certificate) => certificate.slug === slug);
}
