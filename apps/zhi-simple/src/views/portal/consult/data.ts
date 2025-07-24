import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ZDPortalApi } from '#/api';

import { useIsMobile } from '@vben/hooks';

import { useGridActions } from '#/adapter/vxe-table';
import { DictConsultAccept, DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'company',
      label: $t('portal.consult.company'),
    },
    {
      component: 'Input',
      fieldName: 'mobile',
      label: $t('portal.consult.mobile'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () =>
          dictStore.loadDictData(DictTypeEnum.PORTAL_CONSULT_PROCESS_STATUS),
      },
      fieldName: 'processStatus',
      label: $t('portal.consult.status'),
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
      label: $t('portal.consult.createTime'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<ZDPortalApi.Consult>,
): VxeTableGridOptions<ZDPortalApi.Consult>['columns'] {
  return [
    {
      type: 'checkbox',
      width: 50,
      fixed: isMobile.value ? null : 'left',
    },
    {
      field: 'id',
      minWidth: 80,
      title: $t('portal.consult.id'),
    },
    {
      field: 'company',
      minWidth: 150,
      title: $t('portal.consult.company'),
      showOverflow: true,
    },
    {
      field: 'name',
      minWidth: 80,
      title: $t('portal.consult.name'),
    },
    {
      field: 'mobile',
      minWidth: 150,
      title: $t('portal.consult.mobile'),
    },
    {
      field: 'email',
      minWidth: 150,
      title: $t('portal.consult.email'),
    },
    {
      field: 'content',
      minWidth: 250,
      title: $t('portal.consult.content'),
      showOverflow: true,
    },
    {
      field: 'createTime',
      minWidth: 150,
      title: $t('portal.consult.createTime'),
      formatter: 'formatDateTime',
    },
    {
      field: 'processStatus',
      minWidth: 100,
      title: $t('portal.consult.status'),
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.PORTAL_CONSULT_PROCESS_STATUS,
        },
      },
    },
    {
      field: 'operate',
      title: $t('page.options'),
      width: 180,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: ZDPortalApi.Consult) => {
            return useGridActions(row, onActionClick)
              .addIf(
                row.processStatus === DictConsultAccept.UN_ACCEPT,
                (builder) => {
                  builder
                    .addAction({
                      auth: 'portal:consult:update-status',
                      icon: 'ep:circle-check',
                      btnText: $t('portal.consult.processed'),
                      popConfirm: {
                        on: {
                          confirm: () => {
                            onActionClick({ code: 'accept', row });
                          },
                        },
                        title: $t('portal.consult.processTip'),
                      },
                      type: 'success',
                    })
                    .addAction({
                      auth: 'portal:consult:update-status',
                      icon: 'ep:circle-close',
                      btnText: $t('portal.consult.ignored'),
                      popConfirm: {
                        on: {
                          confirm: () => {
                            onActionClick({ code: 'ignore', row });
                          },
                        },
                        title: $t('portal.consult.ignoreTip'),
                      },
                      type: 'danger',
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
