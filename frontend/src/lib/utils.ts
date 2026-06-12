import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { hora_mexico } from '@/lib/mexico-time';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFullName(p: {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  motherLastName: string;
}) {
  return [p.firstName, p.middleName, p.lastName, p.motherLastName].filter(Boolean).join(' ');
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(date: string | Date) {
  return hora_mexico(date);
}
