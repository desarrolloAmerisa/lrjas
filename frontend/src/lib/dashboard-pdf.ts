import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { fecha_mexico } from '@/lib/mexico-time';

const EXPORT_WIDTH = 900;
const SECTION_GAP_MM = 5;
const MARGIN_MM = 10;
const HEADER_SPACE_MM = 26;

async function waitForRender(ms = 300) {
  await new Promise((resolve) => setTimeout(resolve, ms));
  await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
}

function normalizeClone(clone: HTMLElement) {
  clone.style.width = `${EXPORT_WIDTH}px`;
  clone.style.maxWidth = `${EXPORT_WIDTH}px`;
  clone.style.background = '#ffffff';
  clone.style.opacity = '1';
  clone.style.transform = 'none';
  clone.style.boxSizing = 'border-box';

  clone.querySelectorAll('*').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    node.style.opacity = '1';
    node.style.transform = 'none';
    node.style.animation = 'none';
  });

  clone.querySelectorAll('svg').forEach((svg) => {
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  });
}

async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('No se pudo procesar la captura'));
  });
  return img;
}

async function captureElement(element: HTMLElement): Promise<string> {
  const clone = element.cloneNode(true) as HTMLElement;
  normalizeClone(clone);

  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  host.style.width = `${EXPORT_WIDTH}px`;
  host.style.zIndex = '-1';
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    await waitForRender();
    const height = Math.max(clone.scrollHeight, clone.offsetHeight, 1);

    try {
      return await toPng(clone, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: EXPORT_WIDTH,
        height,
        skipFonts: true,
      });
    } catch {
      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        width: EXPORT_WIDTH,
        height,
      });
      return canvas.toDataURL('image/png');
    }
  } finally {
    document.body.removeChild(host);
  }
}

function drawPdfHeader(pdf: jsPDF) {
  pdf.setFontSize(16);
  pdf.setTextColor(75, 121, 20);
  pdf.text('LRJAS — Dashboard', MARGIN_MM, 14);
  pdf.setFontSize(9);
  pdf.setTextColor(91, 114, 53);
  pdf.text(`Generado: ${fecha_mexico()}`, MARGIN_MM, 20);
}

function pageBottom(pdf: jsPDF) {
  return pdf.internal.pageSize.getHeight() - MARGIN_MM;
}

export async function exportDashboardPdf(root: HTMLElement): Promise<void> {
  await waitForRender(600);

  const sections = Array.from(root.querySelectorAll('[data-pdf-section]')) as HTMLElement[];
  if (sections.length === 0) {
    throw new Error('No hay contenido para exportar');
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGIN_MM * 2;

  drawPdfHeader(pdf);

  let cursorY = HEADER_SPACE_MM;

  for (const section of sections) {
    const dataUrl = await captureElement(section);
    const img = await loadImage(dataUrl);
    const sectionHeightMm = (img.height * contentWidth) / img.width;

    if (cursorY + sectionHeightMm > pageBottom(pdf)) {
      pdf.addPage();
      cursorY = MARGIN_MM;
    }

    pdf.addImage(dataUrl, 'PNG', MARGIN_MM, cursorY, contentWidth, sectionHeightMm);
    cursorY += sectionHeightMm + SECTION_GAP_MM;
  }

  pdf.save(`dashboard-lrjas-${new Date().toISOString().slice(0, 10)}.pdf`);
}
