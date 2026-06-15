import JSZip from 'jszip';
import { BRAND } from '@/config/brand';
import { generateCredentialBlob, generateQrDataUrl } from '@/lib/credential';
import type { Participant } from '@/types';

const BATCH_SIZE = 10;
const QR_FOLDER = 'qrs';
const CREDENTIAL_FOLDER = 'credenciales';

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

export function exportImageFileName(participant: Participant): string {
  const name = sanitizeFileNamePart(participant.fullName) || 'SIN_NOMBRE';
  return `${participant.code}_${name}.png`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Error al cargar imagen'));
    img.src = src;
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

async function addParticipantFiles(
  qrFolder: JSZip,
  credentialFolder: JSZip,
  participant: Participant,
  logo: HTMLImageElement,
): Promise<void> {
  const fileName = exportImageFileName(participant);
  const qrDataUrl = await generateQrDataUrl(participant.code);
  const [qrBlob, qrImage] = await Promise.all([dataUrlToBlob(qrDataUrl), loadImage(qrDataUrl)]);

  qrFolder.file(fileName, qrBlob);

  const credentialBlob = await generateCredentialBlob(participant, { logo, qr: qrImage });
  credentialFolder.file(fileName, credentialBlob);
}

export async function downloadParticipantsQrZip(
  participants: Participant[],
  zipName?: string,
): Promise<void> {
  if (participants.length === 0) return;

  const zip = new JSZip();
  const qrFolder = zip.folder(QR_FOLDER);
  const credentialFolder = zip.folder(CREDENTIAL_FOLDER);
  if (!qrFolder || !credentialFolder) throw new Error('No se pudo crear el ZIP');

  const logo = await loadImage(BRAND.images.imagotipoGreen);

  for (let i = 0; i < participants.length; i += BATCH_SIZE) {
    const batch = participants.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((p) => addParticipantFiles(qrFolder, credentialFolder, p, logo)));
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipName ?? `qr-lrjas-${new Date().toISOString().slice(0, 10)}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}
