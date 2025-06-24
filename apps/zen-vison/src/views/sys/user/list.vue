<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { UserApi } from '#/api';
import type { ActionItem } from '#/components';

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
  Form,
  ImportResult,
  UserImport,
} from './modules';

const { isMobile } = useIsMobile();
const userStore = useUserStore();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.SEX);

const requestConfig = {
  loadingDelay: 200,
  manual: true,
};

const { loading: exportLoading, runAsync: exportUser } = useRequest(
  exportUserApi,
  requestConfig,
);

const { loading: importLoading, runAsync: importUser } = useRequest(
  importUserApi,
  requestConfig,
);

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [AssignRoleDrawer, assignRoleDrawerApi] = useVbenDrawer({
  connectedComponent: AssignRole,
});

const [ExportModal, exportModalApi] = useVbenModal({
  connectedComponent: TableExport,
});

const [ImportDrawer, importDrawerApi] = useVbenDrawer({
  connectedComponent: UserImport,
});

const [ImportResultModal, importResultModalApi] = useVbenModal({
  connectedComponent: ImportResult,
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
    onClick: () => formDrawerApi.open(),
    type: 'primary',
  },
]);

function onActionClick({ code, row }: OnActionClickParams<UserApi.User>) {
  switch (code) {
    case 'assign': {
      assignRoleDrawerApi.setData(row);
      assignRoleDrawerApi.open();
      break;
    }
    case 'delete': {
      deleteUserApi(row.id).then(requestAfter);
      break;
    }
    case 'edit': {
      formDrawerApi.setData(row);
      formDrawerApi.open();
      break;
    }
    case 'reset': {
      resetPassword(row);
      break;
    }
    default: {
      break;
    }
  }
}

async function onStatusChange(newStatus: number, row: UserApi.User) {
  const action =
    newStatus === DictStatus.ENABLE ? $t('page.enable') : $t('page.disable');

  const message = $t('sys.user.confirm.status', [action, row.username]);

  try {
    await ElMessageBox.confirm(message, $t('page.systemTip'), {
      closeOnClickModal: false,
      draggable: true,
      type: 'warning',
    });
    await updateUserStatusApi({ id: row.id, status: newStatus });
    requestAfter(false);
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
  const { data } = await exportUser(values);
  downloadExcel(data, fileName);
  exportModalApi.close();
  ElMessage.success($t('page.export.success'));
}

async function onImport(file: File, updateSupport: boolean) {
  const result = await importUser(file, updateSupport);
  importDrawerApi.close();

  setTimeout(() => {
    importResultModalApi.setData({ data: result });
    importResultModalApi.open();
  }, 250);
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

async function reloadTable(deptId?: number) {
  await gridApi.formApi.setFieldValue('deptId', deptId);
  const values = await gridApi.formApi.getValues();
  gridApi.query({ ...values, deptId });
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="reloadTable" />
    <ImportDrawer @confirm="onImport" />
    <ImportResultModal @confirm="reloadTable" />
    <ExportModal :default-name="$t('sys.user.list')" @confirm="onExport" />
    <AssignRoleDrawer />

    <div class="flex h-full gap-4">
      <div class="hidden w-1/5 xl:block">
        <DeptFilter @query="reloadTable" />
      </div>

      <div class="w-full overflow-hidden xl:w-4/5">
        <Grid :table-title="$t('sys.user.list')">
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
        </Grid>
      </div>
    </div>
  </Page>
</template>
