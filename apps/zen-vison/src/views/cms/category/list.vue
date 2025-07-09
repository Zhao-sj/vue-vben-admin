<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { CategoryApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteCmsCategoryApi,
  getCmsCategoryListApi,
  updateCmsCategoryStatusApi,
} from '#/api';
import { TableAction } from '#/components';
import { DictStatus } from '#/enums';
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
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-6',
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    id: 'cms_category_manage',
    keyboardConfig: {
      isArrow: true,
      isBack: true,
      isEnter: true,
    },
    proxyConfig: {
      ajax: {
        query: async (_, formValues) => {
          const list = await getCmsCategoryListApi(formValues);
          return { list };
        },
      },
    },
    height: 'auto',
    stripe: false,
    pagerConfig: {
      enabled: false,
    },
    treeConfig: {
      expandAll: true,
      parentField: 'parentId',
      rowField: 'id',
      transform: true,
    },
  } as VxeTableGridOptions<CategoryApi.Category>,
});

const { onTreeExpandAll, onSuccess } =
  useGridHelper<CategoryApi.Category>(gridApi);

const toolbarActions: ActionItem[] = [
  {
    auth: 'cms:article-category:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => {
      formDrawerApi.open();
    },
    type: 'primary',
  },
];

function onActionClick({
  code,
  row,
}: OnActionClickParams<CategoryApi.Category>) {
  switch (code) {
    case 'append': {
      formDrawerApi.setData({ parentId: row.id });
      formDrawerApi.open();
      break;
    }
    case 'delete': {
      deleteCmsCategoryApi(row.id).then(onSuccess);
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

async function onStatusChange(newStatus: number, row: CategoryApi.Category) {
  const action =
    newStatus === DictStatus.ENABLE ? $t('page.enable') : $t('page.disable');

  const message = $t('page.actionConfirm.status', [
    action,
    row.name,
    $t('cms.category.title'),
  ]);

  try {
    await ElMessageBox.confirm(message, $t('page.systemTip'), {
      closeOnClickModal: false,
      draggable: true,
      type: 'warning',
    });
    await updateCmsCategoryStatusApi({ id: row.id, status: newStatus });
    onSuccess(false);
    return true;
  } catch {
    return false;
  }
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onSuccess" />

    <Grid :table-title="$t('cms.category.list')">
      <template #toolbar-tools>
        <div class="flex items-center gap-3">
          <ElButton @click="onTreeExpandAll(false)">
            {{ $t('page.collapsed') }}
          </ElButton>
          <ElButton class="!ml-0" @click="onTreeExpandAll(true)">
            {{ $t('page.expand') }}
          </ElButton>

          <TableAction :actions="toolbarActions" />
        </div>
      </template>
    </Grid>
  </Page>
</template>
