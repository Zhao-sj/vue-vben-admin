import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { UserApi } from '#/api';

import { useAccess } from '@vben/access';
import { useIsMobile } from '@vben/hooks';

import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const { isMobile } = useIsMobile();
const { hasAccessByCodes } = useAccess();
const dictStore = useDictStore();

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
      component: 'Select',
      componentProps: {
        options: dictStore.getDictDataList(DictTypeEnum.STATUS),
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

export function useColumns<T = UserApi.User>(
  onStatusChange?: (
    newStatus: number,
    row: T,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions<T>['columns'] {
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
      field: 'opt',
      title: $t('page.options'),
      width: 180,
      fixed: isMobile.value ? null : 'right',
      slots: { default: 'opt' },
    },
  ];
}
