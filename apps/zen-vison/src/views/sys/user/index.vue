<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { UserApi } from '#/api';
import type { ActionDropdownItem, ActionItem } from '#/components';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeleteUserApi,
  deleteUserApi,
  exportUserApi,
  getUserPageListApi,
  importUserApi,
  resetUserPasswordApi,
  updateUserStatusApi,
} from '#/api';
import { TableAction, TableExport, TableSwitch } from '#/components';
import { DictSex, DictTypeEnum } from '#/enums';
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
  UserImport,
} from './components';

const { isMobile } = useIsMobile();
const { hasAccessByCodes } = useAccess();
const userStore = useUserStore();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS, DictTypeEnum.SEX);

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

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'username',
    label: $t('sys.user.username'),
  },
  {
    component: 'Input',
    fieldName: 'mobile',
    label: $t('sys.user.mobile'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
    },
    fieldName: 'status',
    label: $t('sys.user.status'),
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

const columns: VxeGridProps<UserApi.User>['columns'] = [
  {
    type: 'checkbox',
    width: 50,
    fixed: isMobile.value ? null : 'left',
  },
  {
    field: 'id',
    minWidth: 80,
    title: $t('sys.user.id'),
  },
  {
    field: 'avatar',
    minWidth: 80,
    title: $t('sys.user.avatar'),
    cellRender: { name: 'CellAvatar' },
    showOverflow: false,
    visible: false,
  },
  {
    field: 'username',
    minWidth: 120,
    title: $t('sys.user.username'),
  },
  {
    field: 'nickname',
    minWidth: 120,
    title: $t('sys.user.nickname'),
    formatter: 'formatBlank',
  },
  {
    field: 'sex',
    minWidth: 100,
    title: $t('sys.user.sex'),
    slots: { default: 'sex' },
  },
  {
    field: 'deptName',
    minWidth: 150,
    title: $t('sys.user.deptName'),
    formatter: 'formatBlank',
  },
  {
    field: 'mobile',
    minWidth: 150,
    title: $t('sys.user.mobile'),
    formatter: 'formatBlank',
  },
  {
    field: 'email',
    minWidth: 150,
    title: $t('sys.user.email'),
    formatter: 'formatBlank',
    visible: false,
  },
  {
    field: 'status',
    minWidth: 100,
    title: $t('sys.user.status'),
    slots: { default: 'status' },
  },
  {
    field: 'loginIp',
    minWidth: 150,
    title: $t('sys.user.loginIp'),
    formatter: 'formatBlank',
    visible: false,
  },
  {
    field: 'loginDate',
    minWidth: 150,
    title: $t('sys.user.loginDate'),
    formatter: 'formatDateTimeBlank',
    visible: false,
  },
  {
    field: 'createTime',
    minWidth: 150,
    formatter: 'formatDateTime',
    title: $t('page.createTime'),
  },
  {
    title: $t('page.options'),
    width: 120,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeGridProps<UserApi.User> = {
  columns,
  checkboxConfig: {
    checkMethod: ({ row }) => row.id !== userStore.userId,
    highlight: true,
    range: true,
  },
  id: 'user_manage',
  height: 'auto',
  proxyConfig: {
    ajax: {
      query: ({ page }, formValues) =>
        getUserPageListApi({
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
    auth: 'system:user:delete',
    icon: 'ep:delete',
    onClick: async () => {
      const values = await gridApi.formApi.getValues();
      useBatchSelect<UserApi.User>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteUserApi(records.map((item) => item.id)),
        query: values,
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

function requestAfter(reload = true) {
  ElMessage.success($t('page.success'));
  reload && reloadTable();
}

async function handleExport(fileName: string) {
  if (exportLoading.value) {
    return;
  }
  const values = await gridApi.formApi.getValues();
  const { data } = await exportUser(values);
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

async function reloadTable(deptId?: number) {
  await gridApi.formApi.setFieldValue('deptId', deptId);
  const values = await gridApi.formApi.getValues();
  gridApi.query({ ...values, deptId });
}
</script>

<template>
  <Page auto-content-height>
    <div class="flex h-full gap-4">
      <div class="hidden w-1/5 xl:block">
        <DeptFilter @query="reloadTable" />
      </div>

      <div class="w-full overflow-hidden xl:w-4/5">
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
              :default-name="$t('sys.user.title')"
              @confirm="handleExport"
            />
            <UserImportModal @confirm="handleImport" />
            <ImportResultModal @confirm="reloadTable" />
            <AssignRoleModal />
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
            <TableSwitch
              v-model="row.status"
              :disabled="statusDisabled"
              :row
              :tip="
                (action) =>
                  $t('sys.user.confirm.status', [action, row.username])
              "
              :on-action="
                () => updateStatus({ id: row.id, status: row.status })
              "
              :on-success="requestAfter"
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
