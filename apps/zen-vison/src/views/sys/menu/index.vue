<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { MenuApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenModal } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteMenuApi, getMenuListApi } from '#/api';
import { TableAction } from '#/components';
import { DictTypeEnum, MenuType } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import { TableAdd, TableEdit } from './components';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

const [TableAddModal, addModal] = useVbenModal({
  connectedComponent: TableAdd,
});

const [TableEditModal, editModal] = useVbenModal({
  connectedComponent: TableEdit,
});

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('sys.menu.name'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
    },
    fieldName: 'status',
    label: $t('sys.menu.status'),
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
  showCollapseButton: isMobile.value,
  wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-6',
}));

const columns: VxeGridProps<MenuApi.Menu>['columns'] = [
  {
    field: 'name',
    headerAlign: 'center',
    align: 'left',
    minWidth: 200,
    title: $t('sys.menu.name'),
    treeNode: true,
  },
  {
    minWidth: 80,
    title: $t('sys.menu.icon'),
    slots: { default: 'icon' },
  },
  {
    field: 'permission',
    headerAlign: 'center',
    align: 'left',
    minWidth: 200,
    title: $t('sys.menu.permission'),
  },
  {
    field: 'component',
    headerAlign: 'center',
    align: 'left',
    minWidth: 350,
    title: $t('sys.menu.component'),
  },
  {
    field: 'sort',
    minWidth: 80,
    title: $t('sys.menu.sort'),
  },
  {
    field: 'status',
    minWidth: 100,
    title: $t('sys.menu.status'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.STATUS,
      },
    },
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

const gridOptions: VxeGridProps<MenuApi.Menu> = {
  columns,
  customConfig: {},
  id: 'menu_manage',
  keyboardConfig: {
    isArrow: true,
    isBack: true,
    isEnter: true,
  },
  proxyConfig: {
    ajax: {
      query: (_, formValues) => getMenuList(formValues),
    },
  },
  pagerConfig: {
    enabled: false,
  },
  height: 'auto',
  stripe: false,
  toolbarConfig: {
    refresh: true,
  },
  treeConfig: {
    // expandAll: true,
    parentField: 'parentId',
    rowField: 'id',
    transform: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:menu:create',
    icon: 'ep:plus',
    onClick: () => addModal.open(),
    title: $t('page.create'),
    type: 'primary',
  },
]);

function createActions(row: MenuApi.Menu) {
  const actions: ActionItem[] = [
    {
      auth: 'system:menu:update',
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
      auth: 'system:menu:delete',
      icon: 'ep:delete',
      popConfirm: {
        on: {
          confirm: () => {
            deleteMenuApi(row.id).then(() => {
              ElMessage.success($t('page.success'));
              reloadTable();
            });
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

  if (row.type !== MenuType.BUTTON) {
    actions.unshift({
      auth: 'system:menu:create',
      icon: 'ep:plus',
      onClick: () => {
        addModal.setData({ parentId: row.id });
        addModal.open();
      },
      tooltip: {
        content: $t('page.create'),
      },
    });
  }

  return actions;
}

async function getMenuList(menuQuery: MenuApi.Query) {
  const list = await getMenuListApi(menuQuery);
  return { list };
}

async function reloadTable() {
  const values = await gridApi.formApi.getValues();
  await gridApi.reload(values);
  // gridApi.grid.setAllTreeExpand(true);
}

function toggleExpandAll() {
  const expandRecords = gridApi.grid.getTreeExpandRecords();
  gridApi.grid.setAllTreeExpand(expandRecords?.length === 0);
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
      </template>

      <template #toolbar-tools>
        <div>
          <ElButton
            :title="`${$t('page.expand')} / ${$t('page.collapsed')}`"
            circle
            class="scale-95"
            plain
            @click="toggleExpandAll"
          >
            <IconifyIcon icon="ep:sort" />
          </ElButton>
        </div>
      </template>

      <template #icon="{ row }">
        <div v-if="row.meta?.icon" class="flex justify-center">
          <IconifyIcon :icon="row.meta.icon" class="text-xl" />
        </div>
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
