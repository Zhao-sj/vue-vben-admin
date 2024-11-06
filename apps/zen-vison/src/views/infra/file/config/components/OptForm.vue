<script setup lang="ts">
import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { DictTypeEnum, FileStorageEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  edit?: boolean;
}

const props = defineProps<Props>();

const dictStore = useDictStore();

const modeOptions = [
  { label: $t('infra.file.config.mode.active'), value: 'Active' },
  { label: $t('infra.file.config.mode.passive'), value: 'Passive' },
];

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('infra.file.config.name')]),
    },
    fieldName: 'name',
    label: $t('infra.file.config.name'),
    rules: 'required',
  },
  {
    component: 'Input',
    componentProps: {
      autosize: {
        maxRows: 5,
        minRows: 3,
      },
      placeholder: $t('page.pleaseInput', [$t('infra.file.config.remark')]),
      resize: 'none',
      type: 'textarea',
    },
    fieldName: 'remark',
    label: $t('infra.file.config.remark'),
    labelClass: 'self-start h-8',
  },
  {
    component: 'Select',
    componentProps: {
      disabled: props.edit,
      options: dictStore
        .getDictDataList(DictTypeEnum.FILE_STORAGE)
        .map((item) => ({
          ...item,
          value: +item.value,
        })),
    },
    fieldName: 'storage',
    label: $t('infra.file.config.storage'),
    rules: 'selectRequired',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('infra.file.config.domain')]),
    },
    fieldName: 'config.domain',
    label: $t('infra.file.config.domain'),
    dependencies: {
      if: (values) => !!values.storage,
      required: (values) => values.storage !== FileStorageEnum.S3,
      triggerFields: ['storage'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('infra.file.config.basePath')]),
    },
    fieldName: 'config.basePath',
    label: $t('infra.file.config.basePath'),
    rules: 'required',
    dependencies: {
      if(values) {
        const storage = values.storage;
        return (
          storage === FileStorageEnum.LOCAL ||
          storage === FileStorageEnum.FTP ||
          storage === FileStorageEnum.SFTP
        );
      },
      triggerFields: ['storage'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('infra.file.config.host')]),
    },
    fieldName: 'config.host',
    formItemClass: 'lg:col-span-1',
    label: $t('infra.file.config.host'),
    rules: 'required',
    dependencies: {
      if: (values) =>
        values.storage === FileStorageEnum.FTP ||
        values.storage === FileStorageEnum.SFTP,
      triggerFields: ['storage'],
    },
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 1,
      placeholder: $t('page.pleaseInput', [$t('infra.file.config.port')]),
    },
    fieldName: 'config.port',
    formItemClass: 'lg:col-span-1',
    label: $t('infra.file.config.port'),
    rules: 'required',
    dependencies: {
      if: (values) =>
        values.storage === FileStorageEnum.FTP ||
        values.storage === FileStorageEnum.SFTP,
      triggerFields: ['storage'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('infra.file.config.username')]),
    },
    fieldName: 'config.username',
    formItemClass: 'lg:col-span-1',
    label: $t('infra.file.config.username'),
    rules: 'required',
    dependencies: {
      if: (values) =>
        values.storage === FileStorageEnum.FTP ||
        values.storage === FileStorageEnum.SFTP,
      triggerFields: ['storage'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      clearable: false,
      placeholder: $t('page.pleaseInput', [$t('infra.file.config.password')]),
      showPassword: true,
      type: 'password',
    },
    fieldName: 'config.password',
    formItemClass: 'lg:col-span-1',
    label: $t('infra.file.config.password'),
    rules: 'required',
    dependencies: {
      if: (values) =>
        values.storage === FileStorageEnum.FTP ||
        values.storage === FileStorageEnum.SFTP,
      triggerFields: ['storage'],
    },
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: modeOptions,
      optionType: 'button',
    },
    fieldName: 'config.mode',
    label: $t('infra.file.config.mode.title'),
    rules: 'selectRequired',
    dependencies: {
      if: (values) => values.storage === FileStorageEnum.FTP,
      triggerFields: ['storage'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('infra.file.config.endpoint')]),
    },
    fieldName: 'config.endpoint',
    label: $t('infra.file.config.endpoint'),
    rules: 'required',
    dependencies: {
      if: (values) => values.storage === FileStorageEnum.S3,
      triggerFields: ['storage'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('infra.file.config.bucket')]),
    },
    fieldName: 'config.bucket',
    label: $t('infra.file.config.bucket'),
    rules: 'required',
    dependencies: {
      if: (values) => values.storage === FileStorageEnum.S3,
      triggerFields: ['storage'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      clearable: false,
      placeholder: $t('page.pleaseInput', [$t('infra.file.config.accessKey')]),
      showPassword: true,
      type: 'password',
    },
    fieldName: 'config.accessKey',
    label: $t('infra.file.config.accessKey'),
    rules: 'required',
    dependencies: {
      if: (values) => values.storage === FileStorageEnum.S3,
      triggerFields: ['storage'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      clearable: false,
      placeholder: $t('page.pleaseInput', [
        $t('infra.file.config.accessSecret'),
      ]),
      showPassword: true,
      type: 'password',
    },
    fieldName: 'config.accessSecret',
    label: $t('infra.file.config.accessSecret'),
    rules: 'required',
    dependencies: {
      if: (values) => values.storage === FileStorageEnum.S3,
      triggerFields: ['storage'],
    },
  },
]);

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      labelClass: 'mr-4',
      labelWidth: 80,
      formItemClass: 'lg:col-span-2',
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1 lg:grid-cols-2 gap-x-4',
  }),
);

defineExpose({ formApi });
</script>

<template>
  <Form />
</template>
