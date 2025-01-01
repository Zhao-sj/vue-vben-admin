import type { BaseSimple } from '#/api/common';

import { ModuleEnum } from '#/api/common';
import { requestClient } from '#/api/request';

const { SYSTEM } = ModuleEnum;

export namespace AreaApi {
  export interface Simple extends BaseSimple {
    children?: Simple[];
  }
}

/**
 * 获取IP地区
 */
export function getAreaApi(ip: string) {
  return requestClient.get<string>(`${SYSTEM}/area/${ip}`);
}

/**
 * 获取地区列表
 */
export function getAreaListApi() {
  return requestClient.get<AreaApi.Simple[]>(`${SYSTEM}/area`);
}
