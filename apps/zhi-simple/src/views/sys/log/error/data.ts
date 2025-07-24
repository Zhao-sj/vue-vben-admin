import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { LogApi } from '#/api';

import { useAccess } from '@vben/access';
import { useIsMobile } from '@vben/hooks';

import { useGridActions } from '#/adapter/vxe-table';
import { getTenantSimpleListApi } from '#/api';
import { DictLogProcess, DictTypeEnum } from '#/enums';
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
      label: $t('sys.log.error.tenant'),
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
      component: 'Input',
      fieldName: 'requestUrl',
      label: $t('sys.log.requestUrl'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () =>
          dictStore.loadDictData(DictTypeEnum.ERROR_LOG_PROCESS_STATUS),
      },
      fieldName: 'processStatus',
      label: $t('sys.log.error.status'),
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
      fieldName: 'exTime',
      label: $t('sys.log.error.exTime'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<LogApi.Error>,
): VxeTableGridOptions<LogApi.Error>['columns'] {
  return [
    {
      type: 'checkbox',
      width: 50,
      fixed: isMobile.value ? null : 'left',
    },
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
      minWidth: 100,
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
      align: 'left',
      headerAlign: 'center',
      minWidth: 250,
      title: $t('sys.log.requestUrl'),
      showOverflow: true,
    },
    {
      field: 'exTime',
      minWidth: 150,
      title: $t('sys.log.error.exTime'),
      formatter: 'formatDateTime',
    },
    {
      field: 'exName',
      minWidth: 300,
      title: $t('sys.log.error.exName'),
      showOverflow: true,
    },
    {
      field: 'processStatus',
      minWidth: 100,
      title: $t('sys.log.error.status'),
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.ERROR_LOG_PROCESS_STATUS,
        },
      },
    },
    {
      field: 'opt',
      title: $t('page.options'),
      width: 240,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: LogApi.Error) => {
            return useGridActions(row, onActionClick)
              .addAction({
                icon: 'ep:view',
                btnText: $t('page.detail'),
                type: 'primary',
                onClick: () => {
                  onActionClick({ code: 'detail', row });
                },
              })
              .addIf(
                row.processStatus === DictLogProcess.UN_PROCESS,
                (builder) => {
                  builder
                    .addAction({
                      auth: 'system:error-log:update-status',
                      icon: 'ep:circle-check',
                      btnText: $t('sys.log.error.processed'),
                      type: 'success',
                      popConfirm: {
                        on: {
                          confirm: () => {
                            onActionClick({ code: 'process', row });
                          },
                        },
                        title: $t('sys.log.error.processTip'),
                      },
                    })
                    .addAction({
                      auth: 'system:error-log:update-status',
                      icon: 'ep:circle-close',
                      btnText: $t('sys.log.error.ignored'),
                      type: 'danger',
                      popConfirm: {
                        on: {
                          confirm: () => {
                            onActionClick({ code: 'ignore', row });
                          },
                        },
                        title: $t('sys.log.error.ignoreTip'),
                      },
                    });
                },
              )
              .build();
          },
        },
      },
    },
  ];
}
