<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';

import { useVbenVxeGrid, type VxeGridProps } from '#/adapter/vxe-table';
import { type AreaApi, getAreaListApi } from '#/api';
import { type ActionItem, TableAction } from '#/components';
import { $t } from '#/locales';

import { IPSearch } from './components';

type AreaColumns = VxeGridProps<AreaApi.Simple>['columns'];

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

const gridOptions: VxeGridProps<AreaApi.Simple> = {
  columns,
  height: 'auto',
  customConfig: {},
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
  toolbarConfig: {
    refresh: true,
  },
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
    onClick: () => searchModal.open(),
    title: $t('sys.area.search'),
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
    <Grid>
      <template #toolbar-actions>
        <TableAction
          :actions="toolbarActions"
          :link="false"
          :show-empty="false"
          circle
        />

        <IPSearchModal />
      </template>
    </Grid>
  </Page>
</template>
