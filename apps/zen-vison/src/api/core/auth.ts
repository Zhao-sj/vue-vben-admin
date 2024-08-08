import type { Nullable } from '@vben/types';

import type { HttpResponse } from '#/utils/request/types';

import { SYSTEM } from '#/api/module';
import { requestClient } from '#/api/request';
import { CaptchaEnum } from '#/enums';

export namespace AuthApi {
  export interface CaptchaResp {
    basemap: string;
    secretKey: Nullable<string>;
    slider: Nullable<string>;
    token: string;
    wordList: Nullable<string[]>;
  }

  export interface CheckCaptchaModel {
    captchaType: string;
    pointJson: string;
    token: string;
  }

  /** 登录接口参数 */
  export interface LoginParams {
    password: string;
    username: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
    desc: string;
    realName: string;
    refreshToken: string;
    userId: string;
    username: string;
  }
}

/**
 * 获取验证码
 */
export async function getCaptchaApi(captchaType = CaptchaEnum.BLOCK_PUZZLE) {
  return requestClient.post<AuthApi.CaptchaResp>(`${SYSTEM}/captcha/get`, {
    captchaType,
  });
}

/**
 * 校验验证码
 */
export async function checkCaptchaApi(data: AuthApi.CheckCaptchaModel) {
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
export async function login(_: AuthApi.LoginParams) {
  return {
    accessToken: 'dmJlbg==',
    refreshToken: 'dmJlbg==',
  };
}

/**
 * 获取用户权限码
 */
export async function getAccessCodes() {
  return ['AC_100100', 'AC_100110', 'AC_100120', 'AC_100010'];
}
