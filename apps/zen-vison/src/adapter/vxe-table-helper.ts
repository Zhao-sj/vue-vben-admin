import type { useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { $t } from '#/locales';

export function useGridHelper<T extends Record<string, any> = any>(
  gridApi: ReturnType<typeof useVbenVxeGrid<T>>[1],
) {
  const reloadTable = async () => {
    const values = await gridApi.formApi.getValues();
    gridApi.reload(values);
  };

  const onSuccess = (reload = true) => {
    ElMessage.success($t('page.success'));
    reload && reloadTable();
  };

  const batchSelect = async (options: {
    actionType?: string;
    onBatchAction: (records: T[]) => PromiseLike<any>;
  }) => {
    const { actionType = $t('page.delete'), onBatchAction } = options;
    const selectedRecords = gridApi.grid.getCheckboxRecords() as T[];
    if (selectedRecords.length === 0) {
      ElMessage.warning($t('page.selectTip'));
      return;
    }

    const title = $t('page.systemTip');
    const message = $t('page.batchConfirm', [actionType]);

    try {
      await ElMessageBox.confirm(message, title, {
        closeOnClickModal: false,
        draggable: true,
        type: 'warning',
      });
      gridApi.setLoading(true);
      await onBatchAction(selectedRecords);
      onSuccess();
    } finally {
      gridApi.setLoading(false);
    }
  };

  return {
    reloadTable,
    onSuccess,
    batchSelect,
  };
}
