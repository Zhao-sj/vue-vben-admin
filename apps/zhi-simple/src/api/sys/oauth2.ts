import type { Nullable } from '@vben/types';

import type { PageParam, PageResult, UpdateStatus } from '#/api/common';

import { ModuleEnum } from '#/api/common';
import { requestClient } from '#/api/request';

const { SYSTEM } = ModuleEnum;

export namespace OAuth2Api {
  export interface ClientPageQuery {
    name?: string;
    status?: number;
  }

  export interface Client {
    id: number;
    clientId: string;
    secret: string;
    name: string;
    logo: string;
    description: Nullable<string>;
    status: number;
    accessTokenValiditySeconds: number;
    refreshTokenValiditySeconds: number;
    redirectUris: string[];
    authorizedGrantTypes: string[];
    scopes: string[];
    autoApproveScopes: string[];
    authorities: string[];
    resourceIds: string[];
    additionalInformation: Nullable<string>;
    createTime: number;
  }

  export interface AddModel {
    clientId: string;
    secret: string;
    name: string;
    logo: string;
    description?: string;
    status: number;
    accessTokenValiditySeconds: number;
    refreshTokenValiditySeconds: number;
    redirectUris: string[];
    authorizedGrantTypes: string[];
    scopes?: string[];
    autoApproveScopes?: string[];
    authorities?: string[];
    resourceIds?: number[];
    additionalInformation?: string;
  }

  export interface UpdateModel extends AddModel {
    id: number;
  }

  export interface TokenPageQuery {
    clientId?: string;
    userId?: number;
    userType?: number;
  }

  export interface AccessToken {
    id: number;
    accessToken: string;
    refreshToken: string;
    userId: number;
    userType: number;
    clientId: string;
    createTime: number;
    expiresTime: number;
  }
}

/**
 * 删除访问令牌
 */
export function deleteAccessTokenApi(accessToken: string) {
  return requestClient.delete<boolean>(`${SYSTEM}/oauth2/token/${accessToken}`);
}

/**
 * 获取有效期内的令牌分页
 */
export function getOAuth2TokenPageApi(
  params: OAuth2Api.TokenPageQuery & PageParam,
) {
  return requestClient.get<PageResult<OAuth2Api.AccessToken>>(
    `${SYSTEM}/oauth2/token`,
    { params },
  );
}

/**
 * 批量删除OAuth2客户端
 */
export function batchDeleteOAuth2ClientApi(ids: number[]) {
  return requestClient.delete<boolean>(`${SYSTEM}/oauth2/client`, {
    data: { ids },
  });
}

/**
 * 删除OAuth2客户端
 */
export function deleteOAuth2ClientApi(id: number) {
  return requestClient.delete<boolean>(`${SYSTEM}/oauth2/client/${id}`);
}

/**
 * 更新OAuth2客户端状态
 */
export function updateOAuth2ClientStatusApi(data: UpdateStatus) {
  return requestClient.put<boolean>(`${SYSTEM}/oauth2/client/status`, data);
}

/**
 * 更新OAuth2客户端信息
 */
export function updateOAuth2ClientApi(data: OAuth2Api.UpdateModel) {
  return requestClient.put<boolean>(`${SYSTEM}/oauth2/client`, data);
}

/**
 * 创建OAuth2客户端
 */
export function addOAuth2ClientApi(data: OAuth2Api.AddModel) {
  return requestClient.post<number>(`${SYSTEM}/oauth2/client`, data);
}

/**
 * 获取OAuth2客户端信息
 */
export function getOAuth2ClientApi(id: number) {
  return requestClient.get<OAuth2Api.Client>(`${SYSTEM}/oauth2/client/${id}`);
}

/**
 * 获取OAuth2客户端分页
 */
export function getOAuth2ClientPageApi(
  params: OAuth2Api.ClientPageQuery & PageParam,
) {
  return requestClient.get<PageResult<OAuth2Api.Client>>(
    `${SYSTEM}/oauth2/client`,
    { params },
  );
}
