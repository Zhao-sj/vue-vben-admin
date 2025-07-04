import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DeptApi, UserApi } from '#/api';

import { useIsMobile } from '@vben/hooks';

import { useGridActions } from '#/adapter/vxe-table';
import {
  buildMenuTree,
  getDeptSimpleListApi,
  getUserSimpleListApi,
} from '#/api';
import { DictStatus, DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'ApiTreeSelect',
      componentProps: {
        api: getDeptSimpleListApi,
        afterFetch: (data: DeptApi.Simple[]) => {
          data.push({ parentId: -1, id: 0, name: $t('sys.dept.top') });
          return buildMenuTree(data);
        },
        defaultExpandAll: true,
        checkStrictly: true,
        childrenField: 'children',
        labelField: 'name',
        valueField: 'id',
      },
      fieldName: 'parentId',
      formItemClass: 'col-span-2',
      label: $t('sys.dept.parent'),
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.dept.name'),
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
      label: $t('sys.dept.sort'),
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getUserSimpleListApi,
        afterFetch: (data: UserApi.Simple[]) => {
          return data?.map((item) => ({
            label: item.nickname || item.id,
            value: item.id,
          }));
        },
      },
      fieldName: 'leaderId',
      label: $t('sys.dept.leader'),
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: $t('sys.dept.phone'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('sys.dept.email'),
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
      label: $t('sys.dept.status'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.dept.name'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.STATUS),
      },
      fieldName: 'status',
      label: $t('sys.dept.status'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<DeptApi.Dept>,
): VxeTableGridOptions<DeptApi.Dept>['columns'] {
  return [
    {
      field: 'name',
      headerAlign: 'center',
      align: 'left',
      minWidth: 200,
      title: $t('sys.dept.name'),
      treeNode: true,
    },
    {
      field: 'leaderId',
      minWidth: 150,
      title: $t('sys.dept.leader'),
      // TODO formatter: ({ cellValue }) => getUserName(cellValue),
    },
    {
      field: 'phone',
      minWidth: 150,
      title: $t('sys.dept.phone'),
      formatter: 'formatBlank',
    },
    {
      field: 'email',
      minWidth: 150,
      title: $t('sys.dept.email'),
      formatter: 'formatBlank',
    },
    {
      field: 'sort',
      minWidth: 80,
      title: $t('sys.dept.sort'),
    },
    {
      field: 'status',
      minWidth: 100,
      title: $t('sys.dept.status'),
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
          createActions: (row: DeptApi.Dept) => {
            return useGridActions(row, onActionClick)
              .addIf(row.status === DictStatus.ENABLE, (builder) => {
                builder.addAction({
                  auth: 'system:dept:create',
                  icon: 'ep:plus',
                  btnText: $t('page.actionTitle.create', [$t('page.sub')]),
                  onClick: () => {
                    onActionClick({ code: 'append', row });
                  },
                  type: 'primary',
                });
              })
              .addEdit('system:dept:update')
              .addDelete('system:dept:delete')
              .build();
          },
        },
      },
    },
  ];
}
