<script setup lang="ts">
import { useIsMobile } from '@vben/hooks';

import { useVbenForm, type VbenFormSchema } from '#/adapter';
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
        { label: $t('zen.service.log.login.success'), value: true },
        { label: $t('zen.service.log.login.fail'), value: false },
      ],
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.log.login.result'),
      ]),
    },
    fieldName: 'status',
    label: $t('zen.service.log.login.result'),
  },
  {
    component: 'Select',
    componentProps: {
      options: props.tenantList.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.log.login.tenant'),
      ]),
    },
    fieldName: 'tenantId',
    label: $t('zen.service.log.login.tenant'),
    dependencies: {
      if: () => props.showTenant,
      triggerFields: ['tenantId'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.log.common.ip'),
      ]),
    },
    fieldName: 'ip',
    label: $t('zen.service.log.common.ip'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.log.login.username'),
      ]),
    },
    fieldName: 'username',
    label: $t('zen.service.log.login.username'),
  },
  {
    component: 'DatePicker',
    componentProps: {
      class: '!w-full 2xl:!w-80',
      endPlaceholder: $t('zen.common.endDate'),
      startPlaceholder: $t('zen.common.startDate'),
      type: 'daterange',
    },
    fieldName: 'createTime',
    label: $t('zen.service.log.login.createTime'),
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
      content: computed(() => $t('zen.common.query')),
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
