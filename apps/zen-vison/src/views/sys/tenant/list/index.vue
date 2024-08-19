<script setup lang="ts">
import type { VxeGridProps } from 'vxe-table';

import { Icon } from '@vben/icons';

import {
  getTenantPackageSimpleListApi,
  getTenantPageListApi,
  type TenantApi,
} from '#/api';
import { type ActionItem, TableAction, VxeBasicTable } from '#/components';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import { formatToDateTime, formatToThousand } from '#/utils';

type TenantColumns = VxeGridProps<TenantApi.Tenant>['columns'];

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.STATUS);

const vxeBasicTableRef = ref<InstanceType<typeof VxeBasicTable>>();

const { data: packageList, runAsync: getPackageList } = useRequest(
  getTenantPackageSimpleListApi,
  {
    manual: true,
  },
);

const vxeTable = computed(() =>
  vxeBasicTableRef.value?.getTableInstance<TenantApi.Tenant>(),
);

const statusOpts = computed(() =>
  dictStore.getDictDataList(DictTypeEnum.STATUS),
);

const columns = computed<TenantColumns>(() => [
  { align: 'center', type: 'checkbox', width: 50 },
  {
    align: 'center',
    field: 'id',
    minWidth: 80,
    title: $t('zen.service.tenant.code'),
  },
  {
    align: 'center',
    field: 'name',
    minWidth: 150,
    title: $t('zen.service.tenant.name'),
  },
  {
    align: 'center',
    field: 'packageId',
    minWidth: 120,
    slots: { default: 'package' },
    title: $t('zen.service.tenant.package'),
  },
  {
    align: 'center',
    field: 'contactName',
    minWidth: 100,
    title: $t('zen.service.tenant.contact'),
  },
  {
    align: 'center',
    field: 'contactMobile',
    minWidth: 120,
    title: $t('zen.service.tenant.contactPhone'),
  },
  {
    align: 'center',
    field: 'accountCount',
    formatter: ({ cellValue }) => formatToThousand(cellValue),
    minWidth: 150,
    sortable: true,
    title: $t('zen.service.tenant.accountLimit'),
  },
  {
    align: 'center',
    field: 'expireTime',
    formatter: ({ cellValue }) => formatToDateTime(cellValue),
    minWidth: 150,
    sortable: true,
    title: $t('zen.service.tenant.expireTime'),
  },
  {
    align: 'center',
    field: 'website',
    minWidth: 150,
    slots: { default: 'website' },
    title: $t('zen.service.tenant.website'),
  },
  {
    align: 'center',
    field: 'status',
    minWidth: 100,
    slots: { default: 'status' },
    title: $t('zen.service.tenant.status'),
  },
  {
    align: 'center',
    field: 'createTime',
    formatter: ({ cellValue }) => formatToDateTime(cellValue),
    minWidth: 150,
    title: $t('zen.service.tenant.createTime'),
  },
  {
    align: 'center',
    slots: { default: 'opt' },
    title: $t('zen.common.opt'),
    width: 200,
  },
]);

const tableOpts = reactive<VxeGridProps<TenantApi.Tenant>>({
  checkboxConfig: {
    highlight: true,
    range: true,
  },
  id: 'tenant_list',
  pagerConfig: {
    pageSize: 20,
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        if (!packageList) {
          await getPackageList();
        }
        return getTenantPageListApi({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
    response: {
      result: 'list',
      total: 'total',
    },
  },
  toolbarConfig: {
    refresh: true,
    slots: {
      buttons: 'toolbar_left',
    },
  },
});

function createActions(row: TenantApi.Tenant) {
  const actions: ActionItem[] = [
    {
      auth: 'system:tenant:update',
      icon: 'ep:edit',
      label: '编辑',
      type: 'primary',
    },
  ];

  if (row.packageId !== 0) {
    actions.push({
      auth: 'system:tenant:delete',
      disabled: row.packageId === 0,
      icon: 'ep:delete',
      label: '删除',
      popConfirm: {
        title: '确定要删除吗？',
      },
      type: 'danger',
    });
  }

  return actions;
}

function getPackageNameById(id: number) {
  if (id === 0) {
    return $t('zen.service.tenant.systemTenant');
  }

  return packageList.value.find((item) => item.id === id)?.name || '-';
}
</script>

<template>
  <VxeBasicTable ref="vxeBasicTableRef" :columns="columns" v-bind="tableOpts">
    <template #form>
      <ElForm>
        <ElRow :gutter="20">
          <ElCol :lg="6" :xl="4" :xs="24">
            <ElFormItem class="2xl:!mb-0" label="租户名称">
              <ElInput />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="6" :xl="4" :xs="24">
            <ElFormItem class="2xl:!mb-0" label="租户状态">
              <ElSelect>
                <ElOption
                  v-for="item in statusOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="+item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :lg="6" :xl="4" :xs="24">
            <ElFormItem class="2xl:!mb-0" label="联系人">
              <ElInput />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="6" :xl="4" :xs="24">
            <ElFormItem class="2xl:!mb-0" label="联系方式">
              <ElInput />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="8" :xl="5" :xs="24">
            <ElFormItem class="2xl:!mb-0" label="创建时间">
              <ElDatePicker type="daterange" />
            </ElFormItem>
          </ElCol>

          <ElCol :lg="6" :xl="3" :xs="24">
            <ElFormItem class="!mb-0">
              <ElButton type="primary">
                <Icon class="mr-1" icon="ep:search" />
                <span>搜索</span>
              </ElButton>

              <ElButton>
                <Icon class="mr-1" icon="ep:refresh" />
                <span>重置</span>
              </ElButton>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </template>

    <template #toolbar_left>
      <div>
        <ElButton
          :title="$t('zen.common.batchDelete')"
          circle
          type="danger"
          @click="vxeTable?.commitProxy('delete')"
        >
          <template #icon>
            <Icon icon="ep:delete" />
          </template>
        </ElButton>

        <ElButton
          :title="$t('zen.service.tenant.create')"
          circle
          type="primary"
        >
          <template #icon>
            <Icon icon="ep:plus" />
          </template>
        </ElButton>

        <ElButton :title="$t('zen.common.export')" circle type="warning">
          <template #icon>
            <Icon icon="ep:download" />
          </template>
        </ElButton>
      </div>
    </template>

    <template #package="{ row: { packageId } }">
      <ElTag :type="packageId === 0 ? 'danger' : 'primary'">
        {{ getPackageNameById(packageId) }}
      </ElTag>
    </template>

    <template #website="{ row: { website } }">
      <ElLink v-if="website" :href="website" target="_blank" type="primary">
        {{ website }}
      </ElLink>
      <span v-else>-</span>
    </template>

    <template #status="{ row: { status } }">
      <ElTag :type="dictStore.getStatus(status)?.color">
        {{ dictStore.getStatus(status)?.label }}
      </ElTag>
    </template>

    <template #opt="{ row }">
      <TableAction :actions="createActions(row)" />
    </template>
  </VxeBasicTable>
</template>
