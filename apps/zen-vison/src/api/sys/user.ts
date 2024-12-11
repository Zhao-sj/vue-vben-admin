import type { Nullable, Recordable } from '@vben/types';

import { ModuleEnum, type PageParam, type PageResult } from '#/api/common';
import { requestClient } from '#/api/request';

const { SYSTEM } = ModuleEnum;

export namespace UserApi {
  export interface Simple {
    id: number;
    nickname: Nullable<string>;
    deptId: Nullable<number>;
    deptName: Nullable<string>;
  }

  export interface PageQuery {
    username?: string;
    mobile?: string;
    deptId?: number;
    status?: number;
    createTime?: string;
  }

  export interface User {
    id: number;
    username: string;
    nickname: Nullable<string>;
    remark: Nullable<string>;
    deptId: Nullable<number>;
    deptName: Nullable<string>;
    postIds: number[];
    email: Nullable<string>;
    mobile: Nullable<string>;
    sex: number;
    avatar: Nullable<string>;
    status: number;
    loginIp: Nullable<string>;
    loginDate: Nullable<number>;
    createTime: number;
  }

  export interface AddModel {
    username: string;
    nickname: string;
    remark?: string;
    deptId?: number;
    postIds?: number[];
    email?: string;
    mobile?: string;
    sex?: number;
    avatar?: string;

    /** 使用SHA256消息摘要 */
    password: string;
  }

  export interface UpdateModel extends Omit<AddModel, 'password'> {
    id: number;
  }

  export interface UpdateStatusModel {
    id: number;
    status: number;
  }

  export interface UpdatePasswordModel {
    id: number;

    /** 使用SHA256消息摘要 */
    password: string;
  }

  export interface ImportResp {
    createUserList: string[];
    updateUserList: string[];
    failureUsers: Recordable<string>;
  }

  export interface AssignRoleModel {
    userId: number;
    roleIds: number[];
  }
}

/**
 * 赋予用户角色
 */
export function assignUserRoleApi(data: UserApi.AssignRoleModel) {
  return requestClient.post<boolean>(
    `${SYSTEM}/permission/assign-user-role`,
    data,
  );
}

/**
 * 获取用户拥有的角色编号列表
 */
export function getUserRoleListApi(userId: number) {
  return requestClient.get<number[]>(`${SYSTEM}/permission/user-role-list`, {
    params: { userId },
  });
}

/**
 * 批量删除用户
 */
export function batchDeleteUserApi(ids: number[]) {
  return requestClient.delete<boolean>(`${SYSTEM}/user`, { data: { ids } });
}

/**
 * 删除用户
 */
export function deleteUserApi(id: number) {
  return requestClient.delete<boolean>(`${SYSTEM}/user/${id}`);
}

/**
 * 重置用户密码
 */
export function resetUserPasswordApi(data: UserApi.UpdatePasswordModel) {
  return requestClient.put<boolean>(`${SYSTEM}/user/password`, data);
}

/**
 * 更新用户状态
 */
export function updateUserStatusApi(data: UserApi.UpdateStatusModel) {
  return requestClient.put<boolean>(`${SYSTEM}/user/status`, data);
}

/**
 * 更新用户信息
 */
export function updateUserApi(data: UserApi.UpdateModel) {
  return requestClient.put<boolean>(`${SYSTEM}/user`, data);
}

/**
 * 创建用户
 */
export function addUserApi(data: UserApi.AddModel) {
  return requestClient.post<number>(`${SYSTEM}/user`, data);
}

/**
 * 导出用户
 */
export function exportUserApi(params: UserApi.PageQuery) {
  return requestClient.download(`${SYSTEM}/user/export`, {
    params,
    timeout: 0,
  });
}

/**
 * 导入用户
 */
export function importUserApi(file: Blob | File, updateSupport: boolean) {
  return requestClient.upload<UserApi.ImportResp>(
    `${SYSTEM}/user/import`,
    { file },
    {
      params: { updateSupport },
      timeout: 0,
    },
  );
}

/**
 * 获取用户导入模板
 */
export function getUserImportTemplateApi() {
  return requestClient.download(`${SYSTEM}/user/import/template`);
}

/**
 * 获取用户信息
 */
export function getUserApi(id: number) {
  return requestClient.get<UserApi.User>(`${SYSTEM}/user/${id}`);
}

/**
 * 获取用户分页列表
 */
export function getUserPageListApi(params: PageParam & UserApi.PageQuery) {
  return requestClient.get<PageResult<UserApi.User>>(`${SYSTEM}/user`, {
    params,
  });
}

/**
 * 获取用户精简列表
 */
export function getUserSimpleListApi() {
  return requestClient.get<UserApi.Simple[]>(`${SYSTEM}/user/simple`);
}
