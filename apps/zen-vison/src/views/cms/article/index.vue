<script setup lang="ts">
import type { VbenFormProps, VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { NoticeApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  buildMenuTree,
  deleteCmsArticleApi,
  getCmsArticlePageApi,
  getCmsCategorySimpleApi,
  getCmsTagSimpleApi,
} from '#/api';
import { TableAction } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import { TableAdd, TableEdit } from './components';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.ARTICLE_STATUS);

const { data: categoryList } = useRequest(getCmsCategorySimpleApi);
const { data: tagList } = useRequest(getCmsTagSimpleApi);

const [TableAddDrawer, addDrawerApi] = useVbenDrawer({
  connectedComponent: TableAdd,
});

const [TableEditDrawer, editDrawerApi] = useVbenDrawer({
  connectedComponent: TableEdit,
});

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    fieldName: 'title',
    label: $t('cms.article.title'),
  },
  {
    component: 'Input',
    fieldName: 'description',
    label: $t('cms.article.description'),
  },
  {
    component: 'Cascader',
    componentProps: {
      options: buildMenuTree(categoryList.value || []),
      props: {
        label: 'name',
        value: 'id',
        expandTrigger: 'hover',
      },
    },
    fieldName: 'categoryId',
    label: $t('cms.article.category'),
  },
  {
    component: 'Select',
    componentProps: {
      multiple: true,
      multipleLimit: 3,
      options:
        tagList.value?.map((item) => ({
          label: item.name,
          value: item.id,
        })) || [],
    },
    fieldName: 'tagIds',
    label: $t('cms.article.tag'),
  },
  {
    component: 'Input',
    fieldName: 'publicId',
    label: $t('cms.article.publicId'),
    help: $t('cms.article.help.publicId'),
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
  wrapperClass: 'grid-cols-1 lg:grid-cols-4',
}));

const columns: VxeTableGridOptions<NoticeApi.Notice>['columns'] = [
  {
    field: 'id',
    minWidth: 80,
    title: $t('cms.article.id'),
  },
  {
    field: 'banner',
    minWidth: 100,
    title: $t('cms.article.banner'),
    cellRender: {
      name: 'CellImage',
      props: {
        class: 'max-h-16 rounded-md',
        fit: 'cover',
        lazy: true,
      },
    },
  },
  {
    field: 'title',
    minWidth: 200,
    title: $t('cms.article.title'),
    showOverflow: true,
  },
  {
    field: 'description',
    minWidth: 300,
    title: $t('cms.article.description'),
    formatter: 'formatBlank',
    showOverflow: true,
  },
  {
    field: 'categoryName',
    minWidth: 100,
    title: $t('cms.article.category'),
  },
  {
    field: 'tagList',
    minWidth: 200,
    title: $t('cms.article.tag'),
    cellRender: {
      name: 'CellTags',
      props: {
        label: 'name',
      },
    },
  },
  {
    field: 'status',
    minWidth: 100,
    title: $t('cms.article.status'),
    cellRender: {
      name: 'CellDict',
      props: {
        type: DictTypeEnum.ARTICLE_STATUS,
      },
    },
  },
  {
    field: 'viewCount',
    minWidth: 100,
    title: $t('cms.article.viewCount'),
    formatter: 'formatThousand',
  },
  {
    field: 'likeCount',
    minWidth: 100,
    title: $t('cms.article.likeCount'),
    formatter: 'formatThousand',
    visible: false,
  },
  {
    field: 'commentCount',
    minWidth: 100,
    title: $t('cms.article.commentCount'),
    formatter: 'formatThousand',
    visible: false,
  },
  {
    field: 'favoriteCount',
    minWidth: 100,
    title: $t('cms.article.favoriteCount'),
    formatter: 'formatThousand',
    visible: false,
  },
  {
    field: 'forwardCount',
    minWidth: 100,
    title: $t('cms.article.forwardCount'),
    formatter: 'formatThousand',
    visible: false,
  },
  {
    field: 'creatorName',
    minWidth: 100,
    title: $t('cms.article.author'),
    visible: false,
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
    width: 180,
    fixed: isMobile.value ? null : 'right',
    slots: { default: 'opt' },
  },
];

const gridOptions: VxeTableGridOptions<NoticeApi.Notice> = {
  columns,
  height: 'auto',
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  id: 'cms_article_manage',
  proxyConfig: {
    ajax: {
      query: ({ page }, formValues) =>
        getCmsArticlePageApi({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
          categoryId: formValues.categoryId
            ? formValues.categoryId[formValues.categoryId.length - 1]
            : formValues.categoryId,
        }),
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'cms:article:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => addDrawerApi.open(),
    type: 'primary',
  },
]);

function createActions(row: NoticeApi.Notice) {
  const actions: ActionItem[] = [
    {
      auth: 'cms:article:update',
      icon: 'ep:edit',
      btnText: $t('page.edit'),
      onClick: () => {
        editDrawerApi.setData({ id: row.id });
        editDrawerApi.open();
      },
      type: 'primary',
    },
    {
      auth: 'cms:article:delete',
      icon: 'ep:delete',
      btnText: $t('page.delete'),
      popConfirm: {
        on: {
          confirm: () => deleteCmsArticleApi(row.id).then(requestAfter),
        },
        title: $t('page.confirmDelete'),
      },
      type: 'danger',
    },
  ];

  return actions;
}

async function reloadTable() {
  const formValues = await gridApi.formApi.getValues();
  gridApi.reload(formValues);
}

function requestAfter(reload = true) {
  ElMessage.success($t('page.success'));
  reload && reloadTable();
}
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('cms.article.list')" :form-options="formOptions">
      <template #toolbar-tools>
        <TableAction
          :actions="toolbarActions"
          :link="false"
          :show-empty="false"
        />

        <TableAddDrawer @success="reloadTable" />
        <TableEditDrawer @success="reloadTable" />
      </template>

      <template #opt="{ row }">
        <TableAction :actions="createActions(row)" />
      </template>
    </Grid>
  </Page>
</template>
