<script setup lang="ts">
import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
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
  TableAction,
  TableExport,
} from '#/components';
import { DictSex, DictStatus, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore, useUserStore } from '#/store';
import { downloadExcel, encryptBySha256, useBatchSelect } from '#/utils';

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

let userQuery: UserApi.PageQuery = {};

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
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const [AssignRoleModal, assignRoleModal] = useVbenModal({
  connectedComponent: AssignRole,
});

const [TableExportModal, exportModal] = useVbenModal({
  connectedComponent: TableExport,
});

const [UserImportModal, importModal] = useVbenModal({
  connectedComponent: UserImport,
});

const [ImportResultModal, importResultModal] = useVbenModal({
  connectedComponent: ImportResult,
});

const statusDisabled = computed(
  () => !hasAccessByCodes(['system:user:update']),
);

const columns: UserColumns = [
  {
    fixed: 'left',
    type: 'checkbox',
    width: 50,
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('sys.user.id'),
  },
  {
    field: 'avatar',
    minWidth: 80,
    slots: { default: 'avatar' },
    title: $t('sys.user.avatar'),
    visible: false,
  },
  {
    field: 'username',
    minWidth: 120,
    title: $t('sys.user.username'),
  },
  {
    field: 'nickname',
    formatter: 'formatBlank',
    minWidth: 120,
    title: $t('sys.user.nickname'),
  },
  {
    field: 'sex',
    minWidth: 100,
    slots: { default: 'sex' },
    title: $t('sys.user.sex'),
  },
  {
    field: 'deptName',
    formatter: 'formatBlank',
    minWidth: 150,
    title: $t('sys.user.deptName'),
  },
  {
    field: 'mobile',
    formatter: 'formatBlank',
    minWidth: 150,
    title: $t('sys.user.mobile'),
  },
  {
    field: 'email',
    formatter: 'formatBlank',
    minWidth: 150,
    title: $t('sys.user.email'),
    visible: false,
  },
  {
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('sys.user.status'),
  },
  {
    field: 'loginIp',
    formatter: 'formatBlank',
    minWidth: 150,
    title: $t('sys.user.loginIp'),
    visible: false,
  },
  {
    field: 'loginDate',
    formatter: 'formatDateTimeBlank',
    minWidth: 150,
    title: $t('sys.user.loginDate'),
    visible: false,
  },
  {
    field: 'createTime',
    formatter: 'formatDateTime',
    minWidth: 150,
    title: $t('page.createTime'),
  },
  {
    fixed: 'right',
    slots: { default: 'opt' },
    title: $t('page.options'),
    width: 120,
  },
];

const gridOptions: VxeGridProps<UserApi.User> = {
  columns,
  checkboxConfig: {
    checkMethod: ({ row }) => row.id !== userStore.userId,
    highlight: true,
    range: true,
  },
  customConfig: {},
  id: 'user_manage',
  height: 'auto',
  proxyConfig: {
    ajax: {
      query: ({ page: { currentPage, pageSize } }) =>
        getUserPageListApi({
          pageNum: currentPage,
          pageSize,
          ...userQuery,
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
    auth: 'system:user:delete',
    icon: 'ep:delete',
    onClick: () => {
      useBatchSelect<UserApi.User>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteUserApi(records.map((item) => item.id)),
        query: userQuery,
      });
    },
    title: $t('page.batchDelete'),
    type: 'danger',
  },
  {
    auth: 'system:user:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('page.create'),
    type: 'primary',
  },
  {
    auth: 'system:user:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    onClick: () => exportModal.open(),
    title: $t('page.export.title'),
    type: 'warning',
  },
  {
    auth: 'system:user:import',
    icon: importLoading.value ? 'eos-icons:bubble-loading' : 'ep:upload',
    onClick: () => importModal.open(),
    title: $t('page.import'),
    type: 'info',
  },
]);

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
        content: $t('page.edit'),
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
      auth: 'system:user:update-password',
      icon: 'carbon:password',
      label: $t('sys.user.resetPassword'),
      onClick: () => {
        resetPassword(row);
      },
    },
    {
      auth: 'system:permission:assign-user-role',
      icon: 'clarity:assign-user-line',
      label: $t('sys.user.assignRole'),
      onClick: () => {
        assignRoleModal.setData({ id: row.id });
        assignRoleModal.open();
      },
    },
  ];

  return { actions, dropdownActions };
}

function resetPassword(row: UserApi.User) {
  const title = $t('page.systemTip');
  const message = $t('sys.user.confirm.password', [row.username]);
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
  gridApi.query();
}

function handleStatusChange(row: UserApi.User) {
  const { DISABLE, ENABLE } = DictStatus;

  const label = row.status === ENABLE ? $t('page.enable') : $t('page.disable');

  const title = $t('page.systemTip');
  const message = $t('sys.user.confirm.status', [label, row.username]);
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

function handleQuery(query: UserApi.PageQuery) {
  userQuery = query;
  gridApi.query();
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const { data } = await exportUser(userQuery);
  downloadExcel(data, fileName);
  exportModal.close();
  ElMessage.success($t('page.export.success'));
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
  gridApi.reload(userQuery);
}
</script>

<template>
  <Page auto-content-height>
    <div class="flex h-full gap-4">
      <div class="hidden w-1/5 xl:block">
        <DeptFilter @query="handleFilterDept" />
      </div>

      <div class="w-full xl:w-4/5">
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
              :default-name="$t('sys.user.title')"
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
              <IconifyIcon
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
        </Grid>
      </div>
    </div>
  </Page>
</template>
