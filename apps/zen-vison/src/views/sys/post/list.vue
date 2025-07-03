<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { PostApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeletePostApi,
  deletePostApi,
  exportPostApi,
  getPostPageListApi,
} from '#/api';
import { TableAction, TableExport } from '#/components';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { downloadExcel } from '#/utils';

import { useColumns, useGridFormSchema } from './data';
import { Form } from './modules';

const { isMobile } = useIsMobile();

const { loading: exportLoading, runAsync: exportPost } = useRequest(
  exportPostApi,
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
    showCollapseButton: isMobile.value,
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-6',
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    checkboxConfig: {
      highlight: true,
      range: true,
    },
    id: 'post_manage',
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: ({ page }, formValues) =>
          getPostPageListApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
  } as VxeTableGridOptions<PostApi.Post>,
});

const { batchSelect, onSuccess } = useGridHelper<PostApi.Post>(gridApi);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:post:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    btnText: $t('page.export.action'),
    onClick: () => exportModalApi.open(),
  },
  {
    auth: 'system:post:delete',
    icon: 'ep:delete',
    btnText: $t('page.delete'),
    onClick: () => {
      batchSelect({
        onBatchAction: (records) =>
          batchDeletePostApi(records.map((item) => item.id)),
      });
    },
    type: 'danger',
  },
  {
    auth: 'system:post:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => {
      formDrawerApi.open();
    },
    type: 'primary',
  },
]);

function onActionClick({ code, row }: OnActionClickParams<PostApi.Post>) {
  switch (code) {
    case 'delete': {
      deletePostApi(row.id).then(onSuccess);
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
  const { data } = await exportPost(values);
  downloadExcel(data, fileName);
  exportModalApi.close();
  ElMessage.success($t('page.export.success'));
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onSuccess" />
    <ExportModal :default-name="$t('sys.post.list')" @confirm="onExport" />

    <Grid :table-title="$t('sys.post.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
      </template>
    </Grid>
  </Page>
</template>
