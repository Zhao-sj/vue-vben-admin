import type { VbenFormSchema } from '#/adapter/form';

import { z } from '#/adapter/form';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const dictStore = useDictStore();

export function useTabList() {
  return [
    {
      key: '1',
      name: $t('profile.basic.title'),
      component: 'BasicSetting',
    },
    {
      key: '2',
      name: $t('profile.security.title'),
      component: 'SecuritySetting',
    },
    {
      key: '3',
      name: $t('profile.accountBind.title'),
      component: 'AccountBind',
    },
  ];
}

export function useSecurityFormSchema(
  onConfirmValid: (value: string) => Promise<boolean>,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'oldPassword',
      label: $t('profile.security.password.old'),
      rules: 'required',
    },
    {
      component: 'StrengthMeter',
      fieldName: 'newPassword',
      label: $t('profile.security.password.new'),
      rules: z
        .string()
        .min(
          6,
          $t('profile.security.formRule.minLength', [
            $t('profile.security.password.new'),
            6,
          ]),
        )
        .max(
          16,
          $t('profile.security.formRule.maxLength', [
            $t('profile.security.password.new'),
            16,
          ]),
        ),
    },
    {
      component: 'Input',
      fieldName: 'confirmPassword',
      label: $t('profile.security.password.confirm'),
      rules: z.string().refine(onConfirmValid, {
        message: $t('profile.security.formRule.confirmMismatch'),
      }),
    },
  ];
}

export function useBasicInfoFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('profile.basic.nickname'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'mobile',
      label: $t('profile.basic.phone'),
      rules: z.string().refine((val) => /^1[3-9]\d{9}$/.test(val), {
        message: $t('profile.basic.formRule.phone'),
      }),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('profile.basic.email'),
      rules: z.string().email($t('profile.basic.formRule.email')),
    },
    {
      component: 'RadioGroup',
      fieldName: 'sex',
      label: $t('profile.basic.sex'),
      componentProps: {
        isButton: true,
        options: dictStore.getDictDataList(DictTypeEnum.SEX).map((item) => ({
          ...item,
          value: +item.value,
        })),
      },
      rules: 'selectRequired',
    },
  ];
}
