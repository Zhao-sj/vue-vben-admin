import type { Nullable, UserInfo } from '@vben/types';

import type { AuthApi } from '#/api';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { DEFAULT_HOME_PATH, LOGIN_PATH } from '@vben/constants';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import { getUserPermissionApi, userLoginApi, userLogoutApi } from '#/api';
import { $t } from '#/locales';
import { useUserStore as useZenUserStore } from '#/store';

export const useAuthStore = defineStore('zen-auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const zenUserStore = useZenUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: AuthApi.LoginModel,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: Nullable<AuthApi.User> = null;
    try {
      loginLoading.value = true;
      const { accessToken } = await userLoginApi(params);

      // 如果成功获取到 accessToken
      if (accessToken) {
        // 将 accessToken 存储到 accessStore 中
        accessStore.setAccessToken(accessToken);

        // 获取用户信息并存储到 accessStore 中
        const { user } = (await fetchUserInfo()) || {};
        if (user) {
          userInfo = user;
        }

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(DEFAULT_HOME_PATH);
        }

        if (userInfo?.nickname) {
          ElNotification({
            message: `${$t('authentication.loginSuccessDesc')}: ${userInfo?.nickname}`,
            title: $t('authentication.loginSuccess'),
            type: 'success',
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect = true) {
    try {
      if (accessStore.accessToken) {
        await userLogoutApi();
      }
    } finally {
      resetAllStores();
      accessStore.setLoginExpired(false);

      // 回登陆页带上当前路由地址
      await router.replace({
        path: LOGIN_PATH,
        query: redirect
          ? {
              redirect: encodeURIComponent(router.currentRoute.value.fullPath),
            }
          : {},
      });
    }
  }

  async function fetchUserInfo() {
    let userInfo: Nullable<AuthApi.PermissionResp> = null;
    try {
      const userPermission = await getUserPermissionApi();
      const { permissions, roles, user } = userPermission;
      userInfo = userPermission;
      const vbenUserInfo = {
        avatar: user.avatar,
        realName: user.nickname,
        roles,
        userId: user.id,
        username: user.username,
      } as unknown as UserInfo;
      userStore.setUserInfo(vbenUserInfo); // 适配 vben userStore
      zenUserStore.setUserInfo(user);
      zenUserStore.setRoles(roles);
      accessStore.setAccessCodes(permissions);
      return userInfo;
    } catch {
      return userInfo;
    }
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
