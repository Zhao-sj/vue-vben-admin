import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { LogApi } from '#/api';
import type { ActionItem } from '#/components';

import { useAccess } from '@vben/access';
import { useIsMobile } from '@vben/hooks';

import { isNumber } from 'lodash-es';

import { getTenantSimpleListApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const { isMobile } = useIsMobile();
const { hasAccessByRoles } = useAccess();
const dictStore = useDictStore();

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'appName',
      label: $t('sys.log.appName'),
      dependencies: {
        triggerFields: ['appName'],
        if: () => false,
      },
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.USER_TYPE),
      },
      fieldName: 'userType',
      label: $t('sys.log.userType'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getTenantSimpleListApi,
        labelField: 'name',
        valueField: 'id',
      },
      fieldName: 'tenantId',
      label: $t('sys.log.access.tenant'),
      dependencies: {
        if: () => hasAccessByRoles(['super_admin']),
        triggerFields: ['tenantId'],
      },
    },
    {
      component: 'Input',
      fieldName: 'userId',
      label: $t('sys.log.userId'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: '!w-full',
        controlsPosition: 'right',
        min: 1,
      },
      fieldName: 'duration',
      label: $t('sys.log.access.duration'),
    },
    {
      component: 'Input',
      fieldName: 'requestUrl',
      label: $t('sys.log.requestUrl'),
    },
    {
      component: 'Input',
      fieldName: 'resultCode',
      label: $t('sys.log.access.resultCode'),
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
      fieldName: 'beginTime',
      label: $t('sys.log.access.createTime'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<LogApi.Access>,
): VxeTableGridOptions<LogApi.Access>['columns'] {
  return [
    {
      field: 'id',
      minWidth: 80,
      title: $t('sys.log.id'),
    },
    {
      field: 'userId',
      minWidth: 80,
      title: $t('sys.log.userId'),
    },
    {
      field: 'userType',
      minWidth: 80,
      title: $t('sys.log.userType'),
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.USER_TYPE,
        },
      },
    },
    {
      field: 'appName',
      minWidth: 150,
      title: $t('sys.log.appName'),
      visible: false,
    },
    {
      field: 'requestMethod',
      minWidth: 80,
      title: $t('sys.log.requestMethod'),
    },
    {
      field: 'requestUrl',
      headerAlign: 'center',
      align: 'left',
      minWidth: 250,
      title: $t('sys.log.requestUrl'),
      showOverflow: true,
    },
    {
      field: 'beginTime',
      formatter: 'formatDateTime',
      minWidth: 150,
      title: $t('sys.log.access.createTime'),
    },
    {
      field: 'duration',
      minWidth: 80,
      title: $t('sys.log.access.duration'),
      formatter: ({ cellValue }) =>
        isNumber(cellValue) ? `${cellValue}ms` : cellValue,
    },
    {
      field: 'resultCode',
      minWidth: 100,
      title: $t('sys.log.access.resultCode'),
      visible: false,
    },
    {
      field: 'resultMsg',
      minWidth: 150,
      title: $t('sys.log.access.resultMsg'),
      formatter: 'formatBlank',
      showOverflow: true,
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
      title: $t('sys.log.ua'),
      slots: { default: 'ua' },
      visible: false,
    },
    {
      field: 'opt',
      title: $t('page.options'),
      width: 120,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: LogApi.Access) => {
            const actions: ActionItem[] = [
              {
                icon: 'ep:view',
                btnText: $t('page.detail'),
                onClick: () => {
                  onActionClick({ code: 'detail', row });
                },
                type: 'primary',
              },
            ];

            return { actions };
          },
        },
      },
    },
  ];
}
