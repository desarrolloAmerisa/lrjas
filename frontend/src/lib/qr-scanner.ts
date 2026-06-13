import { Html5Qrcode, type Html5QrcodeCameraScanConfig } from 'html5-qrcode';

const BACK_CAMERA_RE = /back|rear|environment|trasera|posterior|wide/i;
const noop = () => {};

const SCAN_CONFIG: Html5QrcodeCameraScanConfig = {
  fps: 10,
  qrbox: (viewfinderWidth, viewfinderHeight) => {
    const edge = Math.min(viewfinderWidth, viewfinderHeight);
    const size = Math.max(Math.floor(edge * 0.7), 150);
    return { width: size, height: size };
  },
};

function clearContainer(elementId: string) {
  const container = document.getElementById(elementId);
  if (container) container.innerHTML = '';
}

async function safeStop(scanner: Html5Qrcode) {
  try {
    if (scanner.isScanning) await scanner.stop();
  } catch {
    /* ignore */
  }
  try {
    scanner.clear();
  } catch {
    /* ignore */
  }
}

async function tryStart(
  scanner: Html5Qrcode,
  camera: string | MediaTrackConstraints,
  onScan: (decoded: string) => void,
) {
  await scanner.start(camera, SCAN_CONFIG, onScan, noop);
}

export async function startQrScanner(
  elementId: string,
  onScan: (decoded: string) => void,
): Promise<Html5Qrcode> {
  clearContainer(elementId);

  let lastError: unknown;

  try {
    const cameras = await Html5Qrcode.getCameras();
    if (cameras.length) {
      const preferred =
        cameras.find(({ label }) => BACK_CAMERA_RE.test(label)) ??
        cameras.at(-1) ??
        cameras[0];

      const scanner = new Html5Qrcode(elementId);
      try {
        await tryStart(scanner, preferred.id, onScan);
        return scanner;
      } catch (error) {
        lastError = error;
        await safeStop(scanner);
        clearContainer(elementId);
      }
    }
  } catch (error) {
    lastError = error;
  }

  const constraints: MediaTrackConstraints[] = [
    { facingMode: { ideal: 'environment' } },
    { facingMode: 'user' },
  ];

  for (const camera of constraints) {
    clearContainer(elementId);
    const scanner = new Html5Qrcode(elementId);
    try {
      await tryStart(scanner, camera, onScan);
      return scanner;
    } catch (error) {
      lastError = error;
      await safeStop(scanner);
    }
  }

  clearContainer(elementId);
  throw lastError ?? new Error('No se pudo acceder a la cámara');
}

export function describeCameraError(error: unknown): string {
  if (!window.isSecureContext) {
    return 'La cámara requiere HTTPS. Abre el sitio con https://';
  }

  const name = error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (name === 'NotAllowedError' || message.includes('permission') || message.includes('denied')) {
    return 'Permiso de cámara denegado. Actívalo en ajustes del navegador.';
  }
  if (name === 'NotFoundError' || message.includes('not found') || message.includes('no camera')) {
    return 'No se encontró ninguna cámara en este dispositivo.';
  }
  if (name === 'NotReadableError' || message.includes('in use') || message.includes('could not start')) {
    return 'La cámara está en uso. Cierra otras apps que la usen e intenta de nuevo.';
  }
  if (name === 'OverconstrainedError' || message.includes('overconstrained')) {
    return 'No se pudo configurar la cámara. Intenta con otro navegador o dispositivo.';
  }

  return 'No se pudo iniciar la cámara. Pulsa Iniciar cámara e intenta de nuevo.';
}

export async function stopQrScanner(scanner: Html5Qrcode | null, elementId?: string) {
  if (scanner) await safeStop(scanner);
  if (elementId) clearContainer(elementId);
}
