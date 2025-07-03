import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { AreaApi } from '#/api';

import { $t } from '#/locales';

export function useColumns(): VxeTableGridOptions<AreaApi.Simple>['columns'] {
  return [
    {
      field: 'id',
      headerAlign: 'center',
      align: 'left',
      minWidth: 200,
      title: $t('sys.area.id'),
      treeNode: true,
    },
    {
      field: 'name',
      headerAlign: 'center',
      align: 'left',
      minWidth: 200,
      title: $t('sys.area.name'),
    },
  ];
}
