<script setup lang="ts">
import { IconifyIcon } from '@vben/icons';

import { useDebounceFn } from '@vueuse/core';
import { ElTree } from 'element-plus';

import { buildMenuTree, getDeptSimpleListApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

interface Emits {
  (e: 'query', deptId?: number): void;
}

interface Tree {
  [key: string]: any;
}

const emit = defineEmits<Emits>();

const treeMapConf = {
  label: 'name',
  children: 'children',
};

const treeRef = ref<InstanceType<typeof ElTree>>();
const deptName = ref<string>();
const currentNodeKey = ref<number>();

const { data: deptList, loading } = useRequest(getDeptSimpleListApi);

const deptTree = computed(() => buildMenuTree(deptList.value || []));

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

  deptList.value.forEach((item) => {
    treeRef.value!.store.nodesMap[item.id]!.expanded = isExpand;
  });
}

function filterNode(value: string, data: Tree) {
  if (!value) return true;
  return data.name.includes(value);
}
</script>

<template>
  <div
    class="bg-card flex h-full flex-col overflow-hidden rounded-md"
    v-loading="loading"
  >
    <div class="flex items-center justify-between gap-3 border-b p-2">
      <label class="hidden whitespace-nowrap 2xl:block">
        {{ $t('menu.sys.dept') }}
      </label>

      <ElInput
        v-model="deptName"
        :placeholder="$t('page.search')"
        class="2xl:!w-2/3"
        clearable
        size="small"
        @input="filterDept"
      >
        <template #prefix>
          <IconifyIcon icon="ep:search" />
        </template>
      </ElInput>

      <ElDropdown class="self-stretch">
        <div
          class="flex h-full cursor-pointer items-center justify-center px-1"
        >
          <IconifyIcon icon="akar-icons:more-vertical-fill" />
        </div>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem @click="handleExpandAll">
              {{ $t('page.expand', [$t('page.all')]) }}
            </ElDropdownItem>
            <ElDropdownItem @click="handleExpandAll(false)">
              {{ $t('page.collapsed', [$t('page.all')]) }}
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
