import type { Nullable } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MenuApi } from '#/api';

import { useIsMobile } from '@vben/hooks';
import { IconifyIcon } from '@vben/icons';
import { $te } from '@vben/locales';

import { useDebounceFn } from '@vueuse/core';

import { z } from '#/adapter/form';
import { useGridActions } from '#/adapter/vxe-table';
import {
  buildMenuTree,
  checkMenuNameExistsApi,
  checkMenuPathExistsApi,
  getMenuSimpleListApi,
} from '#/api';
import { DictTypeEnum, MenuType } from '#/enums';
import { $t } from '#/locales';
import { componentKeys } from '#/router/routes';
import { useDictStore } from '#/store';

export const formData = ref<MenuApi.Menu>();

/** 国际化标题后缀 */
export const titleSuffix = ref<string>();

const { isMobile } = useIsMobile();
const dictStore = useDictStore();

const { DIR, MENU, BUTTON, EMBEDDED, LINK } = MenuType;

const checkMenuNameExists = useDebounceFn(async (value: string) => {
  if (!value) return true;
  return !(await checkMenuNameExistsApi(value, formData.value?.id));
}, 500);

const checkMenuPathExists = useDebounceFn(async (value: string) => {
  if (!value) return true;
  return !(await checkMenuPathExistsApi(value, formData.value?.id));
}, 500);

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'RadioGroup',
      componentProps: {
        isButton: true,
        options: dictStore
          .getDictDataList(DictTypeEnum.MENU_TYPE)
          .map((item) => ({ ...item, value: +item.value })),
      },
      defaultValue: MENU,
      fieldName: 'type',
      formItemClass: 'lg:col-span-2',
      label: $t('sys.menu.type'),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.menu.name'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('sys.menu.name'), 2]))
        .max(30, $t('ui.formRules.maxLength', [$t('sys.menu.name'), 30]))
        .refine(checkMenuNameExists, (value) => ({
          message: $t('ui.formRules.alreadyExists', [
            $t('sys.menu.name'),
            value,
          ]),
        })),
    },
    {
      component: 'ApiTreeSelect',
      componentProps: {
        api: getMenuSimpleListApi,
        afterFetch: (data: MenuApi.Simple[]) => {
          const menuList = data.filter((item) => item.type !== BUTTON);
          menuList.push({
            type: -1,
            parentId: -1,
            icon: null,
            id: 0,
            name: $t('sys.menu.root'),
          });
          return buildMenuTree(menuList);
        },
        defaultExpandAll: true,
        checkStrictly: true,
        placement: 'bottom',
        childrenField: 'children',
        labelField: 'name',
        valueField: 'id',
      },
      fieldName: 'parentId',
      label: $t('sys.menu.parent'),
      rules: 'selectRequired',
      renderComponentContent() {
        return {
          default({
            data: { label, icon },
          }: {
            data: { icon: Nullable<string>; label: string };
          }) {
            const coms = [];
            if (icon) {
              coms.push(h(IconifyIcon, { class: 'size-4', icon }));
            }
            coms.push(h('span', {}, label));
            return h('div', { class: 'flex items-center gap-1' }, coms);
          },
        };
      },
    },
    {
      component: 'Input',
      componentProps() {
        return {
          onInput(value: string) {
            titleSuffix.value = value && $te(value) ? $t(value) : undefined;
          },
        };
      },
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return [DIR, EMBEDDED, LINK, MENU].includes(values.type);
        },
      },
      fieldName: 'meta.title',
      label: $t('sys.menu.menuTitle'),
      renderComponentContent() {
        return {
          ...(titleSuffix.value ? { append: () => titleSuffix.value } : {}),
        };
      },
    },
    {
      component: 'Input',
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return [DIR, EMBEDDED, MENU].includes(values.type);
        },
      },
      fieldName: 'path',
      label: $t('sys.menu.path'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('sys.menu.path'), 2]))
        .refine(
          (value: string) => value.startsWith('/'),
          $t('ui.formRules.startWith', [$t('sys.menu.path'), '/']),
        )
        .refine(checkMenuPathExists, (value) => ({
          message: $t('ui.formRules.alreadyExists', [
            $t('sys.menu.path'),
            value,
          ]),
        })),
    },
    {
      component: 'Input',
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return [EMBEDDED, MENU].includes(values.type);
        },
      },
      fieldName: 'activePath',
      help: $t('sys.menu.activePathHelp'),
      label: $t('sys.menu.activePath'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('sys.menu.activePath'), 2]))
        .refine(
          (value: string) => value.startsWith('/'),
          $t('ui.formRules.startWith', [$t('sys.menu.activePath'), '/']),
        )
        .refine(checkMenuPathExists, $t('sys.menu.activePathMustExist'))
        .optional(),
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: '!w-full [&_input]:!text-left',
        controlsPosition: 'right',
        min: 0,
      },
      fieldName: 'sort',
      label: $t('sys.menu.sort'),
      rules: 'required',
    },
    {
      component: 'IconPicker',
      componentProps: {
        prefix: 'lucide',
      },
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return [DIR, EMBEDDED, LINK, MENU].includes(values.type);
        },
      },
      fieldName: 'meta.icon',
      label: $t('sys.menu.icon'),
    },
    {
      component: 'IconPicker',
      componentProps: {
        prefix: 'lucide',
      },
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return [DIR, EMBEDDED, MENU].includes(values.type);
        },
      },
      fieldName: 'activeIcon',
      label: $t('sys.menu.activeIcon'),
    },
    {
      component: 'AutoComplete',
      componentProps: {
        fitInputWidth: true,
        fetchSuggestions: (
          querystring: string,
          cb: (data: { value: number | string }[]) => void,
        ) => {
          let result = componentKeys.map((v) => ({ value: v }));
          if (querystring) {
            result = result.filter((item) =>
              item.value.toLowerCase().includes(querystring.toLowerCase()),
            );
          }
          cb(result);
        },
      },
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return [MENU].includes(values.type);
        },
      },
      fieldName: 'component',
      label: $t('sys.menu.component'),
      rules: 'required',
    },
    {
      component: 'Input',
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return [EMBEDDED, LINK].includes(values.type);
        },
      },
      fieldName: 'linkSrc',
      label: $t('sys.menu.linkSrc'),
      rules: z.string().url($t('ui.formRules.invalidURL')),
    },
    {
      component: 'Input',
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return [BUTTON, MENU].includes(values.type);
        },
        rules: (values) => {
          return values.type === BUTTON ? 'required' : null;
        },
      },
      fieldName: 'permission',
      label: $t('sys.menu.permission'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        isButton: true,
        options: dictStore.getDictDataList(DictTypeEnum.STATUS).map((item) => ({
          ...item,
          value: +item.value,
        })),
      },
      defaultValue: 0,
      fieldName: 'status',
      label: $t('sys.menu.status'),
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: $t('sys.menu.badgeType.dot'), value: 'dot' },
          { label: $t('sys.menu.badgeType.normal'), value: 'normal' },
        ],
      },
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return ![BUTTON].includes(values.type);
        },
      },
      fieldName: 'meta.badgeType',
      label: $t('sys.menu.badgeType.title'),
    },
    {
      component: 'Input',
      componentProps: (values) => {
        return {
          disabled: values.meta?.badgeType !== 'normal',
        };
      },
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return ![BUTTON].includes(values.type);
        },
      },
      fieldName: 'meta.badge',
      label: $t('sys.menu.badge'),
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          'default',
          'destructive',
          'primary',
          'success',
          'warning',
        ].map((v) => ({
          label: v,
          value: v,
        })),
      },
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return ![BUTTON].includes(values.type);
        },
      },
      fieldName: 'meta.badgeVariants',
      label: $t('sys.menu.badgeVariants'),
    },
    {
      component: 'Divider',
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return ![BUTTON].includes(values.type);
        },
      },
      fieldName: 'divider1',
      formItemClass: 'col-span-2 pb-0',
      hideLabel: true,
      renderComponentContent() {
        return {
          default: () => $t('sys.menu.advancedSettings'),
        };
      },
    },
    {
      component: 'Checkbox',
      componentProps: {
        label: $t('sys.menu.keepAlive'),
      },
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return [MENU].includes(values.type);
        },
      },
      fieldName: 'meta.keepAlive',
    },
    {
      component: 'Checkbox',
      componentProps: {
        label: $t('sys.menu.affixTab'),
      },
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return [EMBEDDED, MENU].includes(values.type);
        },
      },
      fieldName: 'meta.affixTab',
    },
    {
      component: 'Checkbox',
      componentProps: {
        label: $t('sys.menu.hideInMenu'),
      },
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return ![BUTTON].includes(values.type);
        },
      },
      fieldName: 'meta.hideInMenu',
    },
    {
      component: 'Checkbox',
      componentProps: {
        label: $t('sys.menu.hideChildrenInMenu'),
      },
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return [DIR, MENU].includes(values.type);
        },
      },
      fieldName: 'meta.hideChildrenInMenu',
    },
    {
      component: 'Checkbox',
      componentProps: {
        label: $t('sys.menu.hideInBreadcrumb'),
      },
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return ![BUTTON, LINK].includes(values.type);
        },
      },
      fieldName: 'meta.hideInBreadcrumb',
    },
    {
      component: 'Checkbox',
      componentProps: {
        label: $t('sys.menu.hideInTab'),
      },
      dependencies: {
        triggerFields: ['type'],
        show: (values) => {
          return ![BUTTON, LINK].includes(values.type);
        },
      },
      fieldName: 'meta.hideInTab',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('sys.menu.name'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.STATUS),
      },
      fieldName: 'status',
      label: $t('sys.menu.status'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<MenuApi.Menu>,
): VxeTableGridOptions<MenuApi.Menu>['columns'] {
  return [
    {
      field: 'meta.title',
      title: $t('sys.menu.menuTitle'),
      headerAlign: 'center',
      align: 'left',
      fixed: 'left',
      minWidth: 250,
      treeNode: true,
      slots: { default: 'title' },
    },
    {
      field: 'type',
      title: $t('sys.menu.type'),
      align: 'center',
      width: 100,
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.MENU_TYPE,
        },
      },
    },
    {
      field: 'permission',
      title: $t('sys.menu.permission'),
      headerAlign: 'center',
      align: 'left',
      minWidth: 200,
    },
    {
      field: 'path',
      title: $t('sys.menu.path'),
      headerAlign: 'center',
      align: 'left',
      minWidth: 200,
    },
    {
      field: 'component',
      title: $t('sys.menu.component'),
      headerAlign: 'center',
      align: 'left',
      minWidth: 300,
      formatter: ({ row }) => {
        switch (row.type) {
          case DIR:
          case MENU: {
            return row.component ?? '';
          }
          case EMBEDDED: {
            return row.meta?.iframeSrc ?? '';
          }
          case LINK: {
            return row.meta?.link ?? '';
          }
        }
        return '';
      },
    },
    {
      field: 'status',
      title: $t('sys.menu.status'),
      minWidth: 100,
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.STATUS,
        },
      },
    },
    {
      field: 'sort',
      title: $t('sys.menu.sort'),
      minWidth: 80,
    },
    {
      field: 'createTime',
      title: $t('page.createTime'),
      minWidth: 150,
      formatter: 'formatDateTime',
    },
    {
      field: 'operate',
      title: $t('page.options'),
      width: 240,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: MenuApi.Menu) => {
            return useGridActions(row, onActionClick)
              .addIf([DIR, MENU].includes(row.type), (builder) => {
                builder.addAction({
                  auth: 'system:menu:create',
                  icon: 'ep:plus',
                  btnText: $t('page.actionTitle.create', [$t('page.sub')]),
                  type: 'primary',
                  onClick: () => {
                    onActionClick({ code: 'append', row });
                  },
                });
              })
              .addEdit('system:menu:update')
              .addDelete('system:menu:delete')
              .build();
          },
        },
      },
    },
  ];
}
