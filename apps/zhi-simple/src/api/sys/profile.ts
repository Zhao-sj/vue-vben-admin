import type { DeptApi } from './dept';

import type { BaseSimple } from '#/api/common';

import { ModuleEnum } from '#/api/common';
import { requestClient } from '#/api/request';

const { SYSTEM } = ModuleEnum;

export namespace UserProfileApi {
  export interface SocialUser {
    type: number;
    openid: string;
  }

  export interface UserInfo {
    id: number;
    username: string;
    nickname: string;
    sex: number;
    mobile?: string;
    email?: string;
    avatar?: string;
    loginIp: string;
    loginDate: number;
    createTime: number;
    roles: BaseSimple[];
    dept?: DeptApi.Simple;
    posts?: BaseSimple[];
    socialUsers: SocialUser[];
  }

  export interface UpdateModel {
    nickname: string;
    email?: string;
    mobile?: string;
    sex?: number;
  }

  export interface UpdatePasswordModel {
    oldPassword: string;
    newPassword: string;
  }
}

/**
 * 上传头像
 */
export function uploadAvatarApi(data: { file: File }) {
  return requestClient.upload<string>(
    `${SYSTEM}/user/profile/avatar`,
    {
      file: data.file,
    },
    { timeout: 0 },
  );
}

/**
 * 更新用户个人密码
 */
export function updateUserPasswordApi(
  data: UserProfileApi.UpdatePasswordModel,
) {
  return requestClient.put<boolean>(`${SYSTEM}/user/profile/password`, data);
}

/**
 * 更新用户个人信息
 */
export function updateUserProfileApi(data: UserProfileApi.UpdateModel) {
  return requestClient.put<boolean>(`${SYSTEM}/user/profile`, data);
}

/**
 * 获取登录用户信息
 */
export function getUserProfileApi() {
  return requestClient.get<UserProfileApi.UserInfo>(`${SYSTEM}/user/profile`);
}
