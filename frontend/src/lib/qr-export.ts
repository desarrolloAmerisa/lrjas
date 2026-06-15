import JSZip from 'jszip';
import { generateQrDataUrl } from '@/lib/credential';
import type { Participant } from '@/types';

const BATCH_SIZE = 20;

function sanitizeFileNamePart(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toUpperCase()
    .slice(0, 80);
}

export function qrImageFileName(participant: Participant): string {
  const name = sanitizeFileNamePart(participant.fullName) || 'SIN_NOMBRE';
  return `${participant.code}_${name}.png`;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

async function addParticipantQr(zip: JSZip, participant: Participant): Promise<void> {
  const dataUrl = await generateQrDataUrl(participant.code);
  const blob = await dataUrlToBlob(dataUrl);
  zip.file(qrImageFileName(participant), blob);
}

export async function downloadParticipantsQrZip(
  participants: Participant[],
  zipName?: string,
): Promise<void> {
  if (participants.length === 0) return;

  const zip = new JSZip();

  for (let i = 0; i < participants.length; i += BATCH_SIZE) {
    const batch = participants.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((p) => addParticipantQr(zip, p)));
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipName ?? `qr-lrjas-${new Date().toISOString().slice(0, 10)}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}
