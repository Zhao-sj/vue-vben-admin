<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import { useVbenModal } from '@vben/common-ui';

import { type AreaApi, getAreaListApi } from '#/api';
import { type ActionItem, TableAction, VxeBasicTable } from '#/components';
import { $t } from '#/locales';

import { IPSearch } from './components';

type AreaColumns = VxeGridProps<AreaApi.Simple>['columns'];

const [IPSearchModal, searchModal] = useVbenModal({
  connectedComponent: IPSearch,
});

const columns = computed<AreaColumns>(() => [
  {
    field: 'id',
    headerAlign: 'center',
    minWidth: 200,
    title: $t('zen.service.area.id'),
    treeNode: true,
  },
  {
    field: 'name',
    headerAlign: 'center',
    minWidth: 200,
    title: $t('zen.service.area.name'),
  },
]);

const tableOpts = reactive<VxeGridProps<AreaApi.Simple>>({
  customConfig: {},
  id: 'area_manage',
  keyboardConfig: {
    isArrow: true,
    isBack: true,
    isEnter: true,
  },
  printConfig: {},
  proxyConfig: {
    ajax: {
      query: getAreaListApi,
    },
  },
  rowConfig: {
    isCurrent: true,
  },
  stripe: false,
  toolbarConfig: {
    print: true,
    refresh: true,
    slots: {
      buttons: 'toolbar_left',
    },
  },
  treeConfig: {
    childrenField: 'children',
    rowField: 'id',
  },
});

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:menu:create',
    icon: 'ep:location',
    onClick: () => searchModal.open(),
    title: $t('zen.service.area.search'),
    type: 'primary',
  },
]);
</script>

<template>
  <VxeBasicTable :columns="columns" v-bind="tableOpts">
    <template #toolbar_left>
      <TableAction
        :actions="toolbarActions"
        :link="false"
        :show-empty="false"
        circle
      />

      <IPSearchModal />
    </template>
  </VxeBasicTable>
</template>
