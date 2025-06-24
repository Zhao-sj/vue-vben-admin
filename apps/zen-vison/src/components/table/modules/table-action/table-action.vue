<script setup lang="ts">
import type { ActionDropdownItem, ActionItem } from './typing';

import { useAccess } from '@vben/access';
import { IconifyIcon } from '@vben/icons';
import { isString } from '@vben/utils';

interface Props {
  link?: boolean;
  circle?: boolean;
  actions?: ActionItem[];
  dropdownActions?: ActionDropdownItem[];
  showEmpty?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  actions: () => [],
  dropdownActions: () => [],
  link: true,
  showEmpty: true,
});

const { hasAccessByCodes, hasAccessByRoles } = useAccess();
const defaultShowAfter = 750;

const authActions = computed(() =>
  props.actions.filter((item) => hasPermission(item.role, item.auth)),
);

const authDropdownActions = computed(() =>
  props.dropdownActions.filter((item) => hasPermission(item.role, item.auth)),
);

const showAction = computed(() => authActions.value.length > 0);

const showDropdown = computed(() => authDropdownActions.value.length > 0);

function hasPermission(
  roles: ActionItem['role'] = [],
  codes: ActionItem['auth'] = [],
) {
  if (isString(roles)) {
    roles = [roles];
  }

  if (isString(codes)) {
    codes = [codes];
  }

  if (roles.length === 0 && codes.length === 0) {
    return true;
  }

  return hasAccessByCodes(codes) || hasAccessByRoles(roles);
}

function hasDisabled(config?: Record<string, any>) {
  if (!config) {
    return true;
  }

  return Object.keys(config).length === 0;
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-y-3">
    <template v-for="(item, i) in authActions" :key="i">
      <ElPopconfirm
        :disabled="item.disabled || hasDisabled(item.popConfirm)"
        :width="180"
        :hide-after="0"
        v-bind="item.popConfirm || {}"
        v-on="item.popConfirm?.on || {}"
      >
        <template #reference>
          <div>
            <ElTooltip
              :disabled="item.disabled || hasDisabled(item.tooltip)"
              :show-after="defaultShowAfter"
              v-bind="item.tooltip || {}"
            >
              <ElButton :circle :link v-bind="{ ...item, icon: undefined }">
                <IconifyIcon
                  v-if="item.icon"
                  :class="{ 'mr-1': !!item.btnText }"
                  :icon="item.icon"
                />
                <span v-if="item.btnText">
                  {{ item.btnText }}
                </span>
              </ElButton>
            </ElTooltip>
          </div>
        </template>
      </ElPopconfirm>

      <ElDivider
        v-if="i < authActions.length - 1 || showDropdown"
        :border-style="link ? 'solid' : 'none'"
        class="!mx-1.5"
        direction="vertical"
      />
    </template>

    <ElDropdown v-if="showDropdown">
      <slot name="more">
        <ElButton link>
          <IconifyIcon icon="ep:more-filled" />
        </ElButton>
      </slot>

      <template #dropdown>
        <ElDropdownMenu>
          <ElDropdownItem
            v-for="(item, i) in authDropdownActions"
            :key="i"
            v-bind="{ ...item, icon: undefined }"
          >
            <IconifyIcon v-if="item.icon" :icon="item.icon" class="mr-1" />
            <span>{{ item.btnText }}</span>
          </ElDropdownItem>
        </ElDropdownMenu>
      </template>
    </ElDropdown>

    <slot v-if="!showAction && !showDropdown && showEmpty" name="empty">
      <div>-</div>
    </slot>
  </div>
</template>
