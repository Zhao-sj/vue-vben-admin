import dayjs, { type ConfigType } from 'dayjs';
import { cloneDeep, isArray } from 'lodash-es';

import { formatToDateTime } from '#/utils';

interface BaseCTime {
  createTime?: string;
}

export function translateState(target: BaseCTime | Ref<BaseCTime>) {
  const state = cloneDeep(unref(target));
  const _addHm = (target: ConfigType) => {
    return dayjs(target).add(1, 'day').subtract(1, 'millisecond');
  };

  if (isArray(state.createTime)) {
    const [st, et] = state.createTime;
    state.createTime = `${formatToDateTime(st)},${formatToDateTime(_addHm(et))}`;
  }

  return { state };
}
