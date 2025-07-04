import type { VbenFormSchema } from '@vben/common-ui';

import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { TenantApi } from '#/api';

import { useAccess } from '@vben/access';
import { useIsMobile } from '@vben/hooks';

import { useGridActions } from '#/adapter/vxe-table';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const { isMobile } = useIsMobile();
const { hasAccessByCodes } = useAccess();
const dictStore = useDictStore();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.tenant.package.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'menuIds',
      label: $t('sys.tenant.package.menu'),
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
      label: $t('sys.tenant.package.remark'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.tenant.package.name'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.STATUS),
      },
      fieldName: 'status',
      label: $t('sys.tenant.package.status'),
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
  onActionClick: OnActionClickFn<TenantApi.Package>,
  onStatusChange?: (
    newStatus: number,
    row: TenantApi.Package,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions<TenantApi.Package>['columns'] {
  return [
    {
      type: 'checkbox',
      width: 50,
      fixed: isMobile.value ? null : 'left',
    },
    {
      field: 'id',
      minWidth: 80,
      title: $t('sys.tenant.package.id'),
    },
    {
      field: 'name',
      minWidth: 150,
      title: $t('sys.tenant.package.name'),
    },
    {
      field: 'status',
      minWidth: 100,
      title: $t('sys.tenant.package.status'),
      cellRender: {
        name: 'CellSwitch',
        props: {
          disabled: !hasAccessByCodes(['system:tenant-package:update']),
        },
        attrs: { beforeChange: onStatusChange },
      },
    },
    {
      field: 'remark',
      formatter: 'formatBlank',
      minWidth: 150,
      title: $t('sys.tenant.package.remark'),
    },
    {
      field: 'createTime',
      formatter: 'formatDateTime',
      minWidth: 150,
      title: $t('page.createTime'),
    },
    {
      field: 'operate',
      title: $t('page.options'),
      width: 180,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: TenantApi.Package) => {
            return useGridActions(row, onActionClick)
              .addEdit('system:tenant-package:update')
              .addDelete('system:tenant-package:delete')
              .build();
          },
        },
      },
    },
  ];
}
