import { useVbenVxeGrid } from '#/adapter';
import { $t } from '#/locales';

type ExtendedVxeGridApi = ReturnType<typeof useVbenVxeGrid>;
type GridApi = ExtendedVxeGridApi[1];

/** 处理批量选择操作 */
export function useBatchSelect<T>(options: {
  gridApi: GridApi;
  handleBatch: (records: T[]) => Promise<any>;
  query?: Record<string, any>;
  type?: string;
}) {
  const {
    handleBatch,
    gridApi,
    query,
    type = $t('zen.common.delete'),
  } = options;
  const selectedRecords: T[] = gridApi.grid.getCheckboxRecords();
  if (selectedRecords.length === 0) {
    ElMessage.warning($t('zen.common.selectTip'));
    return;
  }

  const title = $t('zen.common.systemTitle');
  const message = $t('zen.common.batchConfirm', [type]);
  ElMessageBox.confirm(message, title, {
    closeOnClickModal: false,
    draggable: true,
    type: 'warning',
  }).then(async () => {
    try {
      gridApi.setLoading(true);
      await handleBatch(selectedRecords);
      ElMessage.success($t('zen.common.successTip'));
      gridApi.reload(query);
    } finally {
      gridApi.setLoading(false);
    }
  });
}

/** 重置 useVbenVxeGrid 的 默认表单插槽 */
export function useResetVbenVxeForm<T extends HTMLElement>(
  queryWrapper: ReturnType<typeof useTemplateRef<T>>,
) {
  onMounted(() => {
    const parent = queryWrapper.value?.parentElement;
    if (parent) {
      parent.classList.remove(...parent.classList);
      parent.replaceChildren(queryWrapper.value);
    }
  });
}
