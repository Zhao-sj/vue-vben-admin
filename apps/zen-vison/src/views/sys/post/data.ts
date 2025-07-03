import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { PostApi } from '#/api';
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
      fieldName: 'name',
      label: $t('sys.post.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('sys.post.code'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: '!w-full',
        controlsPosition: 'right',
        min: 0,
      },
      fieldName: 'sort',
      label: $t('sys.post.sort'),
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
      label: $t('sys.post.status'),
    },
    {
      component: 'Input',
      componentProps: {
        autosize: { maxRows: 5, minRows: 3 },
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
      fieldName: 'code',
      label: $t('sys.post.code'),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.post.name'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.STATUS),
      },
      fieldName: 'status',
      label: $t('sys.post.status'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<PostApi.Post>,
): VxeTableGridOptions<PostApi.Post>['columns'] {
  return [
    {
      type: 'checkbox',
      width: 50,
      fixed: isMobile.value ? null : 'left',
    },
    {
      field: 'id',
      minWidth: 80,
      title: $t('sys.post.id'),
    },
    {
      field: 'code',
      minWidth: 150,
      title: $t('sys.post.code'),
    },
    {
      field: 'name',
      minWidth: 150,
      title: $t('sys.post.name'),
    },
    {
      field: 'sort',
      minWidth: 80,
      title: $t('sys.post.sort'),
    },
    {
      field: 'status',
      minWidth: 100,
      title: $t('sys.post.status'),
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
          createActions: (row: PostApi.Post) => {
            const actions: ActionItem[] = [
              {
                auth: 'system:post:update',
                icon: 'ep:edit',
                btnText: $t('page.edit'),
                onClick: () => {
                  onActionClick({ code: 'edit', row });
                },
                type: 'primary',
              },
              {
                auth: 'system:post:delete',
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
