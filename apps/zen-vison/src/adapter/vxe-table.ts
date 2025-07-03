import type { VxeTableGridOptions } from '@vben/plugins/vxe-table';
import type { Recordable } from '@vben/types';

import type { DictApi } from '#/api';

import { h } from 'vue';

import { setupVbenVxeTable, useVbenVxeGrid } from '@vben/plugins/vxe-table';
import { isFunction } from '@vben/utils';

import { ElAvatar, ElImage, ElLink, ElSwitch, ElTag } from 'element-plus';

import { TableAction } from '#/components';
import { $t } from '#/locales';
import { useDictStore } from '#/store';
import {
  formatFileSize,
  formatThousand,
  formatToDate,
  formatToDateTime,
  formatToSeconds,
} from '#/utils';

import { useVbenForm } from './form';

setupVbenVxeTable({
  configVxeTable: (vxeUI) => {
    vxeUI.setConfig({
      grid: {
        align: 'center',
        minHeight: 300,
        formConfig: {
          // 全局禁用vxe-table的表单配置，使用formOptions
          enabled: false,
        },
        toolbarConfig: {
          custom: {
            icon: 'vxe-icon-setting',
          },
          zoom: true,
          refresh: {
            code: 'query',
          },
          search: true,
        },
        size: 'small',
        proxyConfig: {
          autoLoad: true,
          response: {
            result: 'list',
            total: 'total',
            list: 'list',
          },
          showActiveMsg: true,
          showResponseMsg: false,
        },
        pagerConfig: {
          pageSizes: [10, 20, 50, 100],
        },
      } as VxeTableGridOptions,
      table: {
        columnConfig: {
          resizable: true,
        },
        customConfig: {
          storage: true,
        },
        round: true,
        rowConfig: {
          isCurrent: true,
          isHover: true,
        },
        currentRowConfig: {
          isFollowSelected: true,
        },
        stripe: true,
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellImage' },
    vxeUI.renderer.add('CellImage', {
      renderTableDefault(renderOpts, params) {
        const { props, attrs } = renderOpts;
        const { column, row } = params;
        const src = row[column.field];
        return h(ElImage, {
          src,
          previewSrcList: [src],
          previewTeleported: true,
          ...props,
          ...attrs,
        });
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellAvatar' },
    vxeUI.renderer.add('CellAvatar', {
      renderTableDefault(renderOpts, params) {
        const { props, attrs } = renderOpts;
        const { column, row } = params;
        const src = row[column.field];

        const node = h(ElAvatar, { src, ...props, ...attrs });
        return src ? node : '-';
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellLink' },
    vxeUI.renderer.add('CellLink', {
      renderTableDefault(_renderOpts, params) {
        const { column, row } = params;
        const href = row[column.field];
        const node = h(
          ElLink,
          { type: 'primary', href, target: '_blank' },
          { default: () => href },
        );
        return href ? node : '-';
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellTags' },
    vxeUI.renderer.add('CellTags', {
      renderTableDefault(renderOpts, params) {
        const { props } = renderOpts;
        const { column, row } = params;

        const label: string = props?.label;
        const children: any[] = row[column.field];
        const node = h(
          'div',
          { class: 'flex flex-wrap justify-center gap-1' },
          {
            default: () =>
              children?.map((item) =>
                h(ElTag, {}, { default: () => (label ? item[label] : item) }),
              ),
          },
        );

        return children?.length > 0 ? node : '-';
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellSwitch' },
    vxeUI.renderer.add('CellSwitch', {
      renderTableDefault({ attrs, props }, { column, row }) {
        const loadingKey = `__loading_${column.field}`;
        const finallyProps = {
          activeText: $t('page.enabled'),
          inactiveText: $t('page.disabled'),
          activeValue: 0,
          inactiveValue: 1,
          inlinePrompt: true,
          style: {
            '--el-switch-on-color': 'hsl(var(--success))',
            '--el-switch-off-color': 'hsl(var(--destructive))',
          },
          ...props,
          modelValue: row[column.field],
          loading: row[loadingKey] ?? false,
          disabled: isFunction(props?.disabled)
            ? props.disabled(row)
            : props?.disabled,
          beforeChange: onBeforeChange,
        };
        async function onBeforeChange() {
          row[loadingKey] = true;
          try {
            const { activeValue, inactiveValue } = finallyProps;
            const newVal =
              row[column.field] === activeValue ? inactiveValue : activeValue;
            const result = await attrs?.beforeChange?.(newVal, row);
            if (result !== false) {
              row[column.field] = newVal;
            }
            return !!result;
          } finally {
            row[loadingKey] = false;
          }
        }
        return h(ElSwitch, finallyProps);
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellOperate' },
    vxeUI.renderer.add('CellOperate', {
      renderTableDefault({ attrs, props }, { row }) {
        if (attrs && attrs.createActions && isFunction(attrs.createActions)) {
          const propActions = attrs.createActions(row);
          return h(TableAction, {
            link: true,
            showEmpty: true,
            ...props,
            ...propActions,
          });
        }

        return h(TableAction, { ...props });
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellDict' },
    vxeUI.renderer.add('CellDict', {
      renderTableDefault({ props }, { column, row }) {
        const value: number = row[column.field];
        const dictStore = useDictStore();

        let data: DictApi.DataSimple | undefined;
        if (props) {
          data = dictStore.getDictData(props.type, value.toString());
        }

        return h(
          ElTag,
          { type: data?.color },
          {
            default: () => data?.label,
          },
        );
      },
    });

    // 这里可以自行扩展 vxe-table 的全局配置，比如自定义格式化
    vxeUI.formats.add('formatThousand', {
      tableCellFormatMethod({ cellValue }) {
        return formatThousand(cellValue);
      },
    });

    vxeUI.formats.add('formatFileSize', {
      tableCellFormatMethod({ cellValue }) {
        return formatFileSize(cellValue);
      },
    });

    vxeUI.formats.add('formatSeconds', {
      tableCellFormatMethod({ cellValue }) {
        return formatToSeconds(cellValue);
      },
    });

    vxeUI.formats.add('formatBlank', {
      tableCellFormatMethod({ cellValue }) {
        return cellValue || '-';
      },
    });

    vxeUI.formats.add('formatDateBlank', {
      tableCellFormatMethod({ cellValue }) {
        return cellValue ? formatToDate(cellValue) : '-';
      },
    });

    vxeUI.formats.add('formatDateTimeBlank', {
      tableCellFormatMethod({ cellValue }) {
        return cellValue ? formatToDateTime(cellValue) : '-';
      },
    });
  },
  useVbenForm,
});

export { useVbenVxeGrid };

export * from './vxe-table-helper';

export type OnActionClickParams<T = Recordable<any>> = {
  code: string;
  row: T;
};

export type OnActionClickFn<T = Recordable<any>> = (
  params: OnActionClickParams<T>,
) => void;

export type * from '@vben/plugins/vxe-table';
