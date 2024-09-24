<script setup lang="ts">
import type { LogApi } from '#/api';

import { useIsMobile } from '@vben/hooks';

import { useVbenForm, type VbenFormSchema } from '#/adapter';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { translateState } from '#/utils';

interface Emits {
  (e: 'query', data: LogApi.ErrorQuery): void;
}

const emit = defineEmits<Emits>();

const dictStore = useDictStore();
const { isMobile } = useIsMobile();

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
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.ERROR_LOG_PROCESS_STATUS),
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.log.error.status'),
      ]),
    },
    fieldName: 'processStatus',
    formItemClass: 'lg:pb-0',
    label: $t('zen.service.log.error.status'),
  },
  {
    component: 'DatePicker',
    componentProps: {
      class: '!w-full 2xl:!w-80',
      endPlaceholder: $t('zen.common.endDate'),
      startPlaceholder: $t('zen.common.startDate'),
      type: 'daterange',
    },
    fieldName: 'exTime',
    formItemClass: 'lg:pb-0',
    label: $t('zen.service.log.error.exTime'),
  },
]);

const [QueryForm] = useVbenForm(
  reactive({
    actionWrapperClass: 'col-span-1 lg:text-left 2xl:pl-20',
    collapsed: true,
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      formItemClass: 'lg:pr-4 2xl:pb-0',
      labelWidth: 65,
    },
    handleSubmit: onSubmit,
    schema: formSchema,
    showCollapseButton: isMobile,
    submitButtonOptions: {
      text: computed(() => $t('zen.common.query')),
    },
    wrapperClass: 'grid-cols-1 lg:grid-cols-3 2xl:grid-cols-6',
  }),
);

function onSubmit(values: LogApi.ErrorQuery) {
  const { state } = translateState({ createTime: values.exTime });
  values.exTime = state.createTime;
  emit('query', values);
}
</script>

<template>
  <div class="rounded-lg border p-3">
    <QueryForm />
  </div>
</template>
