import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { LogApi } from '#/api';

import { useAccess } from '@vben/access';

import { getTenantSimpleListApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';

const { hasAccessByRoles } = useAccess();

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: $t('sys.log.login.success'), value: true },
          { label: $t('sys.log.login.fail'), value: false },
        ],
      },
      fieldName: 'status',
      label: $t('sys.log.login.result'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getTenantSimpleListApi,
        labelField: 'name',
        valueField: 'id',
      },
      fieldName: 'tenantId',
      label: $t('sys.log.login.tenant'),
      dependencies: {
        if: () => hasAccessByRoles(['super_admin']),
        triggerFields: ['tenantId'],
      },
    },
    {
      component: 'Input',
      fieldName: 'ip',
      label: $t('sys.log.ip'),
    },
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('sys.log.login.username'),
    },
    {
      component: 'DatePicker',
      componentProps: {
        placeholder: $t('page.date.placeholder.between'),
        range: true,
        multiCalendars: {
          solo: true,
        },
      },
      fieldName: 'createTime',
      label: $t('sys.log.login.createTime'),
    },
  ];
}

export function useColumns(): VxeTableGridOptions<LogApi.Login>['columns'] {
  return [
    {
      field: 'id',
      minWidth: 80,
      title: $t('sys.log.id'),
    },
    {
      field: 'type',
      minWidth: 150,
      title: $t('sys.log.login.type'),
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.LOGIN_TYPE,
        },
      },
    },
    {
      field: 'username',
      minWidth: 150,
      title: $t('sys.log.login.username'),
    },
    {
      field: 'ip',
      minWidth: 150,
      title: $t('sys.log.ip'),
    },
    {
      field: 'location',
      minWidth: 150,
      title: $t('sys.log.location'),
    },
    {
      field: 'ua',
      minWidth: 300,
      slots: { default: 'ua' },
      title: $t('sys.log.ua'),
    },
    {
      field: 'result',
      minWidth: 100,
      title: $t('sys.log.login.result'),
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.LOGIN_RESULT,
        },
      },
    },
    {
      field: 'createTime',
      formatter: 'formatDateTime',
      minWidth: 150,
      title: $t('sys.log.login.createTime'),
    },
  ];
}
