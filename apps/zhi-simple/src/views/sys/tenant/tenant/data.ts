import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { BaseSimple, TenantApi } from '#/api';

import { useAccess } from '@vben/access';
import { useIsMobile } from '@vben/hooks';

import { useGridActions } from '#/adapter/vxe-table';
import { getTenantPackageSimpleListApi } from '#/api';
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
      label: $t('sys.tenant.list.name'),
      rules: 'required',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getTenantPackageSimpleListApi,
        afterFetch: (data: BaseSimple[]) => {
          return data.map((item) => ({
            label: item.name,
            value: item.id,
          }));
        },
      },
      fieldName: 'packageId',
      label: $t('sys.tenant.list.package'),
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      fieldName: 'contactName',
      label: $t('sys.tenant.list.contact'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'contactMobile',
      label: $t('sys.tenant.list.contactPhone'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('sys.tenant.list.username'),
      rules: 'required',
      dependencies: {
        if: (values) => !values.id,
        triggerFields: ['id'],
      },
    },
    {
      component: 'Input',
      componentProps: {
        clearable: false,
        showPassword: true,
        type: 'password',
      },
      fieldName: 'password',
      label: $t('sys.tenant.list.password'),
      rules: 'required',
      dependencies: {
        if: (values) => !values.id,
        triggerFields: ['id'],
      },
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: '!w-full [&_input]:!text-left',
        controlsPosition: 'right',
        min: 1,
      },
      fieldName: 'accountCount',
      label: $t('sys.tenant.list.accountLimit'),
      rules: 'required',
    },
    {
      component: 'DatePicker',
      componentProps: {
        format: 'yyyy/MM/dd HH:mm:ss',
        enableSeconds: true,
        enableTimePicker: true,
      },
      fieldName: 'expireTime',
      label: $t('sys.tenant.list.expireTime'),
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      fieldName: 'website',
      label: $t('sys.tenant.list.website'),
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
      label: $t('sys.tenant.list.status'),
      dependencies: {
        if: (values) => !values.id,
        triggerFields: ['id'],
      },
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.tenant.list.name'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.STATUS),
      },
      fieldName: 'status',
      label: $t('sys.tenant.list.status'),
    },
    {
      component: 'Input',
      fieldName: 'contactName',
      label: $t('sys.tenant.list.contact'),
    },
    {
      component: 'Input',
      fieldName: 'contactMobile',
      label: $t('sys.tenant.list.contactPhone'),
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
  onActionClick: OnActionClickFn<TenantApi.Tenant>,
  onStatusChange?: (
    newStatus: number,
    row: TenantApi.Tenant,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions<TenantApi.Tenant>['columns'] {
  return [
    {
      type: 'checkbox',
      width: 50,
      fixed: isMobile.value ? null : 'left',
    },
    {
      field: 'id',
      minWidth: 80,
      title: $t('sys.tenant.list.id'),
    },
    {
      field: 'name',
      minWidth: 150,
      title: $t('sys.tenant.list.name'),
    },
    {
      field: 'packageId',
      minWidth: 120,
      title: $t('sys.tenant.list.package'),
      slots: { default: 'package' },
    },
    {
      field: 'contactName',
      minWidth: 100,
      title: $t('sys.tenant.list.contact'),
    },
    {
      field: 'contactMobile',
      minWidth: 120,
      title: $t('sys.tenant.list.contactPhone'),
      formatter: 'formatBlank',
    },
    {
      field: 'accountCount',
      minWidth: 150,
      title: $t('sys.tenant.list.accountLimit'),
      formatter: 'formatThousand',
      sortable: true,
    },
    {
      field: 'expireTime',
      minWidth: 150,
      title: $t('sys.tenant.list.expireTime'),
      slots: { default: 'expire' },
      sortable: true,
    },
    {
      field: 'website',
      minWidth: 200,
      title: $t('sys.tenant.list.website'),
      cellRender: { name: 'CellLink' },
    },
    {
      field: 'status',
      minWidth: 100,
      title: $t('sys.tenant.list.status'),
      cellRender: {
        name: 'CellSwitch',
        props: {
          disabled: (row: TenantApi.Tenant) =>
            !hasAccessByCodes(['system:tenant:update']) || row.packageId === 0,
        },
        attrs: {
          beforeChange: onStatusChange,
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
          createActions: (row: TenantApi.Tenant) => {
            return useGridActions(row, onActionClick)
              .addEdit('system:tenant:update')
              .addDelete('system:tenant:delete', {
                disabled: row.packageId === 0,
              })
              .build();
          },
        },
      },
    },
  ];
}
