const TZ = 'America/Mexico_City';

export function hora_mexico(date: Date | string = new Date()): string {
  return new Date(date).toLocaleTimeString('es-MX', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function fecha_mexico(date: Date | string = new Date()): string {
  return new Date(date).toLocaleDateString('es-MX', {
    timeZone: TZ,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function mexicoDateKey(date: Date = new Date()): string {
  return new Date(date).toLocaleDateString('en-CA', { timeZone: TZ });
}
