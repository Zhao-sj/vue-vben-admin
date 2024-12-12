import type { AxiosRequestConfig } from '@vben/request';
import type { Nullable } from '@vben/types';

import { v4 as uuidv4 } from 'uuid';

import { ModuleEnum, type PageParam, type PageResult } from '#/api/common';
import { requestClient } from '#/api/request';
import { FileStorageEnum } from '#/enums';
import { encryptBySha256 } from '#/utils';

const { INFRA } = ModuleEnum;

export namespace FileApi {
  export interface ConfigPageQuery {
    name?: string;
    storage?: string;
    createTime?: string;
  }

  export interface DBConfig {
    domain: string;
  }

  export interface LocalConfig {
    domain: string;
    basePath: string;
  }

  export interface FtpConfig {
    domain: string;
    basePath: string;
    host: string;
    port: number;
    username: string;
    password: string;
    mode: string;
  }

  export interface SFtpConfig {
    domain: string;
    basePath: string;
    host: string;
    port: number;
    username: string;
    password: string;
  }

  export interface S3Config {
    domain?: string;
    endpoint: string;
    bucket: string;
    accessKey: string;
    accessSecret: string;
  }

  export type FileConfig =
    | DBConfig
    | FtpConfig
    | LocalConfig
    | S3Config
    | SFtpConfig;

  export interface Config {
    id: number;
    name: string;
    storage: number;
    master: boolean;
    config: FileConfig;
    remark: Nullable<string>;
    createTime: number;
  }

  export interface Master {
    id: number;
    name: string;
    storage: number;
  }

  export interface AddConfigModel {
    name: string;
    storage: string;
    config: FileConfig;
    remark?: string;
  }

  export interface UpdateConfigModel extends AddConfigModel {
    id: number;
  }

  export interface PageQuery {
    type?: string;
    path?: string;
    createTime?: string;
  }

  export interface FileItem {
    id: number;
    configId: number;
    name: string;
    path: string;
    url: string;
    type: Nullable<string>;
    size: number;
    createTime: number;
  }

  export interface PreSigned {
    configId: number;
    uploadUrl: string;
    url: string;
  }

  export interface AddModel {
    configId: number;
    name: string;
    path: string;
    type?: string;
    size?: number;
    url: string;
  }

  export interface UploadModel {
    file: File;
    path?: string;
  }
}

/**
 * 上传文件，如果存储器是S3则默认前端直接上传
 */
export async function uploadFileApi(
  data: FileApi.UploadModel,
  config?: AxiosRequestConfig,
) {
  const timeout = config?.timeout || 0;
  const { storage } = await getMasterFileConfigApi();
  if (storage !== FileStorageEnum.S3) {
    return await uploadFileByServerApi(data, {
      ...config,
      timeout,
    });
  }

  const file = data.file;
  const hash = encryptBySha256(uuidv4());
  const suffix = file.name.split('.').pop();
  const fileName = suffix ? `${hash}.${suffix}` : hash;

  const presignedInfo = await getFilePreSignedApi(fileName);
  // S3前端直接上传
  await requestClient.put(presignedInfo.uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    ...config,
    timeout,
  });

  // 记录文件信息到后端（异步）
  addFileApi({
    configId: presignedInfo.configId,
    url: presignedInfo.url,
    path: fileName,
    name: file.name,
    type: file.type,
    size: file.size,
  });

  return presignedInfo.url;
}

/**
 * 后端上传文件
 */
export function uploadFileByServerApi(
  data: FileApi.UploadModel,
  config?: AxiosRequestConfig,
) {
  return requestClient.upload<string>(`${INFRA}/file/upload`, data, config);
}

/**
 * 获取文件预签名信息
 */
export function getFilePreSignedApi(path: string) {
  return requestClient.get<FileApi.PreSigned>(`${INFRA}/file/pre-signed-url`, {
    params: { path },
  });
}

/**
 * 删除文件
 */
export function deleteFileApi(id: number) {
  return requestClient.delete<boolean>(`${INFRA}/file/${id}`);
}

/**
 * 创建文件
 */
export function addFileApi(data: FileApi.AddModel) {
  return requestClient.post<number>(`${INFRA}/file`, data);
}

/**
 * 获取文件分页列表
 */
export function getFilePageApi(params: FileApi.PageQuery & PageParam) {
  return requestClient.get<PageResult<FileApi.FileItem>>(`${INFRA}/file`, {
    params,
  });
}

/**
 * 测试文件配置是否正确
 */
export function testFileConfigApi(id: number) {
  return requestClient.get<string>(`${INFRA}/file-config/test/${id}`);
}

/**
 * 删除文件配置
 */
export function deleteFileConfigApi(id: number) {
  return requestClient.delete<boolean>(`${INFRA}/file-config/${id}`);
}

/**
 * 更新文件配置为 master
 */
export function updateFileConfigMasterApi(id: number) {
  return requestClient.put<boolean>(`${INFRA}/file-config/master`, { id });
}

/**
 * 更新文件配置信息
 */
export function updateFileConfigApi(data: FileApi.UpdateConfigModel) {
  return requestClient.put<boolean>(`${INFRA}/file-config`, data);
}

/**
 * 创建文件配置
 */
export function addFileConfigApi(data: FileApi.AddConfigModel) {
  return requestClient.post<number>(`${INFRA}/file-config`, data);
}

/**
 * 获取 Master 文件配置信息
 */
export function getMasterFileConfigApi() {
  return requestClient.get<FileApi.Master>(`${INFRA}/file-config/master`);
}

/**
 * 获取文件配置信息
 */
export function getFileConfigApi(id: number) {
  return requestClient.get<FileApi.Config>(`${INFRA}/file-config/${id}`);
}

/**
 * 获取文件配置分页列表
 */
export function getFileConfigPageApi(
  params: FileApi.ConfigPageQuery & PageParam,
) {
  return requestClient.get<PageResult<FileApi.Config>>(`${INFRA}/file-config`, {
    params,
  });
}
