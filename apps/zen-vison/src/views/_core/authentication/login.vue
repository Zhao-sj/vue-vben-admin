<script lang="ts" setup>
import type { Nullable } from '@vben/types';

import type { AuthApi } from '#/api';

import {
  AuthenticationLogin,
  type LoginAndRegisterParams,
  type VbenFormSchema,
  z,
} from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useDebounceFn } from '@vueuse/core';

import { useAuthStore } from '#/store';
import { encryptBySha256 } from '#/utils/cipher';

interface Props {
  modal?: boolean;
}

interface Emits {
  (e: 'submit', params: LoginAndRegisterParams): void;
}

defineOptions({ name: 'Login' });

const props = withDefaults(defineProps<Props>(), { modal: false });
const emit = defineEmits<Emits>();

const Captcha = defineAsyncComponent(
  () => import('#/components/Captcha/Captcha.vue'),
);

const authStore = useAuthStore();
const showCaptcha = ref(false);
let loginState: Nullable<AuthApi.LoginModel> = null;

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
  ];
});

const handleLogin = useDebounceFn((params: LoginAndRegisterParams) => {
  if (props.modal) {
    emit('submit', params);
    return;
  }
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
      :form-schema="formSchema"
      :loading="authStore.loginLoading"
      @submit="handleLogin"
    />

    <Captcha v-model="showCaptcha" random @success="handleValidateSuccess" />
  </div>
</template>
