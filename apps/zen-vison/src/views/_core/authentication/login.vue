<script lang="ts" setup>
import type { Nullable } from '@vben/types';

import {
  AuthenticationLogin,
  type LoginAndRegisterParams,
  type VbenFormSchema,
  z,
} from '@vben/common-ui';

import { useDebounceFn } from '@vueuse/core';
import { ElInput } from 'element-plus';

import { type AuthApi } from '#/api';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';
import { encryptBySha256 } from '#/utils/cipher';

import TenantSelect from './tenant-select.vue';

interface Props {
  modal?: boolean;
}

interface Emits {
  (e: 'submit', params: AuthApi.LoginModel): void;
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

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: markRaw(TenantSelect),
    componentProps: {
      clearable: true,
      placeholder: $t('zen.common.pleaseInput', [$t('zen.login.tenant')]),
      size: 'large',
    },
    fieldName: 'tenant',
    label: $t('zen.login.tenant'),
    rules: z.string().min(1, {
      message: $t('zen.common.pleaseInput', [$t('zen.login.tenant')]),
    }),
  },
  {
    component: markRaw(ElInput),
    componentProps: {
      clearable: true,
      placeholder: $t('zen.common.pleaseInput', [$t('zen.login.username')]),
      size: 'large',
    },
    fieldName: 'username',
    label: $t('zen.login.username'),
    rules: z.string().min(1, {
      message: $t('zen.common.pleaseInput', [$t('zen.login.username')]),
    }),
  },
  {
    component: markRaw(ElInput),
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [$t('zen.login.password')]),
      showPassword: true,
      size: 'large',
      type: 'password',
    },
    fieldName: 'password',
    label: $t('zen.login.password'),
    rules: z.string().min(1, {
      message: $t('zen.common.pleaseInput', [$t('zen.login.password')]),
    }),
  },
]);

const handleLogin = useDebounceFn((params: LoginAndRegisterParams) => {
  if (props.modal) {
    emit('submit', params as AuthApi.LoginModel);
    return;
  }
  loginState = params as AuthApi.LoginModel;
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
