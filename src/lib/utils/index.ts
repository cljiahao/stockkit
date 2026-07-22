import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const FORM_LABEL_CLASS =
  'text-xs font-semibold uppercase tracking-wider text-muted-foreground';
export const FORM_ERROR_CLASS = 'text-sm font-medium text-destructive';
