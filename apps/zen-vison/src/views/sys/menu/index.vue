<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { MenuApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer } from '@vben/common-ui';
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

const [TableAddDrawer, addDrawerApi] = useVbenDrawer({
  connectedComponent: TableAdd,
});

const [TableEditDrawer, editDrawerApi] = useVbenDrawer({
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
    field: 'icon',
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
    field: 'opt',
    title: $t('page.options'),
    width: 240,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeGridProps<MenuApi.Menu> = {
  columns,
  id: 'menu_manage',
  keyboardConfig: {
    isArrow: true,
    isBack: true,
    isEnter: true,
  },
  showOverflow: true,
  scrollY: {
    enabled: true,
    gt: 0,
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
  treeConfig: {
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
    btnText: $t('page.create'),
    onClick: () => addDrawerApi.open(),
    type: 'primary',
  },
]);

function createActions(row: MenuApi.Menu) {
  const actions: ActionItem[] = [
    {
      auth: 'system:menu:update',
      icon: 'ep:edit',
      btnText: $t('page.edit'),
      onClick: () => {
        editDrawerApi.setData({ id: row.id });
        editDrawerApi.open();
      },
      type: 'primary',
    },
    {
      auth: 'system:menu:delete',
      icon: 'ep:delete',
      btnText: $t('page.delete'),
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
      type: 'danger',
    },
  ];

  if (row.type !== MenuType.BUTTON) {
    actions.unshift({
      auth: 'system:menu:create',
      icon: 'ep:plus',
      btnText: $t('page.actionTitle.create', [$t('page.sub')]),
      onClick: () => {
        addDrawerApi.setData({ parentId: row.id });
        addDrawerApi.open();
      },
      type: 'primary',
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
}

function toggleExpandAll() {
  const expandRecords = gridApi.grid.getTreeExpandRecords();
  gridApi.grid.setAllTreeExpand(expandRecords?.length === 0);
}
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('sys.menu.list')" :form-options="formOptions">
      <template #toolbar-tools>
        <div class="flex items-center gap-2">
          <TableAction
            :actions="toolbarActions"
            :link="false"
            :show-empty="false"
          />

          <ElButton
            :title="`${$t('page.expand')} / ${$t('page.collapsed')}`"
            circle
            plain
            @click="toggleExpandAll"
          >
            <IconifyIcon icon="ep:sort" />
          </ElButton>

          <TableAddDrawer @success="reloadTable" />
          <TableEditDrawer @success="reloadTable" />
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
