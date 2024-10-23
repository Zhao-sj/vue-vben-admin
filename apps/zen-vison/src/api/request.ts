/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { InternalZenRequestConfig } from '#/utils/request/typing';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import { errorMessageResponseInterceptor } from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { ResultEnum } from '#/enums';
import { $t } from '#/locales';
import { useAuthStore, useUserStore, useWsStore } from '#/store';
import { authenticateResponseHandler, ZenRequestClient } from '#/utils';

import { refreshTokenApi } from './core/auth';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string) {
  const client = new ZenRequestClient({
    baseURL,
  });

  /**
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired.');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const wsStore = useWsStore();

    wsStore.disconnect();
    const { refreshToken, accessToken } = await refreshTokenApi(
      accessStore.refreshToken as string,
    );
    accessStore.setAccessToken(accessToken);
    accessStore.setRefreshToken(refreshToken);
    wsStore.connect(accessToken);
    return accessToken;
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();
      const userStore = useUserStore();

      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = preferences.app.locale;
      if (userStore.tenantId) {
        config.headers.Tenant = userStore.tenantId;
      }

      return config;
    },
  });

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string) => ElMessage.error(msg)),
  );

  // 响应结果处理
  client.addResponseInterceptor({
    fulfilled: async (response) => {
      const {
        errorMessageMode,
        isReturnNativeResponse,
        isTransformResponse,
        responseType,
        successMessageMode,
      } = response.config as InternalZenRequestConfig;

      if (isReturnNativeResponse) {
        return response;
      }

      if (isTransformResponse === false) {
        return response.data;
      }

      let responseData = response.data;
      if (responseType === 'blob') {
        // 数据导出错误处理
        const blobTypeData = response.data as unknown as Blob;
        if (blobTypeData.type !== 'application/json') {
          return response;
        }
        responseData = await new Response(blobTypeData).json();
      }

      const { code, data, msg } = responseData;
      const hasSuccess =
        responseData &&
        Reflect.has(responseData, 'code') &&
        code === ResultEnum.SUCCESS;
      if (hasSuccess) {
        let successMsg = msg;

        if (!successMsg) {
          successMsg = $t('page.success');
        }

        if (successMessageMode === 'message') {
          ElMessage.success(successMsg);
        } else if (successMessageMode === 'modal') {
          ElMessageBox.alert(successMsg, $t('page.successTip'), {
            type: 'success',
          });
        }

        return data;
      }

      if (code === ResultEnum.UN_AUTHORIZED) {
        return authenticateResponseHandler({
          response,
          client,
          doReAuthenticate,
          doRefreshToken,
          enableRefreshToken: preferences.app.enableRefreshToken,
          formatToken,
        });
      }

      if (errorMessageMode === 'message') {
        ElMessage.error(msg);
      } else if (errorMessageMode === 'modal') {
        ElMessageBox.alert(msg, $t('page.errorTip'), { type: 'error' });
      }

      throw new Error(msg || $t('page.request.error'));
    },
  });

  return client;
}

export const requestClient = createRequestClient(apiURL);
