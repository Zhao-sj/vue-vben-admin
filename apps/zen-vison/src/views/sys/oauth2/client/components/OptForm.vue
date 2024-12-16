<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import SelectCreate from './SelectCreate.vue';

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.OAUTH2_GRANT_TYPE);

const scopes = ['user.read', 'user.write'].map((item) => ({
  label: item,
  value: item,
}));

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'logo',
    label: $t('sys.oauth2.client.logo'),
    formItemClass: 'lg:col-span-2',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('sys.oauth2.client.name'),
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
    label: $t('sys.oauth2.client.status'),
  },
  {
    component: 'Input',
    fieldName: 'clientId',
    label: $t('sys.oauth2.client.clientId'),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'secret',
    label: $t('sys.oauth2.client.secret'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 1,
      placeholder: $t('page.pleaseInput', [$t('sys.oauth2.client.unit')]),
    },
    fieldName: 'accessTokenValiditySeconds',
    label: $t('sys.oauth2.client.accessTokenValiditySeconds'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 1,
      placeholder: $t('page.pleaseInput', [$t('sys.oauth2.client.unit')]),
    },
    fieldName: 'refreshTokenValiditySeconds',
    label: $t('sys.oauth2.client.refreshTokenValiditySeconds'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      autosize: {
        maxRows: 5,
        minRows: 3,
      },
      resize: 'none',
      type: 'textarea',
    },
    fieldName: 'description',
    formItemClass: 'lg:col-span-2',
    label: $t('sys.oauth2.client.description'),
  },
  {
    component: 'Select',
    componentProps: {
      multiple: true,
      options: dictStore.getDictDataList(DictTypeEnum.OAUTH2_GRANT_TYPE),
    },
    fieldName: 'authorizedGrantTypes',
    formItemClass: 'lg:col-span-2',
    label: $t('sys.oauth2.client.authorizedGrantTypes'),
    rules: 'selectRequired',
  },
  {
    component: 'Select',
    componentProps: {
      multiple: true,
      options: scopes,
    },
    fieldName: 'scopes',
    formItemClass: 'lg:col-span-2',
    label: $t('sys.oauth2.client.scopes'),
  },
  {
    component: 'Select',
    componentProps: {
      multiple: true,
      options: scopes,
    },
    fieldName: 'autoApproveScopes',
    formItemClass: 'lg:col-span-2',
    label: $t('sys.oauth2.client.autoApproveScopes'),
  },
  {
    component: shallowRef(SelectCreate),
    fieldName: 'redirectUris',
    formItemClass: 'lg:col-span-2',
    label: $t('sys.oauth2.client.redirectUris'),
  },
  {
    component: 'Select',
    componentProps: {
      multiple: true,
      options: scopes,
    },
    fieldName: 'authorities',
    formItemClass: 'lg:col-span-2',
    label: $t('sys.oauth2.client.authorities'),
  },
  {
    component: shallowRef(SelectCreate),
    fieldName: 'resourceIds',
    formItemClass: 'lg:col-span-2',
    label: $t('sys.oauth2.client.resourceIds'),
  },
  {
    component: 'Input',
    componentProps: {
      autosize: {
        maxRows: 5,
        minRows: 3,
      },
      placeholder: $t('page.pleaseInput', [
        $t('sys.oauth2.client.jsonFormatter'),
      ]),
      resize: 'none',
      type: 'textarea',
    },
    fieldName: 'additionalInformation',
    formItemClass: 'lg:col-span-2',
    label: $t('sys.oauth2.client.additionalInformation'),
  },
]);

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      labelClass: 'justify-start',
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
