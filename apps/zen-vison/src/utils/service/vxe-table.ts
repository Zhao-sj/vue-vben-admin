import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { $t } from '#/locales';

type GridApi<T extends Record<string, any> = any> = ReturnType<
  typeof useVbenVxeGrid<T>
>[1];

/** 处理批量选择操作 */
export function useBatchSelect<T extends Record<string, any> = any>(options: {
  gridApi: GridApi<T>;
  handleBatch: (records: T[]) => Promise<any>;
  query?: Record<string, any>;
  type?: string;
}) {
  const { handleBatch, gridApi, query, type = $t('page.delete') } = options;
  const selectedRecords = gridApi.grid.getCheckboxRecords() as T[];
  if (selectedRecords.length === 0) {
    ElMessage.warning($t('page.selectTip'));
    return;
  }

  const title = $t('page.systemTip');
  const message = $t('page.batchConfirm', [type]);
  ElMessageBox.confirm(message, title, {
    closeOnClickModal: false,
    draggable: true,
    type: 'warning',
  }).then(async () => {
    try {
      gridApi.setLoading(true);
      await handleBatch(selectedRecords);
      ElMessage.success($t('page.success'));
      gridApi.reload(query);
    } finally {
      gridApi.setLoading(false);
    }
  });
}
