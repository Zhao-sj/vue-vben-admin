import type { ZenRequestConfig } from './typing';

import { RequestClient } from '@vben/request';
import { merge } from '@vben/utils';

class ZenRequestClient extends RequestClient {
  override delete<T = any>(url: string, config?: ZenRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  override get<T = any>(url: string, config?: ZenRequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  override post<T = any>(
    url: string,
    data?: any,
    config?: ZenRequestConfig,
  ): Promise<T> {
    return this.request<T>(url, { ...config, data, method: 'POST' });
  }

  override put<T = any>(
    url: string,
    data?: any,
    config?: ZenRequestConfig,
  ): Promise<T> {
    return this.request<T>(url, { ...config, data, method: 'PUT' });
  }

  override request<T = any>(url: string, config: ZenRequestConfig): Promise<T> {
    const defaultConfig: ZenRequestConfig = {
      errorMessageMode: 'message',
    };
    return super.request<T>(url, merge(defaultConfig, config));
  }
}

export { ZenRequestClient };
