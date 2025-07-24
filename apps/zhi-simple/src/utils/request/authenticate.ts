import type { AxiosResponse } from '@vben/request';

import type { ZenRequestClient } from './zen-request-client';

import { $t } from '#/locales';

interface AuthenticateOpts {
  client: ZenRequestClient;
  doReAuthenticate: () => Promise<void>;
  doRefreshToken: () => Promise<string>;
  formatToken: (token: string) => null | string;
  response: AxiosResponse;
  enableRefreshToken: boolean;
}

export async function authenticateResponseHandler({
  response,
  client,
  doReAuthenticate,
  doRefreshToken,
  formatToken,
  enableRefreshToken,
}: AuthenticateOpts) {
  const { config } = response;

  // 判断是否启用了 refreshToken 功能
  // 如果没有启用或者已经是重试请求了，直接跳转到重新登录
  if (!enableRefreshToken || (config as Record<string, any>).__isRetryRequest) {
    await doReAuthenticate();
    throw new Error($t('page.request.expire'));
  }
  // 如果正在刷新 token，则将请求加入队列，等待刷新完成
  if (client.isRefreshing) {
    return new Promise((resolve) => {
      client.refreshTokenQueue.push((newToken: string) => {
        config.headers.Authorization = formatToken(newToken);
        resolve(client.request(config.url as string, { ...config }));
      });
    });
  }

  // 标记开始刷新 token
  client.isRefreshing = true;
  // 标记当前请求为重试请求，避免无限循环
  (config as Record<string, any>).__isRetryRequest = true;

  try {
    const newToken = await doRefreshToken();

    // 处理队列中的请求
    client.refreshTokenQueue.forEach((callback) => callback(newToken));
    // 清空队列
    client.refreshTokenQueue = [];

    return client.request(config.url as string, { ...config });
  } catch {
    // 如果刷新 token 失败，处理错误（如强制登出或跳转登录页面）
    client.refreshTokenQueue = [];
    console.error('Refresh token failed, please login again.');
    await doReAuthenticate();
    throw new Error($t('page.request.expire'));
  } finally {
    client.isRefreshing = false;
  }
}
