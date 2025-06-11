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

const REMEMBER_TENANT_KEY = `REMEMBER_ME_TENANT_${location.hostname}`;
const localTenant = localStorage.getItem(REMEMBER_TENANT_KEY) || '';

const loginRef = useTemplateRef('login');
const tenantName = ref('');
const showCaptcha = ref(false);
let loginState: Nullable<AuthApi.LoginModel> = null;

const {
  loading,
  data: tenantList,
  runAsync: fetchTenantList,
} = useRequest(
  async ({ keyword }: Record<string, any>) => {
    if (!keyword) return;
    return getTenantListByNameApi(keyword);
  },
  { manual: true },
);

const remeberMe = computed(() => loginRef.value?.getRememberMe());

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'ApiSelect',
    componentProps: {
      api: fetchTenantList,
      afterFetch: (data: BaseSimple[]) => {
        if (!data && localTenant) {
          const tenant = JSON.parse(localTenant);
          if (tenant) {
            data = [tenant];
          }
        }
        return data?.map((item) => ({ label: item.name, value: item.id }));
      },
      remoteMethod: useDebounceFn((value: string) => {
        tenantName.value = value;
      }),
      params: {
        keyword: tenantName.value || undefined,
      },
      loading: loading.value,
      remote: true,
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

  const tenant = tenantList.value?.find((item) => item.id === state.tenant);
  if (tenant) {
    localStorage.setItem(
      REMEMBER_TENANT_KEY,
      JSON.stringify(remeberMe.value ? tenant : ''),
    );
  }

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

onMounted(() => {
  if (localTenant) {
    const tenant = JSON.parse(localTenant);
    if (tenant) {
      loginRef.value?.getFormApi().setFieldValue('tenant', tenant.id);
    }
  }
});
</script>

<template>
  <div>
    <AuthenticationLogin
      ref="login"
      class="h-[550px]"
      :form-schema="formSchema"
      :loading="authStore.loginLoading"
      @submit="handleLogin"
    />

    <Captcha v-model="showCaptcha" random @success="handleValidateSuccess" />
  </div>
</template>
