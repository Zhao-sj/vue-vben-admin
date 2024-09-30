import type { CaptchaPoint } from '../typing';

import { reactive } from 'vue';

export function useCaptchaPoints() {
  const points = reactive<CaptchaPoint[]>([]);
  function addPoint(point: CaptchaPoint) {
    points.push(point);
  }

  function clearPoints() {
    points.splice(0, points.length);
  }
  return {
    addPoint,
    clearPoints,
    points,
  };
}
