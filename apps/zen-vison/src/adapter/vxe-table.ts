import { h } from 'vue';

import { setupVbenVxeTable, useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { ElAvatar, ElImage, ElLink, ElTag } from 'element-plus';

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
        minHeight: 500,
        formConfig: {
          // 全局禁用vxe-table的表单配置，使用formOptions
          enabled: false,
        },
        toolbarConfig: {
          custom: true,
          zoom: true,
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
      },
      table: {
        border: true,
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
        stripe: true,
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellImage' },
    vxeUI.renderer.add('CellImage', {
      renderTableDefault(renderOpts, params) {
        const { props, attrs } = renderOpts;
        const { column, row } = params;
        const src = row[column.field];
        return h(ElImage, { src, previewSrcList: [src], ...props, ...attrs });
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

    // 表格配置项可以用 cellRender: { name: 'CellDict' },
    vxeUI.renderer.add('CellDict', {
      renderTableDefault(renderOpts, params) {
        const { props } = renderOpts;
        const { column, row } = params;
        const value: number = row[column.field];
        const dictStore = useDictStore();

        let data = null;
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

export type * from '@vben/plugins/vxe-table';
