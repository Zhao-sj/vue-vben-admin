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
  batchDeleteDictDataApi,
  deleteDictDataApi,
  exportDictDataApi,
  getDictDataPageListApi,
} from '#/api';
import { TableAction, TableExport } from '#/components';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { downloadExcel } from '#/utils';

import { useColumns, useGridFormSchema } from './data';
import { Form } from './modules';

const { currentRoute } = useRouter();
const { isMobile } = useIsMobile();

const { loading: exportLoading, runAsync: exportDict } = useRequest(
  exportDictDataApi,
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
    schema: useGridFormSchema(reloadTable),
    submitOnEnter: true,
    showCollapseButton: isMobile.value,
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-6',
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    checkboxConfig: {
      highlight: true,
      range: true,
    },
    id: 'dict_data_manage',
    proxyConfig: {
      ajax: {
        query: ({ page }, formValues) => {
          const dictTypeId = +currentRoute.value.params.id!;
          if (!formValues.dictTypeId) {
            formValues.dictTypeId = dictTypeId;
            gridApi.formApi.setFieldValue('dictTypeId', dictTypeId);
          }
          return getDictDataPageListApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
  } as VxeTableGridOptions<DictApi.Data>,
});

const { batchSelect, onSuccess } = useGridHelper<DictApi.Data>(gridApi);

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
          batchDeleteDictDataApi(records.map((item) => item.id)),
      });
    },
    type: 'danger',
  },
  {
    auth: 'system:dict:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: async () => {
      const formValues = await gridApi.formApi.getValues();
      formDrawerApi.setData({ dictTypeId: formValues.dictTypeId });
      formDrawerApi.open();
    },
    type: 'primary',
  },
]);

function onActionClick({ code, row }: OnActionClickParams<DictApi.Data>) {
  switch (code) {
    case 'delete': {
      deleteDictDataApi(row.id).then(onSuccess);
      break;
    }
    case 'edit': {
      formDrawerApi.setData({ id: row.id });
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
  const formValues = await gridApi.formApi.getValues();
  const { data } = await exportDict(formValues as DictApi.DataPageQuery);
  downloadExcel(data, fileName);
  exportModalApi.close();
  ElMessage.success($t('page.export.success'));
}

async function reloadTable() {
  const formValues = await gridApi.formApi.getValues();
  gridApi.reload(formValues);
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onSuccess" />
    <ExportModal :default-name="$t('sys.dict.data.list')" @confirm="onExport" />

    <Grid :table-title="$t('sys.dict.data.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
      </template>
    </Grid>
  </Page>
</template>
