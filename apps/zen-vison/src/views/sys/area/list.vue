<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { AreaApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getAreaListApi } from '#/api';
import { TableAction } from '#/components';
import { $t } from '#/locales';

import { IPSearch } from './modules';

type AreaColumns = VxeTableGridOptions<AreaApi.Simple>['columns'];

const [IPSearchModal, searchModal] = useVbenModal({
  connectedComponent: IPSearch,
});

const columns: AreaColumns = [
  {
    field: 'id',
    headerAlign: 'center',
    align: 'left',
    minWidth: 200,
    title: $t('sys.area.id'),
    treeNode: true,
  },
  {
    field: 'name',
    headerAlign: 'center',
    align: 'left',
    minWidth: 200,
    title: $t('sys.area.name'),
  },
];

const gridOptions: VxeTableGridOptions<AreaApi.Simple> = {
  columns,
  height: 'auto',
  id: 'area_manage',
  keyboardConfig: {
    isArrow: true,
    isBack: true,
    isEnter: true,
  },
  proxyConfig: {
    ajax: {
      query: getAreaList,
    },
  },
  rowConfig: {
    isCurrent: true,
  },
  stripe: false,
  treeConfig: {
    childrenField: 'children',
    rowField: 'id',
  },
  pagerConfig: {
    enabled: false,
  },
};

const [Grid] = useVbenVxeGrid({ gridOptions });

const toolbarActions = computed<ActionItem[]>(() => [
  {
    icon: 'lucide:search',
    btnText: $t('sys.area.search'),
    onClick: () => searchModal.open(),
    type: 'primary',
  },
]);

async function getAreaList() {
  const list = await getAreaListApi();
  return { list };
}
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('sys.area.list')">
      <template #toolbar-tools>
        <TableAction
          :actions="toolbarActions"
          :link="false"
          :show-empty="false"
        />

        <IPSearchModal />
      </template>
    </Grid>
  </Page>
</template>
