export interface CaptchaData {
  x: number;
  y: number;
  t: number;
}

export interface CaptchaPoint extends CaptchaData {
  i: number;
}
