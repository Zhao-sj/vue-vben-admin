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
  (e: 'query', data: LogApi.ErrorQuery): void;
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
      placeholder: $t('page.pleaseSelect', [$t('sys.log.error.tenant')]),
    },
    fieldName: 'tenantId',
    label: $t('sys.log.error.tenant'),
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
    component: 'Input',
    componentProps: {
      placeholder: $t('page.pleaseInput', [$t('sys.log.requestUrl')]),
    },
    fieldName: 'requestUrl',
    label: $t('sys.log.requestUrl'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.ERROR_LOG_PROCESS_STATUS),
      placeholder: $t('page.pleaseSelect', [$t('sys.log.error.status')]),
    },
    fieldName: 'processStatus',
    label: $t('sys.log.error.status'),
  },
  {
    component: 'DatePicker',
    componentProps: {
      class: '!w-full lg:!w-80',
      endPlaceholder: $t('page.endDate'),
      startPlaceholder: $t('page.startDate'),
      type: 'daterange',
    },
    fieldName: 'exTime',
    label: $t('sys.log.error.exTime'),
  },
]);

const [QueryForm, formApi] = useVbenForm(
  reactive({
    actionWrapperClass: 'col-span-1 lg:text-left lg:pl-20 pb-0',
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
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-7 gap-4',
  }),
);

function onSubmit(values: LogApi.ErrorQuery) {
  const { state } = translateState({ createTime: values.exTime });
  values.exTime = state.createTime;
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
