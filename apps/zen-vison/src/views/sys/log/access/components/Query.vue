<script setup lang="ts">
import type { BaseSimple, LogApi } from '#/api';

import { useIsMobile } from '@vben/hooks';

import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { translateState, useResetVbenVxeForm } from '#/utils';

interface Props {
  showTenant?: boolean;
  tenantList?: BaseSimple[];
}

interface Emits {
  (e: 'query', data: LogApi.AccessQuery): void;
}

const props = withDefaults(defineProps<Props>(), {
  tenantList: () => [],
});
const emit = defineEmits<Emits>();

const dictStore = useDictStore();
const { isMobile } = useIsMobile();

const queryWrapperRef = useTemplateRef<HTMLDivElement>('queryWrapperRef');
useResetVbenVxeForm(queryWrapperRef);

const formSchema = computed<VbenFormSchema[]>(() => [
  // {
  //   component: 'Input',
  //   componentProps: {
  //     placeholder: $t('zen.common.pleaseInput', [
  //       $t('zen.service.log.common.appName'),
  //     ]),
  //   },
  //   fieldName: 'appName',
  //   label: $t('zen.service.log.common.appName'),
  // },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.USER_TYPE),
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.log.common.userType'),
      ]),
    },
    fieldName: 'userType',
    label: $t('zen.service.log.common.userType'),
  },
  {
    component: 'Select',
    componentProps: {
      options: props.tenantList.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.log.access.tenant'),
      ]),
    },
    fieldName: 'tenantId',
    label: $t('zen.service.log.access.tenant'),
    dependencies: {
      if: () => props.showTenant,
      triggerFields: ['tenantId'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.log.common.userId'),
      ]),
    },
    fieldName: 'userId',
    label: $t('zen.service.log.common.userId'),
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 1,
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.log.access.duration'),
      ]),
    },
    fieldName: 'duration',
    label: $t('zen.service.log.access.duration'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.log.common.requestUrl'),
      ]),
    },
    fieldName: 'requestUrl',
    label: $t('zen.service.log.common.requestUrl'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.log.access.resultCode'),
      ]),
    },
    fieldName: 'resultCode',
    label: $t('zen.service.log.access.resultCode'),
  },
  {
    component: 'DatePicker',
    componentProps: {
      class: '!w-full lg:!w-80 2xl:!w-full',
      endPlaceholder: $t('zen.common.endDate'),
      startPlaceholder: $t('zen.common.startDate'),
      type: 'daterange',
    },
    fieldName: 'beginTime',
    label: $t('zen.service.log.access.createTime'),
  },
]);

const [QueryForm, formApi] = useVbenForm(
  reactive({
    actionWrapperClass: 'col-span-1 lg:text-left lg:pl-20 2xl:pl-0 pb-0',
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
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-5 gap-4',
  }),
);

function onSubmit(values: LogApi.AccessQuery) {
  const { state } = translateState({ createTime: values.beginTime });
  values.beginTime = state.createTime;
  emit('query', values);
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
