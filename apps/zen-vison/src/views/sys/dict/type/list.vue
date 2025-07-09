<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { DictApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeleteDictTypeApi,
  deleteDictTypeApi,
  exportDictTypeApi,
  getDictTypePageListApi,
} from '#/api';
import { TableAction, TableExport } from '#/components';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { downloadExcel } from '#/utils';

import { useColumns, useGridFormSchema } from './data';
import { Form } from './modules';

const { isMobile } = useIsMobile();

const { loading: exportLoading, runAsync: exportDict } = useRequest(
  exportDictTypeApi,
  {
    loadingDelay: 200,
    manual: true,
  },
);

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [ExportModal, exportModalApi] = useVbenModal({
  connectedComponent: TableExport,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    collapsed: isMobile.value,
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      labelWidth: 80,
    },
    schema: useGridFormSchema(),
    submitOnEnter: true,
    wrapperClass: 'grid-cols-1 lg:grid-cols-3',
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    checkboxConfig: {
      highlight: true,
      range: true,
    },
    id: 'dict_type_manage',
    proxyConfig: {
      ajax: {
        query: ({ page }, formValues) =>
          getDictTypePageListApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
  } as VxeTableGridOptions<DictApi.Type>,
});

const { batchSelect, onSuccess } = useGridHelper<DictApi.Type>(gridApi);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:dict:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    btnText: $t('page.export.action'),
    onClick: () => exportModalApi.open(),
  },
  {
    auth: 'system:dict:delete',
    icon: 'ep:delete',
    btnText: $t('page.delete'),
    onClick: () => {
      batchSelect({
        onBatchAction: (records) =>
          batchDeleteDictTypeApi(records.map((item) => item.id)),
      });
    },
    type: 'danger',
  },
  {
    auth: 'system:dict:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => {
      formDrawerApi.open();
    },
    type: 'primary',
  },
]);

function onActionClick({ code, row }: OnActionClickParams<DictApi.Type>) {
  switch (code) {
    case 'delete': {
      deleteDictTypeApi(row.id).then(onSuccess);
      break;
    }
    case 'edit': {
      formDrawerApi.setData(row);
      formDrawerApi.open();
      break;
    }
    default: {
      break;
    }
  }
}

async function onExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const values = await gridApi.formApi.getValues();
  const { data } = await exportDict(values);
  downloadExcel(data, fileName);
  exportModalApi.close();
  ElMessage.success($t('page.export.success'));
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onSuccess" />
    <ExportModal :default-name="$t('sys.dict.type.list')" @confirm="onExport" />

    <Grid :table-title="$t('sys.dict.type.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
      </template>

      <template #type="{ row }">
        <ElText
          class="cursor-pointer"
          tag="ins"
          type="primary"
          @click="$router.push({ path: `/sys/dict/data/${row.id}` })"
        >
          {{ row.type }}
        </ElText>
      </template>
    </Grid>
  </Page>
</template>
