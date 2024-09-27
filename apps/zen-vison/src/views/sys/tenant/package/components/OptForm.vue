<script setup lang="ts">
import { ElTree } from 'element-plus';
import { cloneDeep } from 'lodash-es';

import { useVbenForm, type VbenFormSchema } from '#/adapter';
import { buildMenuTree, type MenuApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

interface Props {
  menus?: MenuApi.Simple[];
}

const props = withDefaults(defineProps<Props>(), {
  menus: () => [],
});

const dictStore = useDictStore();
const treeRef = useTemplateRef<InstanceType<typeof ElTree>>('treeRef');
const isCheckAll = ref(false);

const treeMapConf = {
  label: 'name',
  children: 'children',
};

const menuTree = computed(() => buildMenuTree(cloneDeep(props.menus)));

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.package.name'),
      ]),
    },
    fieldName: 'name',
    label: $t('zen.service.package.name'),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'menuIds',
    label: $t('zen.service.package.menu'),
    labelClass: 'self-start h-8',
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: dictStore.getDictDataList(DictTypeEnum.STATUS).map((item) => ({
        ...item,
        value: +item.value,
      })),
      optionType: 'button',
    },
    defaultValue: 0,
    fieldName: 'status',
    label: $t('zen.service.package.status'),
  },
  {
    component: 'Input',
    componentProps: {
      autosize: {
        maxRows: 5,
        minRows: 3,
      },
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.package.remark'),
      ]),
      resize: 'none',
      type: 'textarea',
    },
    fieldName: 'remark',
    label: $t('zen.service.package.remark'),
    labelClass: 'self-start h-8',
  },
]);

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      labelClass: 'mr-4',
      labelWidth: 65,
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1',
  }),
);

function handleExpand(checked: boolean | number | string) {
  props.menus.forEach((item) => {
    treeRef.value!.store.nodesMap[item.id]!.expanded = checked as boolean;
  });
}

function handleChooseAll(checked: boolean | number | string) {
  treeRef.value!.setCheckedKeys(
    checked ? props.menus.map((item) => item.id) : [],
  );
}

function setCheckAll(isAll: boolean) {
  isCheckAll.value = isAll;
}

function getTreeInstance() {
  return treeRef.value;
}

defineExpose({
  formApi,
  getTreeInstance,
  setCheckAll,
});
</script>

<template>
  <Form>
    <template #menuIds>
      <div class="w-full">
        <div>
          <ElCheckbox
            :label="`${$t('zen.common.expand')} / ${$t('zen.common.collapsed')}`"
            @change="handleExpand"
          />
          <ElCheckbox
            v-model="isCheckAll"
            :label="`${$t('zen.common.selectAll')} / ${$t('zen.common.unselectAll')}`"
            @change="handleChooseAll"
          />
        </div>
        <ElTree
          ref="treeRef"
          :data="menuTree"
          :props="treeMapConf"
          check-strictly
          class="min-h-60 overflow-y-auto rounded-lg border pt-1"
          node-key="id"
          show-checkbox
        />
      </div>
    </template>
  </Form>
</template>
