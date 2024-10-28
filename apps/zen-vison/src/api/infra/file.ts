import type { Nullable } from '@vben/types';

import { ModuleEnum, type PageParam, type PageResult } from '#/api/common';
import { requestClient } from '#/api/request';

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

  export interface AddModel {
    configId: string;
    name: string;
    path: string;
    type?: string;
    size?: string;
    url: string;
  }

  export interface UploadModel {
    file: Blob | File;
    path?: string;
  }
}

/**
 * 上传文件
 */
export function uploadFileApi(data: FileApi.UploadModel) {
  return requestClient.upload<string>(`${INFRA}/file/upload`, data);
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
