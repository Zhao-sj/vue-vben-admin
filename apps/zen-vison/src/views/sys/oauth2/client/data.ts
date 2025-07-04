import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { OAuth2Api } from '#/api';

import { useAccess } from '@vben/access';
import { useIsMobile } from '@vben/hooks';

import { useGridActions } from '#/adapter/vxe-table';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const { isMobile } = useIsMobile();
const { hasAccessByCodes } = useAccess();
const dictStore = useDictStore();

const scopes = ['user.read', 'user.write'].map((item) => ({
  label: item,
  value: item,
}));

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'logo',
      label: $t('sys.oauth2.client.logo'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.oauth2.client.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'clientId',
      label: $t('sys.oauth2.client.clientId'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        showPassword: true,
      },
      fieldName: 'secret',
      label: $t('sys.oauth2.client.secret'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'accessTokenValiditySeconds',
      componentProps: {
        class: '!w-full [&_input]:!text-left',
        controlsPosition: 'right',
        min: 1,
      },
      renderComponentContent: () => ({
        suffix: () => 'ms',
      }),
      label: $t('sys.oauth2.client.accessTokenValiditySeconds'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'refreshTokenValiditySeconds',
      componentProps: {
        class: '!w-full [&_input]:!text-left',
        controlsPosition: 'right',
        min: 1,
      },
      renderComponentContent: () => ({
        suffix: () => 'ms',
      }),
      label: $t('sys.oauth2.client.refreshTokenValiditySeconds'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        autosize: {
          maxRows: 5,
          minRows: 3,
        },
        resize: 'none',
        type: 'textarea',
      },
      fieldName: 'description',
      formItemClass: 'lg:col-span-2',
      label: $t('sys.oauth2.client.description'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.OAUTH2_GRANT_TYPE),
        multiple: true,
      },
      fieldName: 'authorizedGrantTypes',
      formItemClass: 'lg:col-span-2',
      label: $t('sys.oauth2.client.authorizedGrantTypes'),
      rules: 'selectRequired',
    },
    {
      component: 'Select',
      componentProps: {
        multiple: true,
        options: scopes,
      },
      fieldName: 'scopes',
      formItemClass: 'lg:col-span-2',
      label: $t('sys.oauth2.client.scopes'),
    },
    {
      component: 'Select',
      componentProps: {
        multiple: true,
        options: scopes,
      },
      fieldName: 'autoApproveScopes',
      formItemClass: 'lg:col-span-2',
      label: $t('sys.oauth2.client.autoApproveScopes'),
    },
    {
      component: 'Select',
      componentProps: {
        allowCreate: true,
        reserveKeyword: false,
        clearable: true,
        filterable: true,
        multiple: true,
        options: [],
        placeholder: $t('page.pleaseInput'),
      },
      fieldName: 'redirectUris',
      formItemClass: 'lg:col-span-2',
      label: $t('sys.oauth2.client.redirectUris'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        multiple: true,
        options: scopes,
      },
      fieldName: 'authorities',
      formItemClass: 'lg:col-span-2',
      label: $t('sys.oauth2.client.authorities'),
    },
    {
      component: 'Select',
      componentProps: {
        allowCreate: true,
        reserveKeyword: false,
        clearable: true,
        filterable: true,
        multiple: true,
        options: [],
        placeholder: $t('page.pleaseInput'),
      },
      fieldName: 'resourceIds',
      formItemClass: 'lg:col-span-2',
      label: $t('sys.oauth2.client.resourceIds'),
    },
    {
      component: 'Input',
      componentProps: {
        autosize: {
          maxRows: 5,
          minRows: 3,
        },
        placeholder: $t('page.pleaseInput', [
          $t('sys.oauth2.client.jsonFormatter'),
        ]),
        resize: 'none',
        type: 'textarea',
      },
      fieldName: 'additionalInformation',
      formItemClass: 'lg:col-span-2',
      label: $t('sys.oauth2.client.additionalInformation'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.oauth2.client.name'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.STATUS),
      },
      fieldName: 'status',
      label: $t('sys.oauth2.client.status'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<OAuth2Api.Client>,
  onStatusChange?: (
    newStatus: number,
    row: OAuth2Api.Client,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions<OAuth2Api.Client>['columns'] {
  return [
    {
      type: 'checkbox',
      width: 50,
      fixed: isMobile.value ? null : 'left',
    },
    {
      field: 'id',
      minWidth: 80,
      title: $t('sys.oauth2.client.id'),
      visible: false,
    },
    {
      field: 'logo',
      minWidth: 100,
      title: $t('sys.oauth2.client.logo'),
      cellRender: {
        name: 'CellAvatar',
        props: { shape: 'square' },
        attrs: { class: '!rounded-none !bg-transparent' },
      },
    },
    {
      field: 'name',
      minWidth: 150,
      title: $t('sys.oauth2.client.name'),
    },
    {
      field: 'clientId',
      minWidth: 150,
      title: $t('sys.oauth2.client.clientId'),
    },
    {
      field: 'secret',
      minWidth: 150,
      title: $t('sys.oauth2.client.secret'),
      showOverflow: true,
    },
    {
      field: 'accessTokenValiditySeconds',
      minWidth: 150,
      title: $t('sys.oauth2.client.accessTokenValiditySeconds'),
      formatter: 'formatSeconds',
    },
    {
      field: 'refreshTokenValiditySeconds',
      minWidth: 150,
      title: $t('sys.oauth2.client.refreshTokenValiditySeconds'),
      formatter: 'formatSeconds',
    },
    {
      field: 'status',
      minWidth: 100,
      title: $t('sys.oauth2.client.status'),
      cellRender: {
        name: 'CellSwitch',
        props: { disabled: !hasAccessByCodes(['system:oauth2-client:update']) },
        attrs: { beforeChange: onStatusChange },
      },
    },
    {
      field: 'authorizedGrantTypes',
      minWidth: 240,
      title: $t('sys.oauth2.client.authorizedGrantTypes'),
      cellRender: { name: 'CellTags' },
    },
    {
      field: 'scopes',
      minWidth: 240,
      title: $t('sys.oauth2.client.scopes'),
      cellRender: { name: 'CellTags' },
      visible: false,
    },
    {
      field: 'autoApproveScopes',
      minWidth: 240,
      title: $t('sys.oauth2.client.autoApproveScopes'),
      cellRender: { name: 'CellTags' },
      visible: false,
    },
    {
      field: 'redirectUris',
      minWidth: 240,
      title: $t('sys.oauth2.client.redirectUris'),
      slots: { default: 'redirectUris' },
      visible: false,
    },
    {
      field: 'authorities',
      minWidth: 240,
      title: $t('sys.oauth2.client.authorities'),
      cellRender: { name: 'CellTags' },
      visible: false,
    },
    {
      field: 'resourceIds',
      minWidth: 240,
      title: $t('sys.oauth2.client.resourceIds'),
      cellRender: { name: 'CellTags' },
      visible: false,
    },
    {
      field: 'description',
      minWidth: 200,
      title: $t('sys.oauth2.client.description'),
      formatter: 'formatBlank',
      visible: false,
    },
    {
      field: 'createTime',
      minWidth: 150,
      title: $t('page.createTime'),
      formatter: 'formatDateTime',
    },
    {
      field: 'operate',
      title: $t('page.options'),
      width: 180,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: OAuth2Api.Client) => {
            return useGridActions(row, onActionClick)
              .addEdit('system:oauth2-client:update')
              .addDelete('system:oauth2-client:delete')
              .build();
          },
        },
      },
    },
  ];
}
