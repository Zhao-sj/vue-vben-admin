import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { NoticeApi } from '#/api';
import type { ActionItem } from '#/components';

import { useIsMobile } from '@vben/hooks';

import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'title',
      formItemClass: 'col-span-2',
      label: $t('sys.message.notice.title'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: dictStore
          .getDictDataList(DictTypeEnum.NOTICE_TYPE)
          .map((item) => ({
            ...item,
            value: +item.value,
          })),
      },
      fieldName: 'type',
      label: $t('sys.message.notice.type'),
      rules: 'selectRequired',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        isButton: true,
        options: dictStore.getDictDataList(DictTypeEnum.STATUS).map((item) => ({
          ...item,
          value: +item.value,
        })),
      },
      defaultValue: 0,
      fieldName: 'status',
      label: $t('sys.message.notice.status'),
    },
    {
      component: 'Input',
      componentProps: {
        width: '100%',
        height: 600,
        options: {
          auto_focus: false,
          placeholder: $t('page.pleaseInput'),
        },
      },
      fieldName: 'content',
      formItemClass: 'col-span-2 flex-col items-start items-start [&>*]:w-full',
      label: $t('sys.message.notice.content'),
      labelClass: 'mb-2',
      rules: 'required',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('sys.message.notice.title'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.STATUS),
      },
      fieldName: 'status',
      label: $t('sys.message.notice.status'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<NoticeApi.Notice>,
): VxeTableGridOptions<NoticeApi.Notice>['columns'] {
  return [
    {
      type: 'checkbox',
      width: 50,
      fixed: isMobile.value ? null : 'left',
    },
    {
      field: 'id',
      minWidth: 80,
      title: $t('sys.message.notice.id'),
    },
    {
      field: 'title',
      minWidth: 200,
      title: $t('sys.message.notice.title'),
    },
    {
      field: 'type',
      minWidth: 100,
      title: $t('sys.message.notice.type'),
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.NOTICE_TYPE,
        },
      },
    },
    {
      field: 'status',
      minWidth: 100,
      title: $t('sys.message.notice.status'),
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.STATUS,
        },
      },
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
      width: 240,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: NoticeApi.Notice) => {
            const actions: ActionItem[] = [
              {
                auth: 'system:dict:update',
                icon: 'ep:edit',
                btnText: $t('page.edit'),
                onClick: () => {
                  onActionClick({ code: 'edit', row });
                },
                type: 'primary',
              },
              {
                auth: 'system:dict:delete',
                icon: 'ep:delete',
                btnText: $t('page.delete'),
                popConfirm: {
                  on: {
                    confirm: () => {
                      onActionClick({ code: 'delete', row });
                    },
                  },
                  title: $t('page.confirmDelete'),
                },
                type: 'danger',
              },
              {
                auth: 'system:notice:push',
                icon: 'ion:push-outline',
                btnText: $t('sys.message.notice.push.title'),
                popConfirm: {
                  on: {
                    confirm: () => {
                      onActionClick({ code: 'push', row });
                    },
                  },
                  title: $t('sys.message.notice.push.tip'),
                },
                type: 'warning',
              },
            ];

            return { actions };
          },
        },
      },
    },
  ];
}
