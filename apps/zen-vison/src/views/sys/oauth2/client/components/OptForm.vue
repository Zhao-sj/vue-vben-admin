<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import SelectCreate from './SelectCreate.vue';

const dictStore = useDictStore();

const authorizedGrantTypes = [
  { label: $t('zen.service.oauth2.client.passwordMode'), value: 'password' },
  {
    label: $t('zen.service.oauth2.client.authorizationCodeMode'),
    value: 'authorization_code',
  },
  { label: $t('zen.service.oauth2.client.implicitMode'), value: 'implicit' },
  {
    label: $t('zen.service.oauth2.client.clientCredentialsMode'),
    value: 'client_credentials',
  },
  {
    label: $t('zen.service.oauth2.client.refreshTokenMode'),
    value: 'refresh_token',
  },
];

const scopes = ['user.read', 'user.write'].map((item) => ({
  label: item,
  value: item,
}));

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'logo',
    label: $t('zen.service.oauth2.client.logo'),
    formItemClass: 'lg:col-span-2',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.oauth2.client.name'),
      ]),
    },
    fieldName: 'name',
    label: $t('zen.service.oauth2.client.name'),
    rules: 'required',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS).map((item) => ({
        ...item,
        value: +item.value,
      })),
      optionType: 'button',
    },
    defaultValue: 0,
    fieldName: 'status',
    label: $t('zen.service.oauth2.client.status'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.oauth2.client.clientId'),
      ]),
    },
    fieldName: 'clientId',
    label: $t('zen.service.oauth2.client.clientId'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.oauth2.client.secret'),
      ]),
    },
    fieldName: 'secret',
    label: $t('zen.service.oauth2.client.secret'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 1,
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.oauth2.client.accessTokenValiditySeconds', [
          $t('zen.service.oauth2.client.unit'),
        ]),
      ]),
    },
    fieldName: 'accessTokenValiditySeconds',
    label: $t('zen.service.oauth2.client.accessTokenValiditySeconds'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 1,
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.oauth2.client.refreshTokenValiditySeconds', [
          $t('zen.service.oauth2.client.unit'),
        ]),
      ]),
    },
    fieldName: 'refreshTokenValiditySeconds',
    label: $t('zen.service.oauth2.client.refreshTokenValiditySeconds'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      autosize: {
        maxRows: 5,
        minRows: 3,
      },
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.oauth2.client.description'),
      ]),
      resize: 'none',
      type: 'textarea',
    },
    fieldName: 'description',
    formItemClass: 'lg:col-span-2',
    label: $t('zen.service.oauth2.client.description'),
  },
  {
    component: 'Select',
    componentProps: {
      multiple: true,
      options: authorizedGrantTypes,
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.oauth2.client.authorizedGrantTypes'),
      ]),
    },
    fieldName: 'authorizedGrantTypes',
    formItemClass: 'lg:col-span-2',
    label: $t('zen.service.oauth2.client.authorizedGrantTypes'),
    rules: 'selectRequired',
  },
  {
    component: 'Select',
    componentProps: {
      multiple: true,
      options: scopes,
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.oauth2.client.scopes'),
      ]),
    },
    fieldName: 'scopes',
    formItemClass: 'lg:col-span-2',
    label: $t('zen.service.oauth2.client.scopes'),
  },
  {
    component: 'Select',
    componentProps: {
      multiple: true,
      options: scopes,
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.oauth2.client.autoApproveScopes'),
      ]),
    },
    fieldName: 'autoApproveScopes',
    formItemClass: 'lg:col-span-2',
    label: $t('zen.service.oauth2.client.autoApproveScopes'),
  },
  {
    component: shallowRef(SelectCreate),
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.oauth2.client.redirectUris'),
      ]),
    },
    fieldName: 'redirectUris',
    formItemClass: 'lg:col-span-2',
    label: $t('zen.service.oauth2.client.redirectUris'),
  },
  {
    component: 'Select',
    componentProps: {
      multiple: true,
      options: scopes,
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.oauth2.client.authorities'),
      ]),
    },
    fieldName: 'authorities',
    formItemClass: 'lg:col-span-2',
    label: $t('zen.service.oauth2.client.authorities'),
  },
  {
    component: shallowRef(SelectCreate),
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.oauth2.client.resourceIds'),
      ]),
    },
    fieldName: 'resourceIds',
    formItemClass: 'lg:col-span-2',
    label: $t('zen.service.oauth2.client.resourceIds'),
  },
  {
    component: 'Input',
    componentProps: {
      autosize: {
        maxRows: 5,
        minRows: 3,
      },
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.oauth2.client.additionalInformation', [
          $t('zen.service.oauth2.client.jsonFormatter'),
        ]),
      ]),
      resize: 'none',
      type: 'textarea',
    },
    fieldName: 'additionalInformation',
    formItemClass: 'lg:col-span-2',
    label: $t('zen.service.oauth2.client.additionalInformation'),
  },
]);

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      labelClass: 'justify-end',
      labelWidth: 150,
      formItemClass: 'flex-col items-start',
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1 lg:grid-cols-2 gap-x-8',
  }),
);

defineExpose({ formApi });
</script>

<template>
  <Form>
    <template #authorizedGrantTypes="{ options, ...slotProps }">
      <ElSelect v-bind="slotProps">
        <ElOption
          v-for="item in options || []"
          :key="item.value"
          :label="item.lable"
          :value="item.value"
        >
          <div class="flex items-center justify-between">
            <span>{{ item.value }}</span>
            <span class="text-xs text-[var(--el-text-color-secondary)]">
              {{ item.label }}
            </span>
          </div>
        </ElOption>
      </ElSelect>
    </template>
  </Form>
</template>
