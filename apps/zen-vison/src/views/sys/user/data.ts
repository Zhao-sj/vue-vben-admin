import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { BaseSimple, DeptApi, UserApi } from '#/api';
import type { ActionDropdownItem, ActionItem } from '#/components';

import { useAccess } from '@vben/access';
import { useIsMobile } from '@vben/hooks';

import {
  buildMenuTree,
  getDeptSimpleListApi,
  getPostSimpleListApi,
} from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore, useUserStore } from '#/store';

const { isMobile } = useIsMobile();
const { hasAccessByCodes } = useAccess();
const userStore = useUserStore();
const dictStore = useDictStore();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('sys.user.nickname'),
      rules: 'required',
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        api: getDeptSimpleListApi,
        afterFetch: (data: DeptApi.Simple[]) => buildMenuTree(data),
        defaultExpandAll: true,
        childrenField: 'children',
        labelField: 'name',
        valueField: 'id',
      },
      fieldName: 'deptId',
      label: $t('sys.user.deptName'),
    },
    {
      component: 'Input',
      fieldName: 'mobile',
      label: $t('sys.user.mobile'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('sys.user.email'),
    },
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('sys.user.username'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        showPassword: true,
        type: 'password',
      },
      fieldName: 'password',
      label: $t('sys.user.password'),
      rules: 'required',
      dependencies: {
        if: (values) => !values.id,
        triggerFields: ['id'],
      },
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.SEX),
        afterFetch: () => {
          return dictStore.getDictDataList(DictTypeEnum.SEX).map((item) => ({
            label: item.label,
            value: +item.value,
          }));
        },
      },
      fieldName: 'sex',
      label: $t('sys.user.sex'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getPostSimpleListApi,
        afterFetch: (data: BaseSimple[]) => {
          return data.map((item) => ({
            label: item.name,
            value: item.id,
          }));
        },
        multiple: true,
      },
      fieldName: 'postIds',
      label: $t('sys.user.post'),
    },
    {
      component: 'Input',
      componentProps: {
        autosize: { maxRows: 5, minRows: 3 },
        resize: 'none',
        type: 'textarea',
      },
      fieldName: 'remark',
      formItemClass: 'lg:col-span-2',
      label: $t('page.remark'),
      labelClass: 'self-start h-8',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('sys.user.username'),
    },
    {
      component: 'Input',
      fieldName: 'mobile',
      label: $t('sys.user.mobile'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.STATUS),
      },
      fieldName: 'status',
      label: $t('sys.user.status'),
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
  onActionClick: OnActionClickFn<UserApi.User>,
  onStatusChange?: (
    newStatus: number,
    row: UserApi.User,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions<UserApi.User>['columns'] {
  return [
    {
      type: 'checkbox',
      width: 50,
      fixed: isMobile.value ? null : 'left',
    },
    {
      field: 'id',
      minWidth: 80,
      title: $t('sys.user.id'),
    },
    {
      field: 'avatar',
      minWidth: 80,
      title: $t('sys.user.avatar'),
      cellRender: { name: 'CellAvatar' },
      showOverflow: false,
      visible: false,
    },
    {
      field: 'username',
      minWidth: 120,
      title: $t('sys.user.username'),
    },
    {
      field: 'nickname',
      minWidth: 120,
      title: $t('sys.user.nickname'),
      formatter: 'formatBlank',
    },
    {
      field: 'sex',
      minWidth: 100,
      title: $t('sys.user.sex'),
      slots: { default: 'sex' },
    },
    {
      field: 'deptName',
      minWidth: 150,
      title: $t('sys.user.deptName'),
      formatter: 'formatBlank',
    },
    {
      field: 'mobile',
      minWidth: 150,
      title: $t('sys.user.mobile'),
      formatter: 'formatBlank',
    },
    {
      field: 'email',
      minWidth: 150,
      title: $t('sys.user.email'),
      formatter: 'formatBlank',
      visible: false,
    },
    {
      field: 'status',
      minWidth: 100,
      title: $t('sys.user.status'),
      cellRender: {
        name: 'CellSwitch',
        props: { disabled: !hasAccessByCodes(['system:user:update']) },
        attrs: { beforeChange: onStatusChange },
      },
    },
    {
      field: 'loginIp',
      minWidth: 150,
      title: $t('sys.user.loginIp'),
      formatter: 'formatBlank',
      visible: false,
    },
    {
      field: 'loginDate',
      minWidth: 150,
      title: $t('sys.user.loginDate'),
      formatter: 'formatDateTimeBlank',
      visible: false,
    },
    {
      field: 'createTime',
      minWidth: 150,
      formatter: 'formatDateTime',
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
          createActions: (row: UserApi.User) => {
            const actions: ActionItem[] = [
              {
                auth: 'system:user:update',
                icon: 'ep:edit',
                btnText: $t('page.edit'),
                onClick: () => {
                  onActionClick({ code: 'edit', row });
                },
                type: 'primary',
              },
              {
                auth: 'system:user:delete',
                disabled: row.id === userStore.userId,
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

            const dropdownActions: ActionDropdownItem[] = [
              {
                auth: 'system:user:update-password',
                icon: 'carbon:password',
                btnText: $t('sys.user.resetPassword'),
                onClick: () => {
                  onActionClick({ code: 'reset', row });
                },
              },
              {
                auth: 'system:permission:assign-user-role',
                icon: 'clarity:assign-user-line',
                btnText: $t('sys.user.assignRole'),
                onClick: () => {
                  onActionClick({ code: 'assign', row });
                },
              },
            ];

            return { actions, dropdownActions };
          },
        },
      },
    },
  ];
}
