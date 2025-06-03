<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Nullable } from '@vben/types';

import type { AuthApi, BaseSimple } from '#/api';

import { AuthenticationLogin, z } from '@vben/common-ui';

import { useDebounceFn } from '@vueuse/core';
import { ElInput } from 'element-plus';
import { cloneDeep } from 'lodash-es';

import { getTenantListByNameApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';
import { encryptBySha256 } from '#/utils/cipher';

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
const tenantName = ref('');
const showCaptcha = ref(false);
let loginState: Nullable<AuthApi.LoginModel> = null;

const { loading, runAsync: fetchTenantList } = useRequest(
  async ({ keyword }: Record<string, any>) => {
    if (!keyword) return;
    return getTenantListByNameApi(keyword);
  },
  { manual: true },
);

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'ApiSelect',
    componentProps: {
      api: fetchTenantList,
      afterFetch: (data: BaseSimple[]) =>
        data?.map((item) => ({ label: item.name, value: item.id })),
      remoteMethod: useDebounceFn((value: string) => {
        tenantName.value = value;
      }),
      params: {
        keyword: tenantName.value || undefined,
      },
      loading: loading.value,
      remote: true,
      remoteShowSuffix: true,
      filterable: true,
      reserveKeyword: false,
      appendTo: 'body',
      popperClass: '!z-[9999999999]',
      placeholder: $t('page.pleaseInput', [$t('page.login.tenant')]),
      size: 'large',
    },
    fieldName: 'tenant',
    label: $t('page.login.tenant'),
    rules: 'selectRequired',
  },
  {
    component: markRaw(ElInput),
    componentProps: {
      clearable: true,
      placeholder: $t('page.pleaseInput', [$t('page.login.username')]),
      size: 'large',
    },
    fieldName: 'username',
    label: $t('page.login.username'),
    rules: z.string().min(1, {
      message: $t('page.pleaseInput', [$t('page.login.username')]),
    }),
  },
  {
    component: markRaw(ElInput),
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('page.login.password')]),
      showPassword: true,
      size: 'large',
      type: 'password',
    },
    fieldName: 'password',
    label: $t('page.login.password'),
    rules: z.string().min(1, {
      message: $t('page.pleaseInput', [$t('page.login.password')]),
    }),
  },
]);

const handleLogin = useDebounceFn((params: Record<string, any>) => {
  const state = cloneDeep(params) as AuthApi.LoginModel;
  if (props.modal) {
    emit('submit', state);
    return;
  }

  loginState = state;
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
      class="h-[550px]"
      :form-schema="formSchema"
      :loading="authStore.loginLoading"
      @submit="handleLogin"
    />

    <Captcha v-model="showCaptcha" random @success="handleValidateSuccess" />
  </div>
</template>
