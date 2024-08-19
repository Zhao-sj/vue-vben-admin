import { isBrowser } from './isBrowser';
import { isDocumentVisible } from './isDocumentVisible';

type Listener = () => void;

const listeners: Listener[] = [];

if (isBrowser) {
  const revalidate = () => {
    if (!isDocumentVisible()) return;
    for (const listener of listeners) {
      listener();
    }
  };
  window.addEventListener('visibilitychange', revalidate, false);
}

export default function subscribe(listener: Listener) {
  listeners.push(listener);
  return function unsubscribe() {
    const index = listeners.indexOf(listener);
    listeners.splice(index, 1);
  };
}
