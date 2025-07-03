<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { OAuth2Api } from '#/api';

import { Page } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteAccessTokenApi, getOAuth2TokenPageApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import { useColumns, useGridFormSchema } from './data';
import { UserInfo } from './modules';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.SEX);

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
    showCollapseButton: isMobile.value,
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-6',
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    id: 'oauth2_token_manage',
    proxyConfig: {
      ajax: {
        query: ({ page }, formValues) =>
          getOAuth2TokenPageApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
  } as VxeTableGridOptions<OAuth2Api.AccessToken>,
});

const { onSuccess } = useGridHelper<OAuth2Api.AccessToken>(gridApi);

function onActionClick({
  code,
  row,
}: OnActionClickParams<OAuth2Api.AccessToken>) {
  switch (code) {
    case 'kickout': {
      deleteAccessTokenApi(row.accessToken).then(onSuccess);
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
    <Grid :table-title="$t('sys.oauth2.token.list')">
      <template #userId="{ row }">
        <UserInfo :id="row.userId" />
      </template>
    </Grid>
  </Page>
</template>
