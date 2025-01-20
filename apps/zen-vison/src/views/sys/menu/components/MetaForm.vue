<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { IconifyIcon } from '@vben/icons';

import { useVbenForm } from '#/adapter/form';
import { MenuType } from '#/enums';
import { $t } from '#/locales';

import BadgeVariants from './BadgeVariants.vue';

interface Props {
  type?: number;
}

const props = defineProps<Props>();

const show = ref(false);

const chooseOpts = [
  { label: $t('page.no'), value: false },
  { label: $t('page.yes'), value: true },
];

const badgeTypeOpts = [
  { label: $t('sys.menu.meta.badgeDot'), value: 'dot' },
  { label: $t('sys.menu.meta.badgeNormal'), value: 'normal' },
];

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    defaultValue: '',
    fieldName: 'title',
    formItemClass: 'lg:col-span-2',
    help: $t('sys.menu.tip.title'),
    label: $t('sys.menu.meta.title'),
  },
  {
    component: 'Input',
    fieldName: 'activePath',
    help: $t('sys.menu.tip.activePath'),
    label: $t('sys.menu.meta.activePath'),
  },
  {
    component: 'IconPicker',
    fieldName: 'activeIcon',
    help: $t('sys.menu.tip.icon'),
    label: $t('sys.menu.meta.activeIcon'),
  },
  ...(props.type === MenuType.MENU
    ? [
        {
          component: 'RadioGroup',
          componentProps: {
            isButton: true,
            options: chooseOpts,
          },
          defaultValue: false,
          fieldName: 'keepAlive',
          help: $t('sys.menu.tip.keepAlive'),
          label: $t('sys.menu.meta.keepAlive'),
        },
      ]
    : []),
  {
    component: 'RadioGroup',
    componentProps: {
      isButton: true,
      options: chooseOpts,
    },
    defaultValue: false,
    fieldName: 'hideInMenu',
    help: $t('sys.menu.tip.hideInMenu'),
    label: $t('sys.menu.meta.hideInMenu'),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      isButton: true,
      options: chooseOpts,
    },
    defaultValue: false,
    fieldName: 'hideInTab',
    help: $t('sys.menu.tip.hideInTab'),
    label: $t('sys.menu.meta.hideInTab'),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      isButton: true,
      options: chooseOpts,
    },
    defaultValue: false,
    fieldName: 'hideInBreadcrumb',
    help: $t('sys.menu.tip.hideInBreadcrumb'),
    label: $t('sys.menu.meta.hideInBreadcrumb'),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      isButton: true,
      options: chooseOpts,
    },
    defaultValue: false,
    fieldName: 'hideChildrenInMenu',
    help: $t('sys.menu.tip.hideChildrenInMenu'),
    label: $t('sys.menu.meta.hideChildrenInMenu'),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      isButton: true,
      options: badgeTypeOpts,
    },
    defaultValue: 'normal',
    fieldName: 'badgeType',
    help: $t('sys.menu.tip.badgeType'),
    label: $t('sys.menu.meta.badgeType'),
  },
  {
    component: 'Input',
    dependencies: {
      if(values) {
        return values.badgeType === 'normal';
      },
      triggerFields: ['badgeType'],
    },
    fieldName: 'badge',
    help: $t('sys.menu.tip.badge'),
    label: $t('sys.menu.meta.badge'),
  },
  {
    component: 'Input',
    defaultValue: 'success',
    fieldName: 'badgeVariants',
    help: $t('sys.menu.tip.badgeVariants'),
    label: $t('sys.menu.meta.badgeVariants'),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      isButton: true,
      options: chooseOpts,
    },
    defaultValue: false,
    fieldName: 'affixTab',
    help: $t('sys.menu.tip.affixTab'),
    label: $t('sys.menu.meta.affixTab'),
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 0,
    },
    fieldName: 'affixTabOrder',
    help: $t('sys.menu.tip.affixTabOrder'),
    label: $t('sys.menu.meta.affixTabOrder'),
  },
  {
    component: 'Input',
    dependencies: {
      if(values) {
        return !values.link;
      },
      triggerFields: ['link'],
    },
    fieldName: 'iframeSrc',
    formItemClass: 'lg:col-span-2',
    help: $t('sys.menu.tip.iframeSrc'),
    label: $t('sys.menu.meta.iframeSrc'),
  },
  {
    component: 'Input',
    dependencies: {
      if(values) {
        return !values.iframeSrc;
      },
      triggerFields: ['iframeSrc'],
    },
    fieldName: 'link',
    formItemClass: 'lg:col-span-2',
    help: $t('sys.menu.tip.link'),
    label: $t('sys.menu.meta.link'),
  },
  ...(props.type === MenuType.MENU
    ? [
        {
          component: 'RadioGroup',
          componentProps: {
            isButton: true,
            options: chooseOpts,
          },
          defaultValue: false,
          fieldName: 'menuVisibleWithForbidden',
          help: $t('sys.menu.tip.menuVisibleWithForbidden'),
          label: $t('sys.menu.meta.menuVisibleWithForbidden'),
        },
      ]
    : []),
]);

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      componentProps: {
        clearable: true,
      },
      formItemClass: 'pb-4',
      labelClass: 'mr-4',
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1 lg:grid-cols-2 gap-x-4',
  }),
);

function close() {
  show.value = false;
}

defineExpose({ close, formApi });
</script>

<template>
  <div>
    <ElDivider>
      <div class="flex cursor-pointer items-center gap-1" @click="show = !show">
        <span>{{ $t('sys.menu.other') }}</span>
        <IconifyIcon :icon="show ? 'ep:arrow-up' : 'ep:arrow-down'" />
      </div>
    </ElDivider>

    <ElCollapseTransition>
      <Form v-show="show">
        <template #badgeVariants="slotProps">
          <BadgeVariants v-bind="slotProps" />
        </template>
      </Form>
    </ElCollapseTransition>
  </div>
</template>
