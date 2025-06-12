<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { RoleApi } from '#/api';
import type { ActionDropdownItem, ActionItem } from '#/components';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
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
import { downloadExcel, useBatchSelect } from '#/utils';

import { AsignMenu, AssignScope, TableAdd, TableEdit } from './components';

const { isMobile } = useIsMobile();
const { hasAccessByCodes } = useAccess();
const dictStore = useDictStore();
dictStore.initDictData(
  DictTypeEnum.STATUS,
  DictTypeEnum.ROLE_TYPE,
  DictTypeEnum.DATA_SCOPE,
);

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { runAsync: updateStatus } = useRequest(
  updateRoleStatusApi,
  requestConfig,
);

const { loading: exportLoading, runAsync: exportRole } = useRequest(
  exportRoleApi,
  requestConfig,
);

const [TableAddDrawer, addDrawerApi] = useVbenDrawer({
  connectedComponent: TableAdd,
});

const [TableEditDrawer, editDrawerApi] = useVbenDrawer({
  connectedComponent: TableEdit,
});

const [TableExportModal, exportModalApi] = useVbenModal({
  connectedComponent: TableExport,
});

const [AsignMenuDrawer, asignMenuDrawerApi] = useVbenDrawer({
  connectedComponent: AsignMenu,
});

const [AssignScopeDrawer, assignScopeDrawerApi] = useVbenDrawer({
  connectedComponent: AssignScope,
});

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('sys.role.name'),
  },
  {
    component: 'Input',
    fieldName: 'code',
    label: $t('sys.role.code'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
    },
    fieldName: 'status',
    label: $t('sys.role.status'),
  },
  {
    component: 'DatePicker',
    componentProps: {
      placeholder: $t('page.date.placeholder.between'),
      range: true,
      multiCalendars: {
        solo: true,
      },
    },
    fieldName: 'createTime',
    label: $t('page.createTime'),
  },
]);

const formOptions = computed<VbenFormProps>(() => ({
  collapsed: isMobile.value,
  commonConfig: {
    componentProps: {
      clearable: true,
    },
    labelWidth: 80,
  },
  schema: formSchema.value,
  submitOnEnter: true,
  wrapperClass: 'grid-cols-1 lg:grid-cols-3',
}));

const columns: VxeGridProps<RoleApi.Role>['columns'] = [
  {
    type: 'checkbox',
    width: 50,
    fixed: isMobile.value ? null : 'left',
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('sys.role.id'),
  },
  {
    field: 'name',
    minWidth: 150,
    title: $t('sys.role.name'),
  },
  {
    field: 'code',
    minWidth: 150,
    title: $t('sys.role.code'),
  },
  {
    field: 'type',
    minWidth: 150,
    title: $t('sys.role.type'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.ROLE_TYPE,
      },
    },
  },
  {
    field: 'sort',
    minWidth: 80,
    title: $t('sys.role.sort'),
  },
  {
    field: 'status',
    minWidth: 100,
    title: $t('sys.role.status'),
    cellRender: {
      name: 'CellSwitch',
      props: { disabled: !hasAccessByCodes(['system:role:update']) },
      attrs: { beforeChange: handleStatusChange },
    },
  },
  {
    field: 'remark',
    minWidth: 200,
    title: $t('page.remark'),
    formatter: 'formatBlank',
  },
  {
    field: 'createTime',
    minWidth: 150,
    title: $t('page.createTime'),
    formatter: 'formatDateTime',
  },
  {
    field: 'opt',
    title: $t('page.options'),
    width: 180,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeTableGridOptions<RoleApi.Role> = {
  columns,
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
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:role:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    btnText: $t('page.export.action'),
    onClick: () => exportModalApi.open(),
  },
  {
    auth: 'system:role:delete',
    icon: 'ep:delete',
    btnText: $t('page.delete'),
    onClick: async () => {
      const values = await gridApi.formApi.getValues();
      useBatchSelect<RoleApi.Role>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteRoleApi(records.map((item) => item.id)),
        query: values,
      });
    },
    type: 'danger',
  },
  {
    auth: 'system:role:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => addDrawerApi.open(),
    type: 'primary',
  },
]);

function createActions(row: RoleApi.Role) {
  const actions: ActionItem[] = [
    {
      auth: 'system:role:update',
      icon: 'ep:edit',
      btnText: $t('page.edit'),
      onClick: () => {
        editDrawerApi.setData({ id: row.id });
        editDrawerApi.open();
      },
      type: 'primary',
    },
    {
      auth: 'system:role:delete',
      disabled: row.type === DictRoleType.ADMIN,
      icon: 'ep:delete',
      btnText: $t('page.delete'),
      popConfirm: {
        on: {
          confirm: () => deleteRoleApi(row.id).then(requestAfter),
        },
        title: $t('page.confirmDelete'),
      },
      type: 'danger',
    },
  ];

  const dropdownActions: ActionDropdownItem[] = [
    {
      auth: 'system:permission:assign-role-menu',
      icon: 'hugeicons:menu-square',
      btnText: $t('sys.role.menuPermission'),
      onClick: () => {
        asignMenuDrawerApi.setData({ id: row.id });
        asignMenuDrawerApi.open();
      },
    },
    {
      auth: 'system:permission:assign-role-data-scope',
      icon: 'f7:scope',
      btnText: $t('sys.role.dataScope'),
      onClick: () => {
        assignScopeDrawerApi.setData({ id: row.id });
        assignScopeDrawerApi.open();
      },
    },
  ];

  return { actions, dropdownActions };
}

async function handleStatusChange(newStatus: number, row: RoleApi.Role) {
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
    await updateStatus({ id: row.id, status: newStatus });
    requestAfter(false);
    return true;
  } catch {
    return false;
  }
}

function requestAfter(reload = true) {
  ElMessage.success($t('page.success'));
  reload && reloadTable();
}

async function reloadTable() {
  const values = await gridApi.formApi.getValues();
  gridApi.reload(values);
}

async function handleExport(fileName: string) {
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
    <Grid :table-title="$t('sys.role.list')" :form-options="formOptions">
      <template #toolbar-tools>
        <TableAction
          :actions="toolbarActions"
          :link="false"
          :show-empty="false"
        />

        <TableAddDrawer @success="reloadTable" />
        <TableEditDrawer @success="reloadTable" />
        <TableExportModal
          :default-name="$t('sys.role.title')"
          @confirm="handleExport"
        />
        <AsignMenuDrawer />
        <AssignScopeDrawer />
      </template>

      <template #opt="{ row }">
        <TableAction v-bind="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
