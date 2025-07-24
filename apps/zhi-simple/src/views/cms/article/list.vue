<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { ArticleApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteCmsArticleApi, getCmsArticlePageApi } from '#/api';
import { TableAction } from '#/components';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import { useColumns, useGridFormSchema } from './data';
import { Form } from './modules';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.ARTICLE_STATUS);

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
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
    wrapperClass: 'grid-cols-1 lg:grid-cols-4',
  },
  gridOptions: {
    columns: useColumns(onActionClick),
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
  } as VxeTableGridOptions<ArticleApi.Article>,
});

const { onSuccess } = useGridHelper<ArticleApi.Article>(gridApi);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'cms:article:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => {
      formDrawerApi.open();
    },
    type: 'primary',
  },
]);

function onActionClick({ code, row }: OnActionClickParams<ArticleApi.Article>) {
  switch (code) {
    case 'delete': {
      deleteCmsArticleApi(row.id).then(onSuccess);
      break;
    }
    case 'edit': {
      formDrawerApi.setData(row);
      formDrawerApi.open();
      break;
    }
    default: {
      break;
    }
  }
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onSuccess" />

    <Grid :table-title="$t('cms.article.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
      </template>
    </Grid>
  </Page>
</template>
