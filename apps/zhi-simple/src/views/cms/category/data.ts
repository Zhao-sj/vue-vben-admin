import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CategoryApi } from '#/api';

import { useAccess } from '@vben/access';
import { useIsMobile } from '@vben/hooks';

import { useGridActions } from '#/adapter/vxe-table';
import { buildMenuTree, getCmsCategorySimpleApi } from '#/api';
import { DictStatus, DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const { isMobile } = useIsMobile();
const { hasAccessByCodes } = useAccess();
const dictStore = useDictStore();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'ApiTreeSelect',
      componentProps: {
        api: getCmsCategorySimpleApi,
        afterFetch: (data: CategoryApi.Simple[]) => {
          data.push({ parentId: -1, id: 0, name: $t('cms.category.top') });
          return buildMenuTree(data);
        },
        defaultExpandAll: true,
        checkStrictly: true,
        childrenField: 'children',
        labelField: 'name',
        valueField: 'id',
      },
      fieldName: 'parentId',
      label: $t('cms.category.parent'),
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('cms.category.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('cms.category.code'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: '!w-full [&_input]:!text-left',
        controlsPosition: 'right',
        min: 0,
      },
      fieldName: 'sort',
      label: $t('cms.category.sort'),
      rules: 'required',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('cms.category.name'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.STATUS),
      },
      fieldName: 'status',
      label: $t('cms.category.status'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<CategoryApi.Category>,
  onStatusChange?: (
    newStatus: number,
    row: CategoryApi.Category,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions<CategoryApi.Category>['columns'] {
  return [
    {
      field: 'name',
      headerAlign: 'center',
      align: 'left',
      minWidth: 200,
      title: $t('cms.category.name'),
      treeNode: true,
    },
    {
      field: 'code',
      minWidth: 150,
      title: $t('cms.category.code'),
    },
    {
      field: 'sort',
      minWidth: 150,
      title: $t('cms.category.sort'),
    },
    {
      field: 'status',
      minWidth: 100,
      title: $t('cms.category.status'),
      cellRender: {
        name: 'CellSwitch',
        props: { disabled: !hasAccessByCodes(['cms:article-category:update']) },
        attrs: { beforeChange: onStatusChange },
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
          createActions: (row: CategoryApi.Category) => {
            return useGridActions(row, onActionClick)
              .addIf(row.status === DictStatus.ENABLE, (builder) => {
                builder.addAction({
                  auth: 'cms:article-category:create',
                  icon: 'ep:plus',
                  btnText: $t('page.actionTitle.create', [$t('page.sub')]),
                  onClick: () => {
                    onActionClick({ code: 'append', row });
                  },
                  type: 'primary',
                });
              })
              .addEdit('cms:article-category:update')
              .addDelete('cms:article-category:delete')
              .build();
          },
        },
      },
    },
  ];
}
