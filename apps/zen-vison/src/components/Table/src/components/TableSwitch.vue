<script setup lang="ts" generic="T extends Record<string, any>">
import type { AnyNormalFunction, AnyPromiseFunction } from '@vben/types';

import { DictStatus } from '#/enums';
import { $t } from '#/locales';

interface ChangeOpts {
  onAction: AnyPromiseFunction<[DictStatus], any>;
  compareField?: keyof T;
  row: T;
  tip: AnyNormalFunction<[string], string>;
}

interface Props extends Omit<ChangeOpts, 'compareField'> {
  onSuccess?: AnyNormalFunction;
}

const props = defineProps<Props>();

const modelValue = defineModel<boolean | number | string>('modelValue');

const loading = ref(false);

async function changeStatus(options: ChangeOpts) {
  return new Promise<boolean>((resolve) => {
    const { row, compareField = 'status', tip, onAction } = options;
    const { DISABLE, ENABLE } = DictStatus;

    const action =
      row[compareField] === ENABLE ? $t('page.disable') : $t('page.enable');

    const title = $t('page.systemTip');
    const message = tip(action);

    ElMessageBox.confirm(message, title, {
      closeOnClickModal: false,
      draggable: true,
      type: 'warning',
    })
      .then(async () => {
        const targetVal = row[compareField] === ENABLE ? DISABLE : ENABLE;
        await onAction(targetVal);
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
}

async function handleStatusBeforeChange() {
  loading.value = true;
  const isChange = await changeStatus(props);
  loading.value = false;
  return isChange;
}

function handleStatusChange() {
  props.onSuccess?.();
}
</script>

<template>
  <ElSwitch
    v-bind="$attrs"
    v-model="modelValue"
    :loading
    :active-value="0"
    :inactive-value="1"
    :active-text="$t('page.enabled')"
    :inactive-text="$t('page.disabled')"
    inline-prompt
    :before-change="handleStatusBeforeChange"
    @change="handleStatusChange"
  />
</template>

<style lang="scss" scoped>
.el-switch {
  --el-switch-on-color: hsl(var(--success));
  --el-switch-off-color: hsl(var(--destructive));
}
</style>
