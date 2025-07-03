import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { TagApi } from '#/api';
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
      label: $t('cms.tag.name'),
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
      label: $t('cms.tag.status'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('cms.tag.name'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.STATUS),
      },
      fieldName: 'status',
      label: $t('cms.tag.status'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<TagApi.Tag>,
): VxeTableGridOptions<TagApi.Tag>['columns'] {
  return [
    {
      type: 'checkbox',
      width: 50,
      fixed: isMobile.value ? null : 'left',
    },
    {
      field: 'id',
      minWidth: 80,
      title: $t('cms.tag.id'),
    },
    {
      field: 'name',
      minWidth: 150,
      title: $t('cms.tag.name'),
    },
    {
      field: 'status',
      minWidth: 100,
      title: $t('cms.tag.status'),
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
      width: 180,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: TagApi.Tag) => {
            const actions: ActionItem[] = [
              {
                auth: 'cms:article-tag:update',
                icon: 'ep:edit',
                btnText: $t('page.edit'),
                onClick: () => {
                  onActionClick({ code: 'edit', row });
                },
                type: 'primary',
              },
              {
                auth: 'cms:article-tag:delete',
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
