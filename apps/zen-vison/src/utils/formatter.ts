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

/**
 * 秒格式
 * @example `7天30分钟`
 */
export function formatToSeconds(seconds: number) {
  const second = seconds % 60;
  const minute = Math.floor(seconds / 60) % 60;
  const hour = Math.floor(seconds / (60 * 60)) % 24;
  const day = Math.floor(seconds / (60 * 60 * 24)) % 30;
  const month = Math.floor(seconds / (60 * 60 * 24 * 30)) % 12;
  const year = Math.floor(seconds / (60 * 60 * 24 * 30 * 12)) % 365;
  const list = [
    { name: '年', value: year },
    { name: '个月', value: month },
    { name: '天', value: day },
    { name: '小时', value: hour },
    { name: '分钟', value: minute },
    { name: '秒', value: second },
  ];

  const start = list.findIndex((item) => item.value !== 0);
  const end = list.findLastIndex((item) => item.value !== 0);

  const result = list
    .slice(start, end + 1)
    .map((item) => (item.value === 0 ? '零' : `${item.value}${item.name}`))
    .join('');

  return result.replaceAll(/零+/g, '零');
}

/** 文件大小 */
export function formatFileSize(size: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return size.toFixed(2) + units[unitIndex];
}

/** 千分位 */
export function formatThousand(val: number | string) {
  if (!isNumber(+val)) {
    return val.toString();
  }

  let [whole, decimal] = val.toString().split('.');

  decimal = decimal ? `.${decimal.slice(0, 3)}` : '';
  whole = whole?.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');

  return whole + decimal;
}
