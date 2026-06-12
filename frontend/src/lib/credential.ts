import QRCode from 'qrcode';
import { BRAND } from '@/config/brand';
import type { Participant } from '@/types';

const CANVAS = { width: 400, height: 580 };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Error al cargar imagen'));
    img.src = src;
  });
}

export async function generateQrDataUrl(code: string): Promise<string> {
  return QRCode.toDataURL(code, {
    width: 280,
    margin: 2,
    color: { dark: '#1a3320', light: '#ffffff' },
  });
}

function drawCredentialCanvas(
  ctx: CanvasRenderingContext2D,
  participant: Participant,
  logo: HTMLImageElement,
  qr: HTMLImageElement,
) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

  const gradient = ctx.createLinearGradient(0, 0, CANVAS.width, 200);
  gradient.addColorStop(0, 'rgba(132,189,49,0.15)');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS.width, 200);

  ctx.strokeStyle = '#dce8cc';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, 360, 540);

  const logoWidth = 240;
  const logoHeight = (logo.naturalHeight / logo.naturalWidth) * logoWidth;
  const logoX = (CANVAS.width - logoWidth) / 2;
  const logoY = 42;
  ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

  const nameY = logoY + logoHeight + 28;
  ctx.fillStyle = '#1a3320';
  ctx.font = 'bold 22px Inter, sans-serif';
  ctx.textAlign = 'center';
  const name = participant.fullName;
  ctx.fillText(name.length > 28 ? name.slice(0, 28) + '...' : name, CANVAS.width / 2, nameY);

  ctx.fillStyle = '#5b7235';
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText(
    `${participant.stake.name} · ${participant.ward.name}`,
    CANVAS.width / 2,
    nameY + 22,
  );

  const qrY = nameY + 48;
  ctx.drawImage(qr, 60, qrY, 280, 280);

  const codeLabelY = qrY + 310;
  ctx.fillStyle = '#5b7235';
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText('CÓDIGO PERSONAL', CANVAS.width / 2, codeLabelY);

  ctx.fillStyle = '#4b7914';
  ctx.font = 'bold 48px monospace';
  ctx.fillText(participant.code, CANVAS.width / 2, codeLabelY + 50);
}

export async function downloadCredentialPng(participant: Participant): Promise<void> {
  const qrDataUrl = await generateQrDataUrl(participant.code);

  const [logo, qr] = await Promise.all([
    loadImage(BRAND.images.imagotipoGreen),
    loadImage(qrDataUrl),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS.width;
  canvas.height = CANVAS.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible');

  drawCredentialCanvas(ctx, participant, logo, qr);

  const link = document.createElement('a');
  link.download = `credencial-lrjas-${participant.code}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
