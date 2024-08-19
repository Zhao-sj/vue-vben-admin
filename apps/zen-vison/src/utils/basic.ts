import { isNumber } from '@vben/utils';

import dayjs, { type ConfigType } from 'dayjs';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATE_FORMAT = 'YYYY-MM-DD ';

/** 日期+时间 */
export function formatToDateTime(
  date: ConfigType,
  formatStr = DATE_TIME_FORMAT,
) {
  return dayjs(date).format(formatStr);
}

/** 日期格式 */
export function formatToDate(date: ConfigType, formatStr = DATE_FORMAT) {
  return dayjs(date).format(formatStr);
}

/** 千分位 */
export function formatToThousand(val: number | string) {
  if (!isNumber(+val)) {
    return val.toString();
  }

  let [whole, decimal] = val.toString().split('.');

  decimal = decimal ? `.${decimal.slice(0, 3)}` : '';
  whole = whole?.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');

  return whole + decimal;
}
