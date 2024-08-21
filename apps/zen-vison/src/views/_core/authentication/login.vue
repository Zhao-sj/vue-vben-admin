<script lang="ts" setup>
import type { Nullable } from '@vben/types';

import type { AuthApi } from '#/api';

import {
  AuthenticationLogin,
  type LoginAndRegisterParams,
} from '@vben/common-ui';

import { useDebounceFn } from '@vueuse/core';

import { Captcha } from '#/components';
import { useAuthStore } from '#/store';
import { encryptBySha256 } from '#/utils';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const showCaptcha = ref(false);
let loginState: Nullable<AuthApi.LoginModel> = null;

const handleLogin = useDebounceFn((params: LoginAndRegisterParams) => {
  loginState = params;
  showCaptcha.value = true;
});

function handleValidateSuccess(captcah: string) {
  if (!loginState) {
    return;
  }

  loginState.password = encryptBySha256(loginState.password);
  loginState.captcha = captcah;
  authStore.authLogin(loginState);
}
</script>

<template>
  <div>
    <AuthenticationLogin
      :loading="authStore.loginLoading"
      :password-placeholder="$t('zen.login.passwordPlaceholder')"
      :username-placeholder="$t('zen.login.usernamePlaceholder')"
      @submit="handleLogin"
    />

    <Captcha v-model="showCaptcha" random @success="handleValidateSuccess" />
  </div>
</template>
