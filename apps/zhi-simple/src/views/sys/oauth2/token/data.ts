import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { OAuth2Api } from '#/api';

import { useIsMobile } from '@vben/hooks';

import { useGridActions } from '#/adapter/vxe-table';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'clientId',
      label: $t('sys.oauth2.token.clientId'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.USER_TYPE),
      },
      fieldName: 'userType',
      label: $t('sys.oauth2.token.userType'),
    },
    {
      component: 'Input',
      fieldName: 'userId',
      label: $t('sys.oauth2.token.userId'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<OAuth2Api.AccessToken>,
): VxeTableGridOptions<OAuth2Api.AccessToken>['columns'] {
  return [
    {
      field: 'id',
      minWidth: 80,
      title: $t('sys.oauth2.token.id'),
    },
    {
      field: 'clientId',
      minWidth: 150,
      title: $t('sys.oauth2.token.clientId'),
      visible: false,
    },
    {
      field: 'userId',
      minWidth: 80,
      title: $t('sys.oauth2.token.userId'),
      slots: { default: 'userId' },
    },
    {
      field: 'userType',
      minWidth: 80,
      title: $t('sys.oauth2.token.userType'),
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.USER_TYPE,
        },
      },
    },
    {
      field: 'accessToken',
      minWidth: 250,
      title: $t('sys.oauth2.token.accessToken'),
    },
    {
      field: 'refreshToken',
      minWidth: 250,
      title: $t('sys.oauth2.token.refreshToken'),
    },
    {
      field: 'createTime',
      minWidth: 150,
      title: $t('sys.oauth2.token.createTime'),
      formatter: 'formatDateTime',
    },
    {
      field: 'expiresTime',
      minWidth: 150,
      title: $t('sys.oauth2.token.expiresTime'),
      formatter: 'formatDateTime',
    },
    {
      field: 'operate',
      title: $t('page.options'),
      width: 120,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: OAuth2Api.AccessToken) => {
            return useGridActions(row, onActionClick)
              .addAction({
                auth: 'system:oauth2-token:delete',
                icon: 'lucide:log-out',
                btnText: $t('sys.oauth2.token.kickout'),
                type: 'primary',
                popConfirm: {
                  title: $t('sys.oauth2.token.kickoutTip', [row.userId]),
                  width: 240,
                  on: {
                    confirm: () => {
                      onActionClick({ code: 'kickout', row });
                    },
                  },
                },
              })
              .build();
          },
        },
      },
    },
  ];
}
