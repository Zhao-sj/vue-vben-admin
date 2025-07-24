<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { AreaApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getAreaListApi } from '#/api';
import { TableAction } from '#/components';
import { $t } from '#/locales';

import { useColumns } from './data';
import { IPSearch } from './modules';

const [SearchModal, searchModalApi] = useVbenModal({
  connectedComponent: IPSearch,
});

const [Grid] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    id: 'area_manage',
    keyboardConfig: {
      isArrow: true,
      isBack: true,
      isEnter: true,
    },
    proxyConfig: {
      ajax: {
        query: async () => {
          const list = await getAreaListApi();
          return { list };
        },
      },
    },
    rowConfig: {
      isCurrent: true,
    },
    stripe: false,
    pagerConfig: {
      enabled: false,
    },
    treeConfig: {
      childrenField: 'children',
      rowField: 'id',
    },
  } as VxeTableGridOptions<AreaApi.Simple>,
});

const toolbarActions: ActionItem[] = [
  {
    icon: 'lucide:search',
    btnText: $t('sys.area.search'),
    onClick: () => {
      searchModalApi.open();
    },
    type: 'primary',
  },
];
</script>

<template>
  <Page auto-content-height>
    <SearchModal />

    <Grid :table-title="$t('sys.area.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
      </template>
    </Grid>
  </Page>
</template>
