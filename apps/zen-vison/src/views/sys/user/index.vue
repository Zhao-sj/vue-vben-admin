<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import { useAccess } from '@vben/access';
import { type ModalApiOptions, useVbenModal } from '@vben/common-ui';
import { useNamespace } from '@vben/hooks';
import { Icon } from '@vben/icons';

import {
  batchDeleteUserApi,
  deleteUserApi,
  exportUserApi,
  getUserPageListApi,
  importUserApi,
  resetUserPasswordApi,
  updateUserStatusApi,
  type UserApi,
} from '#/api';
import {
  type ActionDropdownItem,
  type ActionItem,
  FullHeightContainer,
  TableAction,
  TableExport,
  VxeBasicTable,
} from '#/components';
import { DictSex, DictStatus, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore, useUserStore } from '#/store';
import { downloadExcel, encryptBySha256, formatToDateTime } from '#/utils';

import {
  AssignRole,
  DeptFilter,
  ImportResult,
  TableAdd,
  TableEdit,
  TableQuery,
  UserImport,
} from './components';

type UserColumns = VxeGridProps<UserApi.User>['columns'];

const { hasAccessByCodes } = useAccess();
const userStore = useUserStore();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS, DictTypeEnum.SEX);

const ns = useNamespace('user-manage');
let userQuery: UserApi.PageQuery = {};
const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();

const modalOpts: ModalApiOptions = {
  closeOnClickModal: false,
  draggable: true,
};

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { runAsync: updateStatus } = useRequest(
  updateUserStatusApi,
  requestConfig,
);

const { loading: exportLoading, runAsync: exportUser } = useRequest(
  exportUserApi,
  requestConfig,
);

const { loading: importLoading, runAsync: importUser } = useRequest(
  importUserApi,
  requestConfig,
);

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
  ...modalOpts,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
  ...modalOpts,
});

const [AssignRoleModal, assignRoleModal] = useVbenModal({
  connectedComponent: AssignRole,
  ...modalOpts,
});

const [TableExportModal, exportModal] = useVbenModal({
  connectedComponent: TableExport,
  ...modalOpts,
});

const [UserImportModal, importModal] = useVbenModal({
  connectedComponent: UserImport,
  ...modalOpts,
});

const [ImportResultModal, importResultModal] = useVbenModal({
  connectedComponent: ImportResult,
  ...modalOpts,
});

const vxeTable = computed(() =>
  vxeBasicTableRef.value?.getTableInstance<UserApi.User>(),
);

const statusDisabled = computed(
  () => !hasAccessByCodes(['system:user:update']),
);

const columns = computed<UserColumns>(() => [
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
    title: $t('zen.service.user.code'),
  },
  {
    align: 'center',
    field: 'avatar',
    minWidth: 80,
    slots: { default: 'avatar' },
    title: $t('zen.service.user.avatar'),
    visible: false,
  },
  {
    align: 'center',
    field: 'username',
    minWidth: 120,
    title: $t('zen.service.user.username'),
  },
  {
    align: 'center',
    field: 'nickname',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 120,
    title: $t('zen.service.user.nickname'),
  },
  {
    align: 'center',
    field: 'sex',
    minWidth: 100,
    slots: { default: 'sex' },
    title: $t('zen.service.user.sex'),
  },
  {
    align: 'center',
    field: 'deptName',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 150,
    title: $t('zen.service.user.deptName'),
  },
  {
    align: 'center',
    field: 'mobile',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 150,
    title: $t('zen.service.user.mobile'),
  },
  {
    align: 'center',
    field: 'email',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 150,
    title: $t('zen.service.user.email'),
    visible: false,
  },
  {
    align: 'center',
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.user.status'),
  },
  {
    align: 'center',
    field: 'loginIp',
    formatter: ({ cellValue }) => cellValue || '-',
    minWidth: 150,
    title: $t('zen.service.user.loginIp'),
    visible: false,
  },
  {
    align: 'center',
    field: 'loginDate',
    formatter: ({ cellValue }) =>
      cellValue ? formatToDateTime(cellValue) : '-',
    minWidth: 150,
    title: $t('zen.service.user.loginDate'),
    visible: false,
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
    auth: 'system:user:delete',
    icon: 'ep:delete',
    onClick: () => {
      vxeTable.value?.commitProxy('delete');
    },
    title: $t('zen.common.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:user:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('zen.common.create'),
    type: 'primary',
  },
  {
    auth: 'system:user:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('zen.common.export'),
    type: 'warning',
  },
  {
    auth: 'system:user:import',
    icon: importLoading.value ? 'eos-icons:bubble-loading' : 'ep:upload',
    onClick: () => importModal.open(),
    title: $t('zen.common.import'),
    type: 'info',
  },
]);

const tableOpts = reactive<VxeGridProps<UserApi.User>>({
  checkboxConfig: {
    checkMethod: ({ row }) => row.id !== userStore.userId,
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'user_manage',
  pagerConfig: {
    pageSize: 20,
  },
  printConfig: {},
  proxyConfig: {
    ajax: {
      delete: ({ body: { removeRecords } }) => {
        const ids = removeRecords.map((item) => item.id);
        return batchDeleteUserApi(ids);
      },
      query: ({ page: { currentPage, pageSize } }) =>
        getUserPageListApi({
          pageNum: currentPage,
          pageSize,
          ...userQuery,
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

function createActions(row: UserApi.User) {
  const actions: ActionItem[] = [
    {
      auth: 'system:user:update',
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
      auth: 'system:user:delete',
      disabled: row.id === userStore.userId,
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => {
            deleteUserApi(row.id).then(requestAfter);
          },
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
      auth: 'system:user:update-password',
      icon: 'carbon:password',
      label: $t('zen.service.user.resetPassword'),
      onClick: () => {
        resetPassword(row);
      },
    },
    {
      auth: 'system:permission:assign-user-role',
      icon: 'clarity:assign-user-line',
      label: $t('zen.service.user.assignRole'),
      onClick: () => {
        assignRoleModal.setData({ id: row.id });
        assignRoleModal.open();
      },
    },
  ];

  return { actions, dropdownActions };
}

function resetPassword(row: UserApi.User) {
  const title = $t('zen.common.systemTitle');
  const message = `${$t('zen.common.pleaseInput')}【${row.username}】${$t('zen.service.user.joinNewPassword')}`;

  ElMessageBox.prompt(message, title, {
    closeOnClickModal: false,
    draggable: true,
    inputPattern: /^(?!\s*$).+/,
  }).then(({ value }) => {
    resetUserPasswordApi({
      id: row.id,
      password: encryptBySha256(value),
    }).then(() => requestAfter(false));
  });
}

function createSex(sex: number) {
  const isMale = sex === DictSex.MALE;
  return {
    class: isMale ? 'text-blue-500' : 'text-pink-500',
    icon: isMale ? 'icon-park-outline:male' : 'icon-park-outline:female',
  };
}

function handleFilterDept(deptId?: number) {
  userQuery = { ...userQuery, deptId };
  vxeTable.value?.commitProxy('query');
}

function handleStatusChange(row: UserApi.User) {
  const { DISABLE, ENABLE } = DictStatus;

  const label =
    row.status === ENABLE
      ? $t('zen.common.joinEnable')
      : $t('zen.common.joinDisable');

  const title = $t('zen.common.systemTitle');
  const message = `${$t('zen.common.confirm')}${label}【${row.username}】${$t('zen.service.user.joinUser')} ?`;
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

function handleQuery(query: UserApi.PageQuery) {
  userQuery = query;
  vxeTable.value?.commitProxy('query');
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const { data } = await exportUser(userQuery);
  downloadExcel(data, fileName);
  exportModal.close();
  ElMessage.success($t('zen.export.success'));
}

async function handleImport(file: File, updateSupport: boolean) {
  const result = await importUser(file, updateSupport);
  importModal.close();

  setTimeout(() => {
    importResultModal.setData({ data: result });
    importResultModal.open();
  }, 250);
}

function reloadTable() {
  vxeTable.value?.commitProxy('reload');
}
</script>

<template>
  <FullHeightContainer :card="false" :class="[ns.b()]">
    <div class="flex h-full gap-5">
      <div class="hidden w-1/5 xl:block">
        <DeptFilter @query="handleFilterDept" />
      </div>

      <div class="w-full xl:w-4/5">
        <VxeBasicTable
          ref="vxeBasicTableRef"
          :class="[ns.be('table', 'container')]"
          :columns="columns"
          v-bind="tableOpts"
        >
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
              :default-name="$t('zen.service.user.title')"
              @confirm="handleExport"
            />
            <UserImportModal @confirm="handleImport" />
            <ImportResultModal @confirm="reloadTable" />
            <AssignRoleModal />
          </template>

          <template #avatar="{ row: { avatar } }">
            <div class="flex justify-center">
              <ElAvatar v-if="avatar" :src="avatar" />
              <span v-else>-</span>
            </div>
          </template>

          <template #sex="{ row: { sex } }">
            <div class="flex items-center justify-center gap-1">
              <Icon
                v-if="sex === DictSex.MALE || sex === DictSex.FEMALE"
                v-bind="createSex(sex)"
              />
              <span>{{ dictStore.getSex(sex)?.label || '-' }}</span>
            </div>
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
      </div>
    </div>
  </FullHeightContainer>
</template>

<style lang="scss" scoped>
@import '@vben/styles/global';

@include b('user-manage') {
  &-table__container {
    padding-top: 0;
    padding-right: 0;
    padding-left: 0;
  }
}
</style>
