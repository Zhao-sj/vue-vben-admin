<script setup lang="ts">
import type { RouteMeta } from '@vben/types';

import { Icon } from '@vben/icons';

import { ElRadioButton, ElRadioGroup } from 'element-plus';

import { MenuType } from '#/enums';
import { $t } from '#/locales';

import FormItemHelp from './FormItemHelp.vue';

interface Props {
  type?: number;
}

defineProps<Props>();

const formState = defineModel<RouteMeta>('modelValue', {
  required: true,
});

const show = ref(false);

const chooseOpts = computed(() => [
  { label: $t('zen.common.no'), value: false },
  { label: $t('zen.common.yes'), value: true },
]);

const badgeTypeOpts = computed(() => [
  { label: $t('zen.service.menu.badgeDot'), value: 'dot' },
  { label: $t('zen.service.menu.badgeNormal'), value: 'normal' },
]);

const Choose = defineComponent({
  setup(props, { attrs }) {
    return () =>
      h(ElRadioGroup, { ...props, ...attrs }, () =>
        chooseOpts.value.map((item) =>
          h(ElRadioButton, { label: item.label, value: item.value }),
        ),
      );
  },
});
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
      <ElForm v-if="show" :label-width="100" :model="formState">
        <ElRow :gutter="20">
          <ElCol :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.titleTip')"
              :label="$t('zen.service.menu.metaTitle')"
            >
              <ElInput
                v-model="formState.title"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </FormItemHelp>
          </ElCol>

          <ElCol :lg="12" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.activePathTip')"
              :label="$t('zen.service.menu.activePath')"
            >
              <ElInput
                v-model="formState.activePath"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </FormItemHelp>
          </ElCol>

          <ElCol :lg="12" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.iconTip')"
              :label="$t('zen.service.menu.activeIcon')"
            >
              <ElInput
                v-model="formState.activeIcon"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </FormItemHelp>
          </ElCol>

          <ElCol v-if="type === MenuType.MENU" :lg="12" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.keepAliveTip')"
              :label="$t('zen.service.menu.keepAlive')"
            >
              <Choose v-model="formState.keepAlive" />
            </FormItemHelp>
          </ElCol>

          <ElCol :lg="12" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.hideInMenuTip')"
              :label="$t('zen.service.menu.hideInMenu')"
            >
              <Choose v-model="formState.hideInMenu" />
            </FormItemHelp>
          </ElCol>

          <ElCol :lg="12" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.hideInTabTip')"
              :label="$t('zen.service.menu.hideInTab')"
            >
              <Choose v-model="formState.hideInTab" />
            </FormItemHelp>
          </ElCol>

          <ElCol :lg="12" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.hideInBreadcrumbTip')"
              :label="$t('zen.service.menu.hideInBreadcrumb')"
            >
              <Choose v-model="formState.hideInBreadcrumb" />
            </FormItemHelp>
          </ElCol>

          <ElCol :lg="12" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.hideChildrenInMenuTip')"
              :label="$t('zen.service.menu.hideChildrenInMenu')"
            >
              <Choose v-model="formState.hideChildrenInMenu" />
            </FormItemHelp>
          </ElCol>

          <ElCol :lg="12" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.badgeTypeTip')"
              :label="$t('zen.service.menu.badgeType')"
            >
              <ElRadioGroup v-model="formState.badgeType">
                <ElRadioButton
                  v-for="item in badgeTypeOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElRadioGroup>
            </FormItemHelp>
          </ElCol>

          <ElCol v-if="formState.badgeType === 'normal'" :lg="12" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.badgeTip')"
              :label="$t('zen.service.menu.badge')"
            >
              <ElInput
                v-model="formState.badge"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </FormItemHelp>
          </ElCol>

          <ElCol :lg="12" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.badgeVariantsTip')"
              :label="$t('zen.service.menu.badgeVariants')"
            >
              <div class="flex items-center gap-1">
                <ElInput
                  v-model="formState.badgeVariants"
                  :placeholder="$t('zen.common.pleaseInput')"
                  clearable
                />

                <ElColorPicker v-model="formState.badgeVariants" />
              </div>
            </FormItemHelp>
          </ElCol>

          <ElCol :lg="12" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.affixTabTip')"
              :label="$t('zen.service.menu.affixTab')"
            >
              <Choose v-model="formState.affixTab" />
            </FormItemHelp>
          </ElCol>

          <ElCol :lg="12" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.affixTabOrderTip')"
              :label="$t('zen.service.menu.affixTabOrder')"
            >
              <ElInputNumber
                v-model="formState.affixTabOrder"
                :min="0"
                :placeholder="$t('zen.common.pleaseInput')"
                class="!w-full"
                controls-position="right"
              />
            </FormItemHelp>
          </ElCol>

          <ElCol v-if="!formState.link" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.iframeSrcTip')"
              :label="$t('zen.service.menu.iframeSrc')"
            >
              <ElInput
                v-model="formState.iframeSrc"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </FormItemHelp>
          </ElCol>

          <ElCol v-if="!formState.iframeSrc" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.linkTip')"
              :label="$t('zen.service.menu.link')"
            >
              <ElInput
                v-model="formState.link"
                :placeholder="$t('zen.common.pleaseInput')"
                clearable
              />
            </FormItemHelp>
          </ElCol>

          <ElCol v-if="type === MenuType.MENU" :lg="12" :xs="24">
            <FormItemHelp
              :content="$t('zen.service.menu.menuVisibleWithForbiddenTip')"
              :label="$t('zen.service.menu.menuVisibleWithForbidden')"
            >
              <Choose v-model="formState.menuVisibleWithForbidden" />
            </FormItemHelp>
          </ElCol>
        </ElRow>
      </ElForm>
    </ElCollapseTransition>
  </div>
</template>
