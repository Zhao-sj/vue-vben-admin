<script setup lang="ts">
import { Icon } from '@vben/icons';

import { useDebounceFn } from '@vueuse/core';
import { ElTree } from 'element-plus';

import { buildMenuTree, type DeptApi } from '#/api';
import { $t } from '#/locales';

interface Props {
  data?: DeptApi.Simple[];
}

interface Emits {
  (e: 'query', deptId?: number): void;
}

interface Tree {
  [key: string]: any;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
});
const emit = defineEmits<Emits>();

const treeMapConf = {
  label: 'name',
  children: 'children',
};

const treeRef = ref<InstanceType<typeof ElTree>>();
const deptName = ref<string>();
const currentNodeKey = ref<number>();

const deptTree = computed(() => buildMenuTree(props.data));

const filterDept = useDebounceFn((val: string) => treeRef.value!.filter(val));

const handleNodeClick = useDebounceFn((node: Tree) => {
  let id = node.id;
  if (currentNodeKey.value === id) {
    id = undefined;
  }
  currentNodeKey.value = id;
  emit('query', id);
});

function handleExpandAll(isExpand = true) {
  if (deptTree.value.length === 0) {
    return;
  }

  props.data.forEach((item) => {
    treeRef.value!.store.nodesMap[item.id]!.expanded = isExpand;
  });
}

function filterNode(value: string, data: Tree) {
  if (!value) return true;
  return data.name.includes(value);
}

function joinLabel(prefix: string) {
  return `${prefix}${$t('zen.common.joinAll')}`;
}
</script>

<template>
  <div class="card-box flex h-full flex-col">
    <div class="flex items-center justify-between gap-3 border-b p-2">
      <label class="hidden whitespace-nowrap 2xl:block">
        {{ $t('zen.menu.manage.dept') }}
      </label>

      <ElInput
        v-model="deptName"
        :placeholder="$t('zen.common.search')"
        class="2xl:!w-2/3"
        clearable
        size="small"
        @input="filterDept"
      >
        <template #prefix>
          <Icon icon="ep:search" />
        </template>
      </ElInput>

      <ElDropdown class="self-stretch">
        <div
          class="flex h-full cursor-pointer items-center justify-center px-1"
        >
          <Icon icon="akar-icons:more-vertical-fill" />
        </div>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem @click="handleExpandAll">
              {{ joinLabel($t('zen.common.expand')) }}
            </ElDropdownItem>
            <ElDropdownItem @click="handleExpandAll(false)">
              {{ joinLabel($t('zen.common.collapsed')) }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </div>

    <div class="flex-1 overflow-y-auto">
      <ElTree
        ref="treeRef"
        :current-node-key="currentNodeKey"
        :data="deptTree"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        :props="treeMapConf"
        class="pt-1"
        default-expand-all
        highlight-current
        node-key="id"
        @node-click="handleNodeClick"
      />
    </div>
  </div>
</template>
