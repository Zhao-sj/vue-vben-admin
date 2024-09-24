import type {
  BaseFormComponentType,
  VbenFormSchema as FormSchema,
  VbenFormProps,
} from '@vben/common-ui';

import { h } from 'vue';

import { setupVbenForm, useVbenForm as useForm, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElDatePicker,
  ElDivider,
  ElInput,
  ElInputNumber,
  ElRadioGroup,
  ElSelect,
  ElSpace,
  ElSwitch,
  ElTimePicker,
  ElTreeSelect,
  ElUpload,
} from 'element-plus';
// 业务表单组件适配

export type FormComponentType =
  | 'Checkbox'
  | 'CheckboxGroup'
  | 'DatePicker'
  | 'Divider'
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

// 初始化表单组件，并注册到form组件内部
setupVbenForm<FormComponentType>({
  components: {
    Checkbox: ElCheckbox,
    CheckboxGroup: ElCheckboxGroup,
    DatePicker: ElDatePicker,
    // 自定义默认的重置按钮
    DefaultResetActionButton: (_props, { slots }) => {
      return h(ElButton, { class: '!mr-0', type: 'default' }, slots);
    },
    // 自定义默认的提交按钮
    DefaultSubmitActionButton: (_props, { slots }) => {
      return h(ElButton, { type: 'primary' }, slots);
    },
    Divider: ElDivider,
    Input: ElInput,
    InputNumber: ElInputNumber,
    RadioGroup: ElRadioGroup,
    Select: (props, { attrs, slots }) => {
      return h(
        ElSelect,
        { ...props, ...attrs },
        {
          ...slots,
          default: () =>
            props.options?.map((item: { label: number | string; value: any }) =>
              h(ElOption, { label: item.label, value: item.value }),
            ),
        },
      );
    },
    Space: ElSpace,
    Switch: ElSwitch,
    TimePicker: ElTimePicker,
    TreeSelect: ElTreeSelect,
    Upload: ElUpload,
  },
  config: {
    modelPropNameMap: {
      Upload: 'fileList',
    },
  },
  defineRules: {
    required: (value, _params, ctx) => {
      if ((!value && value !== 0) || value.length === 0) {
        return $t('formRules.required', [ctx.label]);
      }
      return true;
    },
    selectRequired: (value, _params, ctx) => {
      if (value === undefined || value === null) {
        return $t('formRules.selectRequired', [ctx.label]);
      }
      return true;
    },
  },
});

const useVbenForm = useForm<FormComponentType>;

export { useVbenForm, z };

export type VbenFormSchema = FormSchema<FormComponentType>;
export type { VbenFormProps };
