<script setup lang="ts">
import { useIsMobile } from '@vben/hooks';

import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { type BaseSimple, type LogApi } from '#/api';
import { $t } from '#/locales';
import { translateState, useResetVbenVxeForm } from '#/utils';

interface Props {
  showTenant?: boolean;
  tenantList?: BaseSimple[];
}

interface Emits {
  (e: 'query', data: LogApi.LoginQuery): void;
}

const props = withDefaults(defineProps<Props>(), {
  tenantList: () => [],
});
const emit = defineEmits<Emits>();

const { isMobile } = useIsMobile();

const queryWrapperRef = useTemplateRef<HTMLDivElement>('queryWrapperRef');
useResetVbenVxeForm(queryWrapperRef);

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Select',
    componentProps: {
      options: [
        { label: $t('sys.log.login.success'), value: true },
        { label: $t('sys.log.login.fail'), value: false },
      ],
      placeholder: $t('page.pleaseSelect', [$t('sys.log.login.result')]),
    },
    fieldName: 'status',
    label: $t('sys.log.login.result'),
  },
  {
    component: 'Select',
    componentProps: {
      options: props.tenantList.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      placeholder: $t('page.pleaseSelect', [$t('sys.log.login.tenant')]),
    },
    fieldName: 'tenantId',
    label: $t('sys.log.login.tenant'),
    dependencies: {
      if: () => props.showTenant,
      triggerFields: ['tenantId'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.log.ip')]),
    },
    fieldName: 'ip',
    label: $t('sys.log.ip'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.log.login.username')]),
    },
    fieldName: 'username',
    label: $t('sys.log.login.username'),
  },
  {
    component: 'DatePicker',
    componentProps: {
      class: '!w-full 2xl:!w-80',
      endPlaceholder: $t('page.endDate'),
      startPlaceholder: $t('page.startDate'),
      type: 'daterange',
    },
    fieldName: 'createTime',
    label: $t('sys.log.login.createTime'),
  },
]);

const [QueryForm, formApi] = useVbenForm(
  reactive({
    actionWrapperClass: 'col-span-1 lg:text-left 2xl:pl-20 pb-0',
    collapsed: true,
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      formItemClass: 'pb-0',
      labelWidth: 65,
    },
    handleSubmit: onSubmit,
    handleReset: onReset,
    schema: formSchema,
    showCollapseButton: isMobile,
    submitButtonOptions: {
      content: computed(() => $t('page.query')),
    },
    wrapperClass: 'grid-cols-1 lg:grid-cols-3 2xl:grid-cols-6 gap-4',
  }),
);

function onSubmit(values: LogApi.LoginQuery) {
  const { state } = translateState(values);
  emit('query', state);
}

function onReset() {
  formApi.resetForm();
  emit('query', {});
}
</script>

<template>
  <div ref="queryWrapperRef" class="rounded-lg border p-3">
    <QueryForm />
  </div>
</template>
