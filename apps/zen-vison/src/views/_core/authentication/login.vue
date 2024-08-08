<script lang="ts" setup>
import {
  AuthenticationLogin,
  type LoginAndRegisterParams,
} from '@vben/common-ui';
import { Nullable } from '@vben/types';

import { Captcha } from '#/components';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();
const showCaptcha = ref(false);
let loginState: Nullable<LoginAndRegisterParams> = null;

function handleLogin(params: LoginAndRegisterParams) {
  loginState = params;
  showCaptcha.value = true;
}

function handleValidateSuccess(captcah: string) {
  // eslint-disable-next-line no-console
  console.log('登录验证码', captcah);
  authStore.authLogin(loginState!);
}
</script>

<template>
  <div>
    <AuthenticationLogin
      :loading="authStore.loginLoading"
      password-placeholder="123456"
      username-placeholder="vben"
      @submit="handleLogin"
    />

    <Captcha v-model="showCaptcha" random @success="handleValidateSuccess" />
  </div>
</template>
