/**
 * 通用组件共同的使用的基础组件，原先放在 adapter/form 内部，限制了使用范围，这里提取出来，方便其他地方使用
 * 可用于 vben-form、vben-modal、vben-drawer 等组件使用,
 */

import type { BaseFormComponentType } from '@vben/common-ui';

import type { Component, SetupContext } from 'vue';
import { h } from 'vue';

import { ApiSelect, globalShareState } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  ElAutocomplete,
  ElButton,
  ElCascader,
  ElCheckbox,
  ElCheckboxGroup,
  ElDivider,
  ElInput,
  ElInputNumber,
  ElNotification,
  ElSelectV2,
  ElSpace,
  ElSwitch,
  ElTimePicker,
  ElTreeSelect,
} from 'element-plus';

import { IconPicker, VueDatePicker } from '#/components';

import AdapterImageUpload from './ImageUpload.vue';
import AdapterRadioGroup from './RadioGroup.vue';
import AdapterSelect from './Select.vue';

const withDefaultPlaceholder = <T extends Component>(
  component: T,
  type: 'input' | 'select',
) => {
  return (props: any, { attrs, slots }: Omit<SetupContext, 'expose'>) => {
    const placeholder = props?.placeholder || $t(`ui.placeholder.${type}`);
    return h(component, { ...props, ...attrs, placeholder }, slots);
  };
};

// 这里需要自行根据业务组件库进行适配，需要用到的组件都需要在这里类型说明
export type ComponentType =
  | 'ApiSelect'
  | 'ApiTreeSelect'
  | 'Cascader'
  | 'Checkbox'
  | 'CheckboxGroup'
  | 'DatePicker'
  | 'Divider'
  | 'IconPicker'
  | 'ImageUpload'
  | 'Input'
  | 'InputNumber'
  | 'RadioGroup'
  | 'Select'
  | 'Space'
  | 'Switch'
  | 'TimePicker'
  | 'TreeSelect'
  | BaseFormComponentType;

async function initComponentAdapter() {
  const components: Partial<Record<ComponentType, Component>> = {
    // 如果你的组件体积比较大，可以使用异步加载
    // Button: () =>
    // import('xxx').then((res) => res.Button),
    ApiSelect: (props, { attrs, slots }) => {
      return h(
        ApiSelect,
        {
          placeholder: $t('ui.placeholder.select'),
          ...props,
          ...attrs,
          component: ElSelectV2,
          loadingSlot: 'loading',
          visibleEvent: 'onVisibleChange',
        },
        slots,
      );
    },
    ApiTreeSelect: (props, { attrs, slots }) => {
      return h(
        ApiSelect,
        {
          placeholder: $t('ui.placeholder.select'),
          ...props,
          ...attrs,
          component: ElTreeSelect,
          props: { label: 'label', children: 'children' },
          nodeKey: 'value',
          loadingSlot: 'loading',
          optionsPropName: 'data',
          visibleEvent: 'onVisibleChange',
        },
        slots,
      );
    },
    Autocomplete: ElAutocomplete,
    Checkbox: ElCheckbox,
    CheckboxGroup: ElCheckboxGroup,
    Cascader: ElCascader,
    DatePicker: VueDatePicker,
    // 自定义默认按钮
    DefaultButton: (props, { attrs, slots }) => {
      return h(
        ElButton,
        { ...props, class: '!mr-0', attrs, type: 'info' },
        slots,
      );
    },
    // 自定义主要按钮
    PrimaryButton: (props, { attrs, slots }) => {
      return h(ElButton, { ...props, attrs, type: 'primary' }, slots);
    },
    Divider: ElDivider,
    IconPicker,
    Input: withDefaultPlaceholder(ElInput, 'input'),
    InputNumber: withDefaultPlaceholder(ElInputNumber, 'input'),
    RadioGroup: AdapterRadioGroup,
    Select: withDefaultPlaceholder(AdapterSelect, 'select'),
    Space: ElSpace,
    Switch: ElSwitch,
    TimePicker: ElTimePicker,
    TreeSelect: withDefaultPlaceholder(ElTreeSelect, 'select'),
    ImageUpload: AdapterImageUpload,
  };

  // 将组件注册到全局共享状态中
  globalShareState.setComponents(components);

  // 定义全局共享状态中的消息提示
  globalShareState.defineMessage({
    // 复制成功消息提示
    copyPreferencesSuccess: (title, content) => {
      ElNotification({
        title,
        message: content,
        position: 'bottom-right',
        duration: 0,
        type: 'success',
      });
    },
  });
}

export { initComponentAdapter };
