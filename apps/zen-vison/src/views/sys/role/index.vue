<script setup lang="ts">
import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';

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

import {
  AsignMenu,
  AssignScope,
  TableAdd,
  TableEdit,
  TableQuery,
} from './components';

type RoleColumns = VxeGridProps<RoleApi.Role>['columns'];

const { hasAccessByCodes } = useAccess();
const dictStore = useDictStore();
dictStore.initDictData(
  DictTypeEnum.STATUS,
  DictTypeEnum.ROLE_TYPE,
  DictTypeEnum.DATA_SCOPE,
);

let roleQuery: RoleApi.PageQuery = {};

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

const columns: RoleColumns = [
  {
    fixed: 'left',
    type: 'checkbox',
    width: 50,
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('zen.service.role.id'),
  },
  {
    field: 'name',
    minWidth: 150,
    title: $t('zen.service.role.name'),
  },
  {
    field: 'code',
    minWidth: 150,
    title: $t('zen.service.role.code'),
  },
  {
    field: 'type',
    minWidth: 150,
    slots: { default: 'type' },
    title: $t('zen.service.role.type'),
  },
  {
    field: 'sort',
    minWidth: 80,
    title: $t('zen.service.role.sort'),
  },
  {
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.role.status'),
  },
  {
    field: 'remark',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 200,
    title: $t('zen.common.remark'),
  },
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('zen.common.createTime'),
  },
  {
    fixed: 'right',
    slots: { default: 'opt' },
    title: $t('zen.common.opt'),
    width: 120,
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
      query: ({ page: { currentPage, pageSize } }) =>
        getRolePageListApi({
          pageNum: currentPage,
          pageSize,
          ...roleQuery,
        }),
    },
  },
  toolbarConfig: {
    refresh: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions: {}, gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:role:delete',
    icon: 'ep:delete',
    onClick: () => {
      useBatchSelect<RoleApi.Role>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteRoleApi(records.map((item) => item.id)),
        query: roleQuery,
      });
    },
    title: $t('zen.common.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:role:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('zen.common.create'),
    type: 'primary',
  },
  {
    auth: 'system:role:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('zen.common.export'),
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
        content: $t('zen.common.edit'),
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
        title: $t('zen.common.confirmDelete'),
      },
      tooltip: {
        content: $t('zen.common.delete'),
      },
      type: 'danger',
    },
  ];

  const dropdownActions: ActionDropdownItem[] = [
    {
      auth: 'system:permission:assign-role-menu',
      icon: 'hugeicons:menu-square',
      label: $t('zen.service.role.menuPermission'),
      onClick: () => {
        asignMenuModal.setData({ id: row.id });
        asignMenuModal.open();
      },
    },
    {
      auth: 'system:permission:assign-role-data-scope',
      icon: 'f7:scope',
      label: $t('zen.service.role.dataScope'),
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

  const label =
    row.status === ENABLE
      ? $t('zen.common.joinEnable')
      : $t('zen.common.joinDisable');

  const title = $t('zen.common.systemTitle');
  const message = `${$t('zen.common.confirm')}${label}【${row.code}】${$t('zen.service.role.joinRole')} ?`;
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
  ElMessage.success($t('zen.common.successTip'));
  reload && reloadTable();
}

function handleQuery(query: RoleApi.PageQuery) {
  roleQuery = query;
  gridApi.query();
}

function reloadTable() {
  gridApi.reload(roleQuery);
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const { data } = await exportRole(roleQuery);
  downloadExcel(data, fileName);
  exportModal.close();
  ElMessage.success($t('zen.export.success'));
}
</script>

<template>
  <Page auto-content-height>
    <Grid>
      <template #form>
        <TableQuery @query="handleQuery" />
      </template>

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
          :default-name="$t('zen.service.role.title')"
          @confirm="handleExport"
        />
        <AsignMenuModal />
        <AssignScopeModal />
      </template>

      <template #type="{ row: { type } }">
        <ElTag :type="dictStore.getRoleType(type)?.color">
          {{ dictStore.getRoleType(type)?.label }}
        </ElTag>
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
