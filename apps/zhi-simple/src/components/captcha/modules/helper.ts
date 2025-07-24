import { reactive } from 'vue';

interface CaptchaData {
  x: number;
  y: number;
  t: number;
}

interface CaptchaPoint extends CaptchaData {
  i: number;
}

export function useCaptchaPoints() {
  const points = reactive<CaptchaPoint[]>([]);

  function addPoint(point: CaptchaPoint) {
    points.push(point);
  }

  function clearPoints() {
    const len = points.length;
    points.splice(0, len);
  }

  return {
    addPoint,
    clearPoints,
    points,
  };
}
