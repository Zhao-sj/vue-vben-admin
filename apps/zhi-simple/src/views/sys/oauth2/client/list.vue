<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { OAuth2Api } from '#/api';
import type { ActionItem } from '#/components';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { useIsMobile } from '@vben/hooks';

import { useGridHelper, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeleteOAuth2ClientApi,
  deleteOAuth2ClientApi,
  getOAuth2ClientPageApi,
  updateOAuth2ClientStatusApi,
} from '#/api';
import { TableAction } from '#/components';
import { DictStatus } from '#/enums';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import { Form } from './modules';

const { isMobile } = useIsMobile();

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
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    id: 'oauth2_client_manage',
    proxyConfig: {
      ajax: {
        query: ({ page }, formValues) =>
          getOAuth2ClientPageApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          }),
      },
    },
  } as VxeTableGridOptions<OAuth2Api.Client>,
});

const { batchSelect, onSuccess } = useGridHelper<OAuth2Api.Client>(gridApi);

const toolbarActions: ActionItem[] = [
  {
    auth: 'system:oauth2-client:delete',
    icon: 'ep:delete',
    btnText: $t('page.delete'),
    onClick: () => {
      batchSelect({
        onBatchAction: (records) =>
          batchDeleteOAuth2ClientApi(records.map((item) => item.id)),
      });
    },
    type: 'danger',
  },
  {
    auth: 'system:oauth2-client:create',
    icon: 'ep:plus',
    btnText: $t('page.create'),
    onClick: () => {
      formDrawerApi.open();
    },
    type: 'primary',
  },
];

function onActionClick({ code, row }: OnActionClickParams<OAuth2Api.Client>) {
  switch (code) {
    case 'delete': {
      deleteOAuth2ClientApi(row.id).then(onSuccess);
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

async function onStatusChange(newStatus: number, row: OAuth2Api.Client) {
  const action =
    newStatus === DictStatus.ENABLE ? $t('page.enable') : $t('page.disable');

  const message = $t('page.actionConfirm.status', [
    action,
    row.name,
    $t('sys.oauth2.client.title'),
  ]);

  try {
    await ElMessageBox.confirm(message, $t('page.systemTip'), {
      closeOnClickModal: false,
      draggable: true,
      type: 'warning',
    });
    await updateOAuth2ClientStatusApi({ id: row.id, status: newStatus });
    onSuccess(false);
    return true;
  } catch {
    return false;
  }
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onSuccess" />

    <Grid :table-title="$t('sys.oauth2.client.list')">
      <template #toolbar-tools>
        <TableAction :actions="toolbarActions" />
      </template>

      <template #redirectUris="{ row: { redirectUris } }">
        <div
          v-if="redirectUris.length > 0"
          class="flex flex-wrap justify-center gap-1"
        >
          <ElLink
            v-for="uri in redirectUris"
            :key="uri"
            :href="uri"
            target="_blank"
            type="primary"
          >
            {{ uri }}
          </ElLink>
        </div>
        <div v-else>-</div>
      </template>
    </Grid>
  </Page>
</template>
