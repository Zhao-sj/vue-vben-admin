import type { Nullable, RouteMeta } from '@vben/types';

import type { HttpResponse } from '#/utils/request/typing';

import { ModuleEnum } from '#/api/common';
import { requestClient } from '#/api/request';
import { CaptchaEnum } from '#/enums';

const { SYSTEM } = ModuleEnum;

export namespace AuthApi {
  export interface CaptchaResp {
    basemap: string;
    secretKey: Nullable<string>;
    slider: Nullable<string>;
    token: string;
    wordList: Nullable<string[]>;
  }

  export interface CheckCaptchaModel {
    captchaType: CaptchaEnum;
    pointJson: string;
    token: string;
  }

  export interface LoginModel {
    captcha?: string;
    password: string;
    username: string;
  }

  export interface LoginResp {
    accessToken: string;
  }

  export interface Menu {
    children: Nullable<Menu[]>;
    component: Nullable<string>;
    componentName: string;
    id: number;
    meta: Nullable<RouteMeta>;
    name: string;
    parentId: number;
    path: string;
  }

  export interface User {
    avatar: Nullable<string>;
    deptId: Nullable<number>;
    email: Nullable<string>;
    id: number;
    nickname: Nullable<string>;
    username: string;
  }

  export interface PermissionResp {
    menus: Menu[];
    permissions: string[];
    roles: string[];
    user: User;
  }
}

/**
 * 获取验证码
 */
export function getCaptchaApi(captchaType = CaptchaEnum.BLOCK_PUZZLE) {
  return requestClient.post<AuthApi.CaptchaResp>(`${SYSTEM}/captcha/get`, {
    captchaType,
  });
}

/**
 * 校验验证码
 */
export function checkCaptchaApi(data: AuthApi.CheckCaptchaModel) {
  return requestClient.post<HttpResponse<AuthApi.CheckCaptchaModel>>(
    `${SYSTEM}/captcha/check`,
    data,
    {
      isTransformResponse: false,
    },
  );
}

/**
 * 登录
 */
export function userLoginApi(data: AuthApi.LoginModel) {
  return requestClient.post<AuthApi.LoginResp>(`${SYSTEM}/auth/login`, data);
}

/**
 * 登出
 */
export function userLogoutApi() {
  return requestClient.post<boolean>(`${SYSTEM}/auth/logout`);
}

/**
 * 获取登录用户的权限信息
 */
export function getUserPermissionApi() {
  return requestClient.get<AuthApi.PermissionResp>(`${SYSTEM}/auth/permission`);
}
