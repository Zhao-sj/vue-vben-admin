<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { RoleApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeleteRoleApi,
  deleteRoleApi,
  exportRoleApi,
  getRolePageListApi,
  updateRoleStatusApi,
} from '#/api';
import { TableAction, TableExport } from '#/components';
import { DictRoleType, DictStatus, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel } from '#/utils';

import { useColumns, useGridFormSchema } from './data';
import { AsignMenu, AssignScope, Form } from './modules';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.ROLE_TYPE, DictTypeEnum.DATA_SCOPE);

const { loading: exportLoading, runAsync: exportRole } = useRequest(
  exportRoleApi,
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

const [AsignMenuDrawer, asignMenuDrawerApi] = useVbenDrawer({
  connectedComponent: AsignMenu,
  destroyOnClose: true,
});

const [AssignScopeDrawer, assignScopeDrawerApi] = useVbenDrawer({
  connectedComponent: AssignScope,
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
    wrapperClass: 'grid-cols-1 lg:grid-cols-3',
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    checkboxConfig: {
      checkMethod: ({ row }) => row.type !== DictRoleType.ADMIN,
      highlight: true,
      range: true,
    },
    id: 'role_manage',
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: ({ page }, formValues) =>
          getRolePageListApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
  } as VxeTableGridOptions<RoleApi.Role>,
});

const { batchSelect, onSuccess } = useGridHelper<RoleApi.Role>(gridApi);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:role:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    btnText: $t('page.export.action'),
    onClick: () => {
      exportModalApi.open();
    },
  },
  {
    auth: 'system:role:delete',
    icon: 'ep:delete',
    btnText: $t('page.delete'),
    onClick: () => {
      batchSelect({
        onBatchAction: (records) =>
          batchDeleteRoleApi(records.map((item) => item.id)),
      });
    },
    type: 'danger',
  },
  {
    auth: 'system:role:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => {
      formDrawerApi.open();
    },
    type: 'primary',
  },
]);

function onActionClick({ code, row }: OnActionClickParams<RoleApi.Role>) {
  switch (code) {
    case 'dataScope': {
      assignScopeDrawerApi.setData(row);
      assignScopeDrawerApi.open();
      break;
    }
    case 'delete': {
      deleteRoleApi(row.id).then(onSuccess);
      break;
    }
    case 'edit': {
      formDrawerApi.setData(row);
      formDrawerApi.open();
      break;
    }
    case 'permission': {
      asignMenuDrawerApi.setData(row);
      asignMenuDrawerApi.open();
      break;
    }
    default: {
      break;
    }
  }
}

async function onStatusChange(newStatus: number, row: RoleApi.Role) {
  const action =
    newStatus === DictStatus.ENABLE ? $t('page.enable') : $t('page.disable');

  const message = $t('sys.role.confirm.status', [
    action,
    `${row.name} - ${row.code}`,
  ]);

  try {
    await ElMessageBox.confirm(message, $t('page.systemTip'), {
      closeOnClickModal: false,
      draggable: true,
      type: 'warning',
    });
    await updateRoleStatusApi({ id: row.id, status: newStatus });
    onSuccess(false);
    return true;
  } catch {
    return false;
  }
}

async function onExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const values = await gridApi.formApi.getValues();
  const { data } = await exportRole(values);
  downloadExcel(data, fileName);
  exportModalApi.close();
  ElMessage.success($t('page.export.success'));
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onSuccess" />
    <ExportModal :default-name="$t('sys.role.list')" @confirm="onExport" />
    <AsignMenuDrawer @success="onSuccess(false)" />
    <AssignScopeDrawer @success="onSuccess" />

    <Grid :table-title="$t('sys.role.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
      </template>
    </Grid>
  </Page>
</template>
