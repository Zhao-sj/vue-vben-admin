<script setup lang="ts" generic="T extends Record<string, any>">
import type { AnyNormalFunction, AnyPromiseFunction } from '@vben/types';

import { DictStatus } from '#/enums';
import { $t } from '#/locales';

interface ChangeOpts {
  onAction: AnyPromiseFunction<any, any>;
  compareField?: keyof T;
  row: T;
  tip: AnyNormalFunction<[string], string>;
}

interface Props extends Omit<ChangeOpts, 'compareField'> {
  onSuccess?: AnyNormalFunction;
}

const props = defineProps<Props>();

const modelValue = defineModel<boolean | number | string>('modelValue');

async function changeStatus(options: ChangeOpts) {
  return new Promise<void>((resolve) => {
    const { row, compareField = 'status', tip, onAction } = options;
    const { DISABLE, ENABLE } = DictStatus;

    const action =
      row[compareField] === ENABLE ? $t('page.enable') : $t('page.disable');

    const title = $t('page.systemTip');
    const message = tip(action);
    const rollback = () => {
      row[compareField] = (
        row[compareField] === ENABLE ? DISABLE : ENABLE
      ) as T[typeof compareField];
    };

    ElMessageBox.confirm(message, title, {
      closeOnClickModal: false,
      draggable: true,
      type: 'warning',
    })
      .then(async () => {
        try {
          await onAction();
          resolve();
        } catch {
          rollback();
        }
      })
      .catch(rollback);
  });
}

async function handleStatusChange() {
  await changeStatus(props);
  props.onSuccess?.();
}
</script>

<template>
  <ElSwitch
    v-bind="$attrs"
    v-model="modelValue"
    :active-value="0"
    :inactive-value="1"
    :active-text="$t('page.enable')"
    :inactive-text="$t('page.disable')"
    inline-prompt
    @change="handleStatusChange"
  />
</template>

<style lang="scss" scoped>
.el-switch {
  --el-switch-on-color: hsl(var(--success));
  --el-switch-off-color: hsl(var(--destructive));
}
</style>
