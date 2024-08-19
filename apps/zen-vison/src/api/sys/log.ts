import type { Nullable } from '@vben/types';

import { ModuleEnum, type PageParam, type PageResult } from '#/api/common';
import { requestClient } from '#/api/request';

const { SYSTEM } = ModuleEnum;

export namespace LogApi {
  export interface LoginQuery extends PageParam {
    username?: string;
    ip?: string;
    status?: string;
    createTime?: string;
  }

  export interface Login {
    id: number;
    traceId: string;
    type: number;
    userId: number;
    userType: number;
    username: string;
    ip: string;
    location: string;
    ua: string;
    result: number;
    createTime: number;
  }

  export interface AccessQuery extends PageParam {
    appName?: string;
    userId?: number;
    userType?: number;
    beginTime?: string;
    duration?: number;
    requestUrl?: string;
    resultCode?: number;
  }

  export interface Access {
    id: number;
    traceId: string;
    userId: number;
    userType: number;
    appName: string;
    requestMethod: string;
    requestUrl: string;
    requestParams: string;
    responseBody: Nullable<string>;
    ip: string;
    location: string;
    ua: string;
    operateModule: Nullable<string>;
    operateName: Nullable<string>;
    operateType: number;
    beginTime: number;
    endTime: number;
    duration: number;
    resultCode: number;
    resultMsg: string;
    createTime: number;
  }

  export interface ErrorQuery extends PageParam {
    appName?: string;
    userId?: number;
    userType?: number;
    exTime?: string;
    processStatus?: number;
    requestUrl?: string;
  }

  export interface Error {
    id: number;
    traceId: string;
    userId: number;
    userType: number;
    appName: string;
    requestMethod: string;
    requestUrl: string;
    requestParams: string;
    ip: string;
    location: string;
    ua: string;
    exTime: number;
    exName: string;
    exMsg: string;
    exRootCauseMessage: Nullable<string>;
    exStackTrace: string;
    exClassName: string;
    exFileName: string;
    exMethodName: string;
    exLine: number;
    processStatus: number;
    processTime: Nullable<number>;
    processUserId: Nullable<number>;
    createTime: number;
  }

  export interface UpdateProcessStatusModel {
    id: number;
    processStatus: number;
  }
}

/**
 * 更新错误日志处理状态
 */
export function updateErrorLogStatusApi(data: LogApi.UpdateProcessStatusModel) {
  return requestClient.put<boolean>(`${SYSTEM}/log/error/status`, data);
}

/**
 * 导出错误日志
 */
export function exporErrorLogApi(params: LogApi.ErrorQuery) {
  return requestClient.get<void>(`${SYSTEM}/log/error/export`, {
    params,
  });
}

/**
 * 获取错误日志分页列表
 */
export function getErrorLogPageListApi(params: LogApi.ErrorQuery) {
  return requestClient.get<PageResult<LogApi.Error>>(`${SYSTEM}/log/error`, {
    params,
  });
}

/**
 * 导出访问日志
 */
export function exporAccessLogApi(params: LogApi.AccessQuery) {
  return requestClient.get<void>(`${SYSTEM}/log/access/export`, {
    params,
  });
}

/**
 * 获取访问日志分页列表
 */
export function getAccessLogPageListApi(params: LogApi.AccessQuery) {
  return requestClient.get<PageResult<LogApi.Access>>(`${SYSTEM}/log/access`, {
    params,
  });
}

/**
 * 导出登录日志
 */
export function exporLoginLogApi(params: LogApi.LoginQuery) {
  return requestClient.get<void>(`${SYSTEM}/log/login/export`, {
    params,
  });
}

/**
 * 获取登录日志分页列表
 */
export function getLoginLogPageListApi(params: LogApi.LoginQuery) {
  return requestClient.get<PageResult<LogApi.Login>>(`${SYSTEM}/log/login`, {
    params,
  });
}
