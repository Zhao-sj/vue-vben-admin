import type { VbenFormSchema } from '@vben/common-ui';

import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { RoleApi } from '#/api';

import { useAccess } from '@vben/access';
import { useIsMobile } from '@vben/hooks';

import { useGridActions } from '#/adapter/vxe-table';
import { DictRoleType, DictTypeEnum } from '#/enums';
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
      label: $t('sys.role.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('sys.role.code'),
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
      label: $t('sys.role.sort'),
      rules: 'required',
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
      labelClass: 'self-start',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.role.name'),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('sys.role.code'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.STATUS),
      },
      fieldName: 'status',
      label: $t('sys.role.status'),
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
  onActionClick: OnActionClickFn<RoleApi.Role>,
  onStatusChange?: (
    newStatus: number,
    row: RoleApi.Role,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions<RoleApi.Role>['columns'] {
  return [
    {
      type: 'checkbox',
      width: 50,
      fixed: isMobile.value ? null : 'left',
    },
    {
      field: 'id',
      minWidth: 80,
      title: $t('sys.role.id'),
    },
    {
      field: 'name',
      minWidth: 150,
      title: $t('sys.role.name'),
    },
    {
      field: 'code',
      minWidth: 150,
      title: $t('sys.role.code'),
    },
    {
      field: 'type',
      minWidth: 150,
      title: $t('sys.role.type'),
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.ROLE_TYPE,
        },
      },
    },
    {
      field: 'dataScope',
      minWidth: 150,
      title: $t('sys.role.dataScope'),
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.DATA_SCOPE,
        },
      },
    },
    {
      field: 'sort',
      minWidth: 80,
      title: $t('sys.role.sort'),
    },
    {
      field: 'status',
      minWidth: 100,
      title: $t('sys.role.status'),
      cellRender: {
        name: 'CellSwitch',
        props: { disabled: !hasAccessByCodes(['system:role:update']) },
        attrs: { beforeChange: onStatusChange },
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
          createActions: (row: RoleApi.Role) => {
            return useGridActions(row, onActionClick)
              .addEdit('system:role:update')
              .addDelete('system:role:delete', {
                disabled: row.type === DictRoleType.ADMIN,
              })
              .addDropdown({
                auth: 'system:permission:assign-role-menu',
                icon: 'hugeicons:menu-square',
                btnText: $t('sys.role.menuPermission'),
                onClick: () => {
                  onActionClick({ code: 'permission', row });
                },
              })
              .addDropdown({
                auth: 'system:permission:assign-role-data-scope',
                icon: 'f7:scope',
                btnText: $t('sys.role.dataScope'),
                onClick: () => {
                  onActionClick({ code: 'dataScope', row });
                },
              })
              .build();
          },
        },
      },
    },
  ];
}
