<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import {
  batchDeleteRoleApi,
  deleteRoleApi,
  exportRoleApi,
  getRolePageListApi,
  type RoleApi,
  updateRoleStatusApi,
} from '#/api';
import {
  type ActionDropdownItem,
  type ActionItem,
  TableAction,
  TableExport,
} from '#/components';
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

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const [TableExportModal, exportModal] = useVbenModal({
  connectedComponent: TableExport,
});

const [AsignMenuModal, asignMenuModal] = useVbenModal({
  connectedComponent: AsignMenu,
});

const [AssignScopeModal, assignScopeModal] = useVbenModal({
  connectedComponent: AssignScope,
});

const statusDisabled = computed(
  () => !hasAccessByCodes(['system:role:update']),
);

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
    slots: { default: 'status' },
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
    title: $t('page.options'),
    width: 120,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeGridProps<RoleApi.Role> = {
  columns,
  checkboxConfig: {
    checkMethod: ({ row }) => row.type !== DictRoleType.ADMIN,
    highlight: true,
    range: true,
  },
  customConfig: {},
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
  toolbarConfig: {
    refresh: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:role:delete',
    icon: 'ep:delete',
    onClick: async () => {
      const values = await gridApi.formApi.getValues();
      useBatchSelect<RoleApi.Role>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteRoleApi(records.map((item) => item.id)),
        query: values,
      });
    },
    title: $t('page.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:role:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('page.create'),
    type: 'primary',
  },
  {
    auth: 'system:role:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('page.export.title'),
    type: 'warning',
  },
]);

function createActions(row: RoleApi.Role) {
  const actions: ActionItem[] = [
    {
      auth: 'system:role:update',
      icon: 'ep:edit',
      onClick: () => {
        editModal.setData({ id: row.id });
        editModal.open();
      },
      tooltip: {
        content: $t('page.edit'),
      },
      type: 'primary',
    },
    {
      auth: 'system:role:delete',
      disabled: row.type === DictRoleType.ADMIN,
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => deleteRoleApi(row.id).then(requestAfter),
        },
        title: $t('page.confirmDelete'),
      },
      tooltip: {
        content: $t('page.delete'),
      },
      type: 'danger',
    },
  ];

  const dropdownActions: ActionDropdownItem[] = [
    {
      auth: 'system:permission:assign-role-menu',
      icon: 'hugeicons:menu-square',
      label: $t('sys.role.menuPermission'),
      onClick: () => {
        asignMenuModal.setData({ id: row.id });
        asignMenuModal.open();
      },
    },
    {
      auth: 'system:permission:assign-role-data-scope',
      icon: 'f7:scope',
      label: $t('sys.role.dataScope'),
      onClick: () => {
        assignScopeModal.setData({ id: row.id });
        assignScopeModal.open();
      },
    },
  ];

  return { actions, dropdownActions };
}

function handleStatusChange(row: RoleApi.Role) {
  const { DISABLE, ENABLE } = DictStatus;

  const label = row.status === ENABLE ? $t('page.enable') : $t('page.disable');

  const title = $t('page.systemTip');
  const message = $t('sys.role.confirm.status', [label, row.code]);
  const resetStatus = () => {
    row.status = row.status === ENABLE ? DISABLE : ENABLE;
  };

  ElMessageBox.confirm(message, title, {
    closeOnClickModal: false,
    draggable: true,
    type: 'warning',
  })
    .then(() => {
      updateStatus({ id: row.id, status: row.status })
        .then(requestAfter)
        .catch(resetStatus);
    })
    .catch(resetStatus);
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
  exportModal.close();
  ElMessage.success($t('page.export.success'));
}
</script>

<template>
  <Page auto-content-height>
    <Grid :form-options="formOptions">
      <template #toolbar-actions>
        <TableAction
          :actions="toolbarActions"
          :link="false"
          :show-empty="false"
          circle
        />

        <TableAddModal @success="reloadTable" />
        <TableEditModal @success="reloadTable" />
        <TableExportModal
          :default-name="$t('sys.role.title')"
          @confirm="handleExport"
        />
        <AsignMenuModal />
        <AssignScopeModal />
      </template>

      <template #status="{ row }">
        <ElSwitch
          v-model="row.status"
          :active-value="0"
          :disabled="statusDisabled"
          :inactive-value="1"
          @change="handleStatusChange(row)"
        />
      </template>

      <template #opt="{ row }">
        <TableAction v-bind="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
