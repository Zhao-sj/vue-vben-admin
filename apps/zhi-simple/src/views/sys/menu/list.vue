<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { MenuApi } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';

import { MenuBadge } from '@vben-core/menu-ui';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteMenuApi, getMenuListApi } from '#/api';
import { TableAction } from '#/components';
import { DictTypeEnum, MenuType } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

import { useColumns, useGridFormSchema } from './data';
import { Form } from './modules';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.MENU_TYPE);

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
    showCollapseButton: isMobile.value,
    wrapperClass: 'grid-cols-1 lg:grid-cols-4 2xl:grid-cols-6',
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    id: 'menu_manage',
    keyboardConfig: {
      isArrow: true,
      isBack: true,
      isEnter: true,
    },
    scrollY: {
      enabled: true,
      gt: 0,
    },
    proxyConfig: {
      ajax: {
        query: async (_, formValues) => {
          const list = await getMenuListApi(formValues);
          return { list };
        },
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
  } as VxeTableGridOptions,
});

const { onTreeExpandAll, onSuccess } = useGridHelper(gridApi);

const toolbarActions = computed<ActionItem[]>(() => [
  {
    auth: 'system:menu:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => {
      formDrawerApi.open();
    },
    type: 'primary',
  },
]);

function onActionClick({ code, row }: OnActionClickParams<MenuApi.Menu>) {
  switch (code) {
    case 'append': {
      formDrawerApi.setData({ parentId: row.id });
      formDrawerApi.open();
      break;
    }
    case 'delete': {
      deleteMenuApi(row.id).then(onSuccess);
      break;
    }
    case 'edit': {
      formDrawerApi.setData({ id: row.id });
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

    <Grid :table-title="$t('sys.menu.list')">
      <template #toolbar-tools>
        <div class="flex items-center gap-3">
          <ElButton @click="onTreeExpandAll(false)">
            {{ $t('page.collapsed') }}
          </ElButton>
          <ElButton class="!ml-0" @click="onTreeExpandAll(true)">
            {{ $t('page.expand') }}
          </ElButton>

          <TableAction :actions="toolbarActions" />
        </div>
      </template>

      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 flex-shrink-0">
            <IconifyIcon
              v-if="row.type === MenuType.BUTTON"
              icon="carbon:security"
              class="size-full"
            />
            <IconifyIcon
              v-else-if="row.meta?.icon"
              :icon="row.meta?.icon || 'carbon:circle-dash'"
              class="size-full"
            />
          </div>
          <span class="flex-auto">
            {{ row.meta?.title ? $t(row.meta.title) : row.name }}
          </span>
        </div>
        <MenuBadge
          v-if="row.meta?.badgeType"
          class="menu-badge"
          :badge="row.meta.badge"
          :badge-type="row.meta.badgeType"
          :badge-variants="row.meta.badgeVariants"
        />
      </template>
    </Grid>
  </Page>
</template>

<style lang="scss" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  & > :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>
