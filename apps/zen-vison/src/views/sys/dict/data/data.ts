import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DictApi } from '#/api';
import type { ActionItem } from '#/components';

import { useIsMobile } from '@vben/hooks';

import { getDictTypeSimpleListApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'type',
      label: $t('sys.dict.type.title'),
    },
    {
      component: 'Input',
      fieldName: 'label',
      label: $t('sys.dict.data.label'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'value',
      label: $t('sys.dict.data.value'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: ['primary', 'success', 'info', 'warning', 'danger'].map(
          (item) => ({ label: item, value: item }),
        ),
      },
      fieldName: 'color',
      label: $t('sys.dict.data.color'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: '!w-full',
        controlsPosition: 'right',
        min: 0,
      },
      fieldName: 'sort',
      label: $t('sys.dict.data.sort'),
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

export function useGridFormSchema(
  onChangeDictType?: (value: number) => void,
): VbenFormSchema[] {
  return [
    {
      component: 'ApiSelect',
      componentProps: {
        api: getDictTypeSimpleListApi,
        labelField: 'name',
        valueField: 'id',
        clearable: false,
        onChange: onChangeDictType,
      },
      fieldName: 'dictTypeId',
      label: $t('sys.dict.type.title'),
    },
    {
      component: 'Input',
      fieldName: 'label',
      label: $t('sys.dict.data.label'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.STATUS),
      },
      fieldName: 'status',
      label: $t('sys.dict.status'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<DictApi.Data>,
): VxeTableGridOptions<DictApi.Data>['columns'] {
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
      field: 'label',
      minWidth: 150,
      title: $t('sys.dict.data.label'),
    },
    {
      field: 'value',
      minWidth: 150,
      title: $t('sys.dict.data.value'),
    },
    {
      field: 'sort',
      minWidth: 80,
      title: $t('sys.dict.data.sort'),
    },
    {
      field: 'color',
      minWidth: 100,
      title: $t('sys.dict.data.color'),
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
      field: 'operate',
      title: $t('page.options'),
      width: 180,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: DictApi.Data) => {
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
