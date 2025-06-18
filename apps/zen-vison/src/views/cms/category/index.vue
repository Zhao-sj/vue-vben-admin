<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CategoryApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteCmsCategoryApi, getCmsCategoryListApi } from '#/api';
import { TableAction } from '#/components';
import { DictStatus, DictTypeEnum } from '#/enums';
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
    label: $t('cms.category.name'),
  },
  {
    component: 'Select',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS),
    },
    fieldName: 'status',
    label: $t('cms.category.status'),
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

const columns: VxeTableGridOptions<CategoryApi.Category>['columns'] = [
  {
    field: 'name',
    headerAlign: 'center',
    align: 'left',
    minWidth: 200,
    title: $t('cms.category.name'),
    treeNode: true,
  },
  {
    field: 'code',
    minWidth: 150,
    title: $t('cms.category.code'),
  },
  {
    field: 'sort',
    minWidth: 150,
    title: $t('cms.category.sort'),
  },
  {
    field: 'status',
    minWidth: 100,
    title: $t('cms.category.status'),
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

const gridOptions: VxeTableGridOptions<CategoryApi.Category> = {
  columns,
  id: 'cms_category_manage',
  keyboardConfig: {
    isArrow: true,
    isBack: true,
    isEnter: true,
  },
  proxyConfig: {
    ajax: {
      query: (_, formValues) => getCategoryList(formValues),
    },
  },
  height: 'auto',
  stripe: false,
  pagerConfig: {
    enabled: false,
  },
  treeConfig: {
    expandAll: true,
    parentField: 'parentId',
    rowField: 'id',
    transform: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'cms:article-category:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => addDrawerApi.open(),
    type: 'primary',
  },
]);

function createActions(row: CategoryApi.Category) {
  const actions: ActionItem[] = [
    {
      auth: 'cms:article-category:update',
      icon: 'ep:edit',
      btnText: $t('page.edit'),
      onClick: () => {
        editDrawerApi.setData({ id: row.id });
        editDrawerApi.open();
      },
      type: 'primary',
    },
    {
      auth: 'cms:article-category:delete',
      icon: 'ep:delete',
      btnText: $t('page.delete'),
      popConfirm: {
        on: {
          confirm: () => {
            deleteCmsCategoryApi(row.id).then(() => {
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

  if (row.status === DictStatus.ENABLE) {
    actions.unshift({
      auth: 'cms:article-category:create',
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

async function getCategoryList(categoryQuery: CategoryApi.Query) {
  const list = await getCmsCategoryListApi(categoryQuery);
  return { list };
}

async function reloadTable() {
  const values = await gridApi.formApi.getValues();
  await gridApi.reload(values);
  gridApi.grid.setAllTreeExpand(true);
}

function toggleExpandAll() {
  const expandRecords = gridApi.grid.getTreeExpandRecords();
  gridApi.grid.setAllTreeExpand(expandRecords?.length === 0);
}
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('cms.category.list')" :form-options="formOptions">
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
            class="scale-95"
            plain
            @click="toggleExpandAll"
          >
            <IconifyIcon icon="ep:sort" />
          </ElButton>

          <TableAddDrawer @success="reloadTable" />
          <TableEditDrawer @success="reloadTable" />
        </div>
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
