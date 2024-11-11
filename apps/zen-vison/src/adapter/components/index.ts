/**
 * 通用组件共同的使用的基础组件，原先放在 adapter/form 内部，限制了使用范围，这里提取出来，方便其他地方使用
 * 可用于 vben-form、vben-modal、vben-drawer 等组件使用,
 */

import type { BaseFormComponentType } from '@vben/common-ui';

import type { Component, SetupContext } from 'vue';
import { h } from 'vue';

import { globalShareState } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  ElAutocomplete,
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElDivider,
  ElInput,
  ElInputNumber,
  ElNotification,
  ElSpace,
  ElSwitch,
  ElTimePicker,
  ElTreeSelect,
  ElUpload,
} from 'element-plus';

import { IconPicker, VueDatePicker } from '#/components';

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
  | 'Checkbox'
  | 'CheckboxGroup'
  | 'DatePicker'
  | 'Divider'
  | 'IconPicker'
  | 'Input'
  | 'InputNumber'
  | 'RadioGroup'
  | 'Select'
  | 'Space'
  | 'Switch'
  | 'TimePicker'
  | 'TreeSelect'
  | 'Upload'
  | BaseFormComponentType;

async function initComponentAdapter() {
  const components: Partial<Record<ComponentType, Component>> = {
    // 如果你的组件体积比较大，可以使用异步加载
    // Button: () =>
    // import('xxx').then((res) => res.Button),

    Autocomplete: ElAutocomplete,
    Checkbox: ElCheckbox,
    CheckboxGroup: ElCheckboxGroup,
    DatePicker: VueDatePicker,
    // 自定义默认的重置按钮
    DefaultResetActionButton: (_props, { slots }) => {
      return h(ElButton, { class: '!mr-0', type: 'default' }, slots);
    },
    // 自定义默认的提交按钮
    DefaultSubmitActionButton: (_props, { slots }) => {
      return h(ElButton, { type: 'primary' }, slots);
    },
    Divider: ElDivider,
    Input: withDefaultPlaceholder(ElInput, 'input'),
    InputNumber: withDefaultPlaceholder(ElInputNumber, 'input'),
    RadioGroup: AdapterRadioGroup,
    Select: withDefaultPlaceholder(AdapterSelect, 'select'),
    Space: ElSpace,
    Switch: ElSwitch,
    TimePicker: ElTimePicker,
    TreeSelect: withDefaultPlaceholder(ElTreeSelect, 'select'),
    Upload: ElUpload,
    IconPicker,
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
