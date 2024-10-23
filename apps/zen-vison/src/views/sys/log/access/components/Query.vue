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
  //     placeholder: $t('page.pleaseInput', [
  //       $t('sys.log.appName'),
  //     ]),
  //   },
  //   fieldName: 'appName',
  //   label: $t('sys.log.appName'),
  // },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.USER_TYPE),
      placeholder: $t('page.pleaseSelect', [$t('sys.log.userType')]),
    },
    fieldName: 'userType',
    label: $t('sys.log.userType'),
  },
  {
    component: 'Select',
    componentProps: {
      options: props.tenantList.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      placeholder: $t('page.pleaseSelect', [$t('sys.log.access.tenant')]),
    },
    fieldName: 'tenantId',
    label: $t('sys.log.access.tenant'),
    dependencies: {
      if: () => props.showTenant,
      triggerFields: ['tenantId'],
    },
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.log.userId')]),
    },
    fieldName: 'userId',
    label: $t('sys.log.userId'),
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 1,
      placeholder: $t('page.pleaseInput', [$t('sys.log.access.duration')]),
    },
    fieldName: 'duration',
    label: $t('sys.log.access.duration'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.log.requestUrl')]),
    },
    fieldName: 'requestUrl',
    label: $t('sys.log.requestUrl'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.log.access.resultCode')]),
    },
    fieldName: 'resultCode',
    label: $t('sys.log.access.resultCode'),
  },
  {
    component: 'DatePicker',
    componentProps: {
      class: '!w-full lg:!w-80 2xl:!w-full',
      endPlaceholder: $t('page.endDate'),
      startPlaceholder: $t('page.startDate'),
      type: 'daterange',
    },
    fieldName: 'beginTime',
    label: $t('sys.log.access.createTime'),
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
      content: computed(() => $t('page.query')),
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
