<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { UserApi } from '#/api';
import type { ActionDropdownItem, ActionItem } from '#/components';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
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
import { TableAction, TableExport } from '#/components';
import { DictSex, DictStatus, DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore, useUserStore } from '#/store';
import { downloadExcel, encryptBySha256, useBatchSelect } from '#/utils';

import { useColumns, useGridFormSchema } from './data';
import {
  AssignRole,
  DeptFilter,
  ImportResult,
  TableAdd,
  TableEdit,
  UserImport,
} from './modules';

const { isMobile } = useIsMobile();
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

const [TableAddDrawer, addDrawerApi] = useVbenDrawer({
  connectedComponent: TableAdd,
});

const [TableEditDrawer, editDrawerApi] = useVbenDrawer({
  connectedComponent: TableEdit,
});

const [AssignRoleDrawer, assignRoleDrawerApi] = useVbenDrawer({
  connectedComponent: AssignRole,
});

const [TableExportModal, exportModalApi] = useVbenModal({
  connectedComponent: TableExport,
});

const [UserImportDrawer, importDrawerApi] = useVbenDrawer({
  connectedComponent: UserImport,
});

const [ImportResultModal, importResultModalApi] = useVbenModal({
  connectedComponent: ImportResult,
});

const formOptions = computed<VbenFormProps>(() => ({
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
}));

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(handleStatusChange),
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
  } as VxeTableGridOptions<UserApi.User>,
});

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:user:export',
    icon: exportLoading.value ? 'eos-icons:bubble-loading' : 'ep:download',
    btnText: $t('page.export.action'),
    onClick: () => exportModalApi.open(),
  },
  {
    auth: 'system:user:import',
    icon: importLoading.value ? 'eos-icons:bubble-loading' : 'ep:upload',
    btnText: $t('page.import.action'),
    onClick: () => importDrawerApi.open(),
  },
  {
    auth: 'system:user:delete',
    icon: 'ep:delete',
    btnText: $t('page.delete'),
    onClick: async () => {
      const values = await gridApi.formApi.getValues();
      useBatchSelect<UserApi.User>({
        gridApi,
        handleBatch: (records) =>
          batchDeleteUserApi(records.map((item) => item.id)),
        query: values,
      });
    },
    type: 'danger',
  },
  {
    auth: 'system:user:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => addDrawerApi.open(),
    type: 'primary',
  },
]);

function createActions(row: UserApi.User) {
  const actions: ActionItem[] = [
    {
      auth: 'system:user:update',
      icon: 'ep:edit',
      btnText: $t('page.edit'),
      onClick: () => {
        editDrawerApi.setData({ id: row.id });
        editDrawerApi.open();
      },
      type: 'primary',
    },
    {
      auth: 'system:user:delete',
      disabled: row.id === userStore.userId,
      icon: 'ep:delete',
      btnText: $t('page.delete'),
      popConfirm: {
        on: {
          confirm: () => {
            deleteUserApi(row.id).then(requestAfter);
          },
        },
        title: $t('page.confirmDelete'),
      },
      type: 'danger',
    },
  ];

  const dropdownActions: ActionDropdownItem[] = [
    {
      auth: 'system:user:update-password',
      icon: 'carbon:password',
      btnText: $t('sys.user.resetPassword'),
      onClick: () => {
        resetPassword(row);
      },
    },
    {
      auth: 'system:permission:assign-user-role',
      icon: 'clarity:assign-user-line',
      btnText: $t('sys.user.assignRole'),
      onClick: () => {
        assignRoleDrawerApi.setData({ id: row.id });
        assignRoleDrawerApi.open();
      },
    },
  ];

  return { actions, dropdownActions };
}

async function handleStatusChange(newStatus: number, row: UserApi.User) {
  const action =
    newStatus === DictStatus.ENABLE ? $t('page.enable') : $t('page.disable');

  const message = $t('sys.user.confirm.status', [action, row.username]);

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
  exportModalApi.close();
  ElMessage.success($t('page.export.success'));
}

async function handleImport(file: File, updateSupport: boolean) {
  const result = await importUser(file, updateSupport);
  importDrawerApi.close();

  setTimeout(() => {
    importResultModalApi.setData({ data: result });
    importResultModalApi.open();
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
    <TableAddDrawer @success="reloadTable" />
    <TableEditDrawer @success="reloadTable" />
    <TableExportModal
      :default-name="$t('sys.user.list')"
      @confirm="handleExport"
    />
    <UserImportDrawer @confirm="handleImport" />
    <ImportResultModal @confirm="reloadTable" />
    <AssignRoleDrawer />

    <div class="flex h-full gap-4">
      <div class="hidden w-1/5 xl:block">
        <DeptFilter @query="reloadTable" />
      </div>

      <div class="w-full overflow-hidden xl:w-4/5">
        <Grid :table-title="$t('sys.user.list')" :form-options>
          <template #toolbar-tools>
            <TableAction
              :actions="toolbarActions"
              :link="false"
              :show-empty="false"
            />
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

          <template #opt="{ row }">
            <TableAction v-bind="createActions(row)" />
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>
