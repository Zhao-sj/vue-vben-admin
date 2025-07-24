import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { FileApi } from '#/api';

import { useIsMobile } from '@vben/hooks';

import { useGridActions } from '#/adapter/vxe-table';
import { $t } from '#/locales';

const { isMobile } = useIsMobile();

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'path',
      label: $t('infra.file.list.path'),
    },
    {
      component: 'Input',
      fieldName: 'type',
      label: $t('infra.file.list.type'),
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
  onActionClick: OnActionClickFn<FileApi.FileItem>,
): VxeTableGridOptions<FileApi.FileItem>['columns'] {
  return [
    {
      field: 'id',
      minWidth: 80,
      title: $t('infra.file.list.id'),
    },
    {
      field: 'name',
      minWidth: 150,
      title: $t('infra.file.list.name'),
      showOverflow: true,
    },
    {
      field: 'path',
      minWidth: 200,
      title: $t('infra.file.list.path'),
      showOverflow: true,
    },
    {
      field: 'url',
      minWidth: 300,
      title: $t('infra.file.list.url'),
      showOverflow: true,
    },
    {
      field: 'type',
      minWidth: 100,
      title: $t('infra.file.list.type'),
      showOverflow: true,
    },
    {
      field: 'size',
      minWidth: 100,
      title: $t('infra.file.list.size'),
      formatter: 'formatFileSize',
    },
    {
      field: 'preview',
      minWidth: 100,
      title: $t('infra.file.list.preview.title'),
      slots: { default: 'preview' },
      showOverflow: false,
    },
    {
      field: 'createTime',
      minWidth: 150,
      title: $t('infra.file.list.createTime'),
      formatter: 'formatDateTime',
    },
    {
      field: 'operate',
      title: $t('page.options'),
      width: 120,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: FileApi.FileItem) => {
            return useGridActions(row, onActionClick)
              .addDelete('infra:file:delete')
              .build();
          },
        },
      },
    },
  ];
}
