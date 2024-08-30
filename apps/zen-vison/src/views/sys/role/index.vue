<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import { useAccess } from '@vben/access';
import { useVbenModal } from '@vben/common-ui';

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
  VxeBasicTable,
} from '#/components';
import { DictRoleType, DictStatus, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { downloadExcel, formatToDateTime } from '#/utils';

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
const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();

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

const vxeTable = computed(() =>
  vxeBasicTableRef.value?.getTableInstance<RoleApi.Role>(),
);

const statusDisabled = computed(
  () => !hasAccessByCodes(['system:role:update']),
);

const columns = computed<RoleColumns>(() => [
  {
    align: 'center',
    fixed: 'left',
    type: 'checkbox',
    width: 50,
  },
  {
    align: 'center',
    field: 'id',
    minWidth: 80,
    title: $t('zen.service.role.id'),
  },
  {
    align: 'center',
    field: 'name',
    minWidth: 150,
    title: $t('zen.service.role.name'),
  },
  {
    align: 'center',
    field: 'code',
    minWidth: 150,
    title: $t('zen.service.role.code'),
  },
  {
    align: 'center',
    field: 'type',
    minWidth: 150,
    slots: { default: 'type' },
    title: $t('zen.service.role.type'),
  },
  {
    align: 'center',
    field: 'sort',
    minWidth: 80,
    title: $t('zen.service.role.sort'),
  },
  {
    align: 'center',
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.role.status'),
  },
  {
    align: 'center',
    field: 'remark',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 200,
    title: $t('zen.common.remark'),
  },
  {
    align: 'center',
    field: 'createTime',
    formatter: ({ cellValue }) => formatToDateTime(cellValue),
    minWidth: 150,
    title: $t('zen.common.createTime'),
  },
  {
    align: 'center',
    fixed: 'right',
    slots: { default: 'opt' },
    title: $t('zen.common.opt'),
    width: 120,
  },
]);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:role:delete',
    icon: 'ep:delete',
    onClick: () => vxeTable.value?.commitProxy('delete'),
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

const tableOpts = reactive<VxeGridProps<RoleApi.Role>>({
  checkboxConfig: {
    checkMethod: ({ row }) => row.type !== DictRoleType.ADMIN,
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'role_manage',
  pagerConfig: {
    pageSize: 20,
  },
  printConfig: {},
  proxyConfig: {
    ajax: {
      delete: ({ body: { removeRecords } }) => {
        const ids = removeRecords.map((item) => item.id);
        return batchDeleteRoleApi(ids);
      },
      query: ({ page: { currentPage, pageSize } }) =>
        getRolePageListApi({
          pageNum: currentPage,
          pageSize,
          ...roleQuery,
        }),
    },
    response: {
      result: 'list',
      total: 'total',
    },
  },
  toolbarConfig: {
    print: true,
    refresh: true,
    slots: {
      buttons: 'toolbar_left',
    },
  },
});

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

function reloadTable() {
  vxeTable.value?.commitProxy('reload');
}

function handleQuery(query: RoleApi.PageQuery) {
  roleQuery = query;
  vxeTable.value?.commitProxy('query');
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
  <VxeBasicTable ref="vxeBasicTableRef" :columns v-bind="tableOpts">
    <template #form>
      <TableQuery @query="handleQuery" />
    </template>

    <template #toolbar_left>
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
  </VxeBasicTable>
</template>
