<script setup lang="ts">
import { Icon } from '@vben/icons';

import { useVbenForm, type VbenFormSchema } from '#/adapter/form';
import { MenuType } from '#/enums';
import { $t } from '#/locales';

import BadgeVariants from './BadgeVariants.vue';

interface Props {
  type?: number;
}

const props = defineProps<Props>();

const show = ref(false);

const chooseOpts = [
  { label: $t('zen.common.no'), value: false },
  { label: $t('zen.common.yes'), value: true },
];

const badgeTypeOpts = [
  { label: $t('zen.service.menu.badgeDot'), value: 'dot' },
  { label: $t('zen.service.menu.badgeNormal'), value: 'normal' },
];

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.menu.metaTitle'),
      ]),
    },
    defaultValue: '',
    fieldName: 'title',
    formItemClass: 'lg:col-span-2',
    help: $t('zen.service.menu.titleTip'),
    label: $t('zen.service.menu.metaTitle'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.menu.activePath'),
      ]),
    },
    fieldName: 'activePath',
    help: $t('zen.service.menu.activePathTip'),
    label: $t('zen.service.menu.activePath'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.menu.activeIcon'),
      ]),
    },
    fieldName: 'activeIcon',
    help: $t('zen.service.menu.iconTip'),
    label: $t('zen.service.menu.activeIcon'),
  },
  ...(props.type === MenuType.MENU
    ? [
        {
          component: 'RadioGroup',
          componentProps: {
            options: chooseOpts,
            optionType: 'button',
          },
          defaultValue: false,
          fieldName: 'keepAlive',
          help: $t('zen.service.menu.keepAliveTip'),
          label: $t('zen.service.menu.keepAlive'),
        },
      ]
    : []),
  {
    component: 'RadioGroup',
    componentProps: {
      options: chooseOpts,
      optionType: 'button',
    },
    defaultValue: false,
    fieldName: 'hideInMenu',
    help: $t('zen.service.menu.hideInMenuTip'),
    label: $t('zen.service.menu.hideInMenu'),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: chooseOpts,
      optionType: 'button',
    },
    defaultValue: false,
    fieldName: 'hideInTab',
    help: $t('zen.service.menu.hideInTabTip'),
    label: $t('zen.service.menu.hideInTab'),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: chooseOpts,
      optionType: 'button',
    },
    defaultValue: false,
    fieldName: 'hideInBreadcrumb',
    help: $t('zen.service.menu.hideInBreadcrumbTip'),
    label: $t('zen.service.menu.hideInBreadcrumb'),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: chooseOpts,
      optionType: 'button',
    },
    defaultValue: false,
    fieldName: 'hideChildrenInMenu',
    help: $t('zen.service.menu.hideChildrenInMenuTip'),
    label: $t('zen.service.menu.hideChildrenInMenu'),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: badgeTypeOpts,
      optionType: 'button',
    },
    defaultValue: 'normal',
    fieldName: 'badgeType',
    help: $t('zen.service.menu.badgeTypeTip'),
    label: $t('zen.service.menu.badgeType'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.menu.badge')]),
    },
    dependencies: {
      if(values) {
        return values.badgeType === 'normal';
      },
      triggerFields: ['badgeType'],
    },
    fieldName: 'badge',
    help: $t('zen.service.menu.badgeTip'),
    label: $t('zen.service.menu.badge'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.menu.badgeVariants'),
      ]),
    },
    defaultValue: 'success',
    fieldName: 'badgeVariants',
    help: $t('zen.service.menu.badgeVariantsTip'),
    label: $t('zen.service.menu.badgeVariants'),
  },
  {
    component: 'RadioGroup',
    componentProps: {
      options: chooseOpts,
      optionType: 'button',
    },
    defaultValue: false,
    fieldName: 'affixTab',
    help: $t('zen.service.menu.affixTabTip'),
    label: $t('zen.service.menu.affixTab'),
  },
  {
    component: 'InputNumber',
    componentProps: {
      class: '!w-full',
      controlsPosition: 'right',
      min: 0,
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.menu.affixTabOrder'),
      ]),
    },
    fieldName: 'affixTabOrder',
    help: $t('zen.service.menu.affixTabOrderTip'),
    label: $t('zen.service.menu.affixTabOrder'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [
        $t('zen.service.menu.iframeSrc'),
      ]),
    },
    dependencies: {
      if(values) {
        return !values.link;
      },
      triggerFields: ['link'],
    },
    fieldName: 'iframeSrc',
    formItemClass: 'lg:col-span-2',
    help: $t('zen.service.menu.iframeSrcTip'),
    label: $t('zen.service.menu.iframeSrc'),
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('zen.common.pleaseInput', [$t('zen.service.menu.link')]),
    },
    dependencies: {
      if(values) {
        return !values.iframeSrc;
      },
      triggerFields: ['iframeSrc'],
    },
    fieldName: 'link',
    formItemClass: 'lg:col-span-2',
    help: $t('zen.service.menu.linkTip'),
    label: $t('zen.service.menu.link'),
  },
  ...(props.type === MenuType.MENU
    ? [
        {
          component: 'RadioGroup',
          componentProps: {
            options: chooseOpts,
            optionType: 'button',
          },
          defaultValue: false,
          fieldName: 'menuVisibleWithForbidden',
          help: $t('zen.service.menu.menuVisibleWithForbiddenTip'),
          label: $t('zen.service.menu.menuVisibleWithForbidden'),
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
        <span>{{ $t('zen.service.menu.otherConf') }}</span>
        <Icon :icon="show ? 'ep:arrow-up' : 'ep:arrow-down'" />
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
