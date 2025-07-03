<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { FileApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { ElLink } from 'element-plus';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteFileConfigApi,
  getFileConfigPageApi,
  testFileConfigApi,
  updateFileConfigMasterApi,
} from '#/api';
import { TableAction } from '#/components';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import { Form } from './modules';

const { isMobile } = useIsMobile();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
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
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-5',
  },
  gridOptions: {
    columns: useColumns(onActionClick, onMasterChange),
    checkboxConfig: {
      highlight: true,
      range: true,
    },
    id: 'file_config',
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: ({ page }, formValues) =>
          getFileConfigPageApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
  } as VxeTableGridOptions<FileApi.Config>,
});

const { onSuccess } = useGridHelper<FileApi.Config>(gridApi);

const toolbarActions: ActionItem[] = [
  {
    auth: 'infra:file-config:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => {
      formDrawerApi.open();
    },
    type: 'primary',
  },
];

function onActionClick({ code, row }: OnActionClickParams<FileApi.Config>) {
  switch (code) {
    case 'delete': {
      deleteFileConfigApi(row.id).then(onSuccess);
      break;
    }
    case 'edit': {
      formDrawerApi.setData(row);
      formDrawerApi.open();
      break;
    }
    case 'test': {
      testFileConfigApi(row.id).then(onTestSuccess);
      break;
    }
    default: {
      break;
    }
  }
}

async function onMasterChange(_: boolean, row: FileApi.Config) {
  const title = $t('page.systemTip');
  const message = $t('infra.file.config.confirm.master', [row.id]);

  try {
    await ElMessageBox.confirm(message, title, {
      closeOnClickModal: false,
      draggable: true,
      type: 'warning',
    });
    await updateFileConfigMasterApi(row.id);
    onSuccess();
    return true;
  } catch {
    return false;
  }
}

function onTestSuccess(url: string) {
  const title = $t('page.systemTip');
  const message = $t('infra.file.config.confirm.test.success');
  const download = h(
    ElLink,
    {
      type: 'primary',
      target: '_blank',
      href: url,
    },
    {
      default: () => $t('infra.file.config.confirm.test.download'),
    },
  );

  ElMessageBox.alert(
    h('div', { class: 'flex items-centr' }, [message, download]),
    title,
    { type: 'success' },
  );
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onSuccess" />

    <Grid :table-title="$t('infra.file.config.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
      </template>
    </Grid>
  </Page>
</template>
