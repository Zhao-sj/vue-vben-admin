import type { useVbenVxeGrid } from '@vben/plugins/vxe-table';
import type { Recordable } from '@vben/types';

import type { OnActionClickFn } from './vxe-table';

import type { ActionDropdownItem, ActionItem } from '#/components';

import { $t } from '#/locales';

interface ActionBuilder {
  addEdit: (auth?: string, config?: Partial<ActionItem>) => ActionBuilder;
  addDelete: (auth?: string, config?: Partial<ActionItem>) => ActionBuilder;
  addAction: (action: ActionItem) => ActionBuilder;
  addDropdown: (action: ActionItem) => ActionBuilder;
  addIf: (
    condition: boolean,
    callback: (builder: ActionBuilder) => void,
  ) => ActionBuilder;
  build: () => { actions: ActionItem[]; dropdownActions: ActionDropdownItem[] };
}

export function useGridActions<T = Recordable<any>>(
  row: T,
  onActionClick: OnActionClickFn<T>,
) {
  const actions: ActionItem[] = [];
  const dropdownActions: ActionDropdownItem[] = [];

  const actionBuilder: ActionBuilder = {
    addEdit(auth?: string, config: Partial<ActionItem> = {}) {
      actions.push({
        auth,
        icon: 'ep:edit',
        btnText: $t('page.edit'),
        type: 'primary',
        onClick: () => {
          onActionClick({ code: 'edit', row });
        },
        ...config,
      });
      return this;
    },

    addDelete(auth?: string, config: Partial<ActionItem> = {}) {
      actions.push({
        auth,
        icon: 'ep:delete',
        btnText: $t('page.delete'),
        type: 'danger',
        popConfirm: {
          on: {
            confirm: () => {
              onActionClick({ code: 'delete', row });
            },
          },
          title: $t('page.confirmDelete'),
        },
        ...config,
      });
      return this;
    },

    addAction(action: ActionItem) {
      actions.push(action);
      return this;
    },

    addDropdown(action: ActionDropdownItem) {
      dropdownActions.push(action);
      return this;
    },

    addIf(
      condition: boolean,
      callback: (builder: typeof actionBuilder) => void,
    ) {
      if (condition) {
        callback(this);
      }
      return this;
    },

    build() {
      return { actions, dropdownActions };
    },
  };

  return actionBuilder;
}

export function useGridHelper<T extends Record<string, any> = any>(
  gridApi: ReturnType<typeof useVbenVxeGrid<T>>[1],
) {
  const onTreeExpandAll = (expand = true) => {
    gridApi.grid.setAllTreeExpand(expand);
  };

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
    onTreeExpandAll,
    reloadTable,
    onSuccess,
    batchSelect,
  };
}
