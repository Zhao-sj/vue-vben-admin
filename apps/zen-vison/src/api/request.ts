/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { InternalZenRequestConfig } from '#/utils/request/types';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import { errorMessageResponseInterceptor } from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { hasUnAuthentication, ResultEnum } from '#/enums';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';
import { ZenRequestClient } from '#/utils';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string) {
  const client = new ZenRequestClient({
    baseURL,
  });

  // 请求头处理
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();

      config.headers.Authorization = accessStore.accessToken;
      config.headers['Accept-Language'] = preferences.app.locale;
      config.headers.Tenant = 1; // TODO 登录时多租户选择暂不处理
      return config;
    },
  });

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
          return blobTypeData;
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
          successMsg = $t('zen.common.successTip');
        }

        if (successMessageMode === 'message') {
          ElMessage.success(successMsg);
        } else if (successMessageMode === 'modal') {
          ElMessageBox.alert(successMsg, $t('zen.common.successTitle'), {
            type: 'success',
          });
        }

        return data;
      }

      if (hasUnAuthentication(code)) {
        const accessStore = useAccessStore();
        const authStore = useAuthStore();
        accessStore.setAccessToken(null);

        if (preferences.app.loginExpiredMode === 'modal') {
          accessStore.setLoginExpired(true);
          code !== ResultEnum.UN_AUTHORIZED && ElMessage.error(msg);
          throw new Error(msg || $t('zen.request.requestExpire'));
        }

        // 退出登录
        await authStore.logout();
      }

      if (errorMessageMode === 'message') {
        ElMessage.error(msg);
      } else if (errorMessageMode === 'modal') {
        ElMessageBox.alert(msg, $t('zen.common.errorTitle'), { type: 'error' });
      }

      throw new Error(msg || $t('zen.request.requestError'));
    },
  });

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string) => ElMessage.error(msg)),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL);
