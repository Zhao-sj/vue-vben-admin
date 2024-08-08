/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type {
  HttpResponse,
  InternalZenRequestConfig,
} from '#/utils/request/types';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import { useAccessStore } from '@vben/stores';

import { ResultEnum } from '#/enums';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';
import { ZenRequestClient } from '#/utils';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

function createRequestClient(baseURL: string) {
  const client = new ZenRequestClient({
    baseURL,
    // 为每个请求携带 Authorization
    makeAuthorization: () => {
      return {
        // 默认
        key: 'Authorization',
        tokenHandler: () => {
          const accessStore = useAccessStore();
          return {
            refreshToken: `${accessStore.refreshToken || ''}`,
            token: `${accessStore.accessToken || ''}`,
          };
        },
        unAuthorizedHandler: async () => {
          const accessStore = useAccessStore();
          const authStore = useAuthStore();
          accessStore.setAccessToken(null);

          if (preferences.app.loginExpiredMode === 'modal') {
            accessStore.setLoginExpired(true);
          } else {
            // 退出登录
            await authStore.logout();
          }
        },
      };
    },
    makeErrorMessage: (msg) => ElMessage.error(msg),

    makeRequestHeaders: () => {
      return {
        // 为每个请求携带 Accept-Language
        'Accept-Language': preferences.app.locale,
        // Tenant: '',
      };
    },
  });
  client.addResponseInterceptor<HttpResponse>((response) => {
    const {
      errorMessageMode,
      isReturnNativeResponse,
      isTransformResponse,
      successMessageMode,
    } = response.config as InternalZenRequestConfig;

    if (isReturnNativeResponse) {
      return response;
    }

    if (isTransformResponse === false) {
      return response.data;
    }

    const responseData = response.data;
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

    if (errorMessageMode === 'message') {
      ElMessage.error(msg);
    } else if (errorMessageMode === 'modal') {
      ElMessageBox.alert(msg, $t('zen.common.errorTitle'), { type: 'error' });
    }

    throw new Error(msg || $t('zen.request.requestError'));
  });
  return client;
}

export const requestClient = createRequestClient(apiURL);
