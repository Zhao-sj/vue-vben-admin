<script setup lang="ts">
import type { ActionDropdownItem, ActionItem } from '#/components/Table';

import { useAccess } from '@vben/access';
import { Icon } from '@vben/icons';
import { isString } from '@vben/utils';

interface Props {
  link?: boolean;
  circle?: boolean;
  actions?: ActionItem[];
  dropdownActions?: ActionDropdownItem[];
}

withDefaults(defineProps<Props>(), {
  actions: () => [],
  dropdownActions: () => [],
  link: true,
});

const { hasAccessByCodes, hasAccessByRoles } = useAccess();

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

  return hasAccessByRoles(roles) || hasAccessByCodes(codes);
}

function hasDisabled(config?: Record<string, any>) {
  if (!config) {
    return true;
  }

  return Object.keys(config).length === 0;
}
</script>

<template>
  <div class="flex items-center justify-center">
    <template v-for="(item, i) in actions" :key="i">
      <template v-if="hasPermission(item.role, item.auth)">
        <ElPopconfirm
          :disabled="hasDisabled(item.popConfirm)"
          v-bind="item.popConfirm || {}"
          v-on="item.popConfirm?.on || {}"
        >
          <template #reference>
            <div>
              <ElTooltip
                :disabled="hasDisabled(item.tooltip)"
                v-bind="item.tooltip || {}"
              >
                <ElButton :circle :link v-bind="{ ...item, icon: undefined }">
                  <Icon
                    v-if="item.icon"
                    :class="{ 'mr-1': item.label }"
                    :icon="item.icon"
                  />
                  <span v-if="item.label" class="z-span">{{ item.label }}</span>
                </ElButton>
              </ElTooltip>
            </div>
          </template>
        </ElPopconfirm>

        <ElDivider
          v-if="i < actions.length - 1 || dropdownActions.length > 0"
          :border-style="link ? 'solid' : 'none'"
          class="!mx-1.5"
          direction="vertical"
        />
      </template>
    </template>

    <ElDropdown v-if="dropdownActions.length > 0">
      <slot name="more">
        <ElButton link>
          <Icon icon="ep:more-filled" />
        </ElButton>
      </slot>

      <template #dropdown>
        <ElDropdownMenu>
          <template v-for="(item, i) in dropdownActions" :key="i">
            <ElDropdownItem
              v-if="hasPermission(item.role, item.auth)"
              v-bind="{ ...item, icon: undefined }"
            >
              <Icon v-if="item.icon" :icon="item.icon" class="mr-1" />
              <span>{{ item.label }}</span>
            </ElDropdownItem>
          </template>
        </ElDropdownMenu>
      </template>
    </ElDropdown>
  </div>
</template>
