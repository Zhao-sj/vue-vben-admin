import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DictApi } from '#/api';
import type { ActionItem } from '#/components';

import { useIsMobile } from '@vben/hooks';

import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();

export function useFormSchema(isEdit = false): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.dict.type.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: isEdit,
      },
      fieldName: 'type',
      label: $t('sys.dict.type.title'),
      rules: 'required',
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
      label: $t('sys.dict.status'),
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
      fieldName: 'remark',
      label: $t('page.remark'),
      labelClass: 'self-start h-8',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.dict.type.name'),
    },
    {
      component: 'Input',
      fieldName: 'type',
      label: $t('sys.dict.type.title'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.STATUS),
      },
      fieldName: 'status',
      label: $t('sys.dict.status'),
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
      label: $t('page.createTime'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<DictApi.Type>,
): VxeTableGridOptions<DictApi.Type>['columns'] {
  return [
    {
      type: 'checkbox',
      width: 50,
      fixed: isMobile.value ? null : 'left',
    },
    {
      field: 'id',
      minWidth: 80,
      title: $t('sys.dict.id'),
    },
    {
      field: 'name',
      minWidth: 150,
      title: $t('sys.dict.type.name'),
    },
    {
      field: 'type',
      minWidth: 200,
      title: $t('sys.dict.type.title'),
      slots: { default: 'type' },
    },
    {
      field: 'status',
      minWidth: 100,
      title: $t('sys.dict.status'),
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.STATUS,
        },
      },
    },
    {
      field: 'remark',
      minWidth: 200,
      title: $t('page.remark'),
      formatter: 'formatBlank',
    },
    {
      field: 'createTime',
      minWidth: 150,
      title: $t('page.createTime'),
      formatter: 'formatDateTime',
    },
    {
      field: 'opt',
      title: $t('page.options'),
      width: 180,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: DictApi.Type) => {
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
            ];

            return { actions };
          },
        },
      },
    },
  ];
}
