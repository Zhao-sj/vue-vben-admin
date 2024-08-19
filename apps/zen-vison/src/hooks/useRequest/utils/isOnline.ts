import { isBrowser } from './isBrowser';

export function isOnline(): boolean {
  if (isBrowser && navigator.onLine !== undefined) {
    return navigator.onLine;
  }
  return true;
}
