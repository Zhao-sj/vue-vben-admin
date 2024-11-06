import { h } from 'vue';

import { setupVbenVxeTable, useVbenVxeGrid } from '@vben/plugins/vxe-table';

import { ElAvatar, ElButton, ElImage, ElTag } from 'element-plus';

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
        showOverflow: true,
        stripe: true,
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellImage' },
    vxeUI.renderer.add('CellImage', {
      renderTableDefault(_renderOpts, params) {
        const { column, row } = params;
        const src = row[column.field];
        return h(ElImage, { src, previewSrcList: [src] });
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
      renderTableDefault(renderOpts) {
        const { props } = renderOpts;
        return h(
          ElButton,
          { size: 'small', link: true },
          { default: () => props?.text },
        );
      },
    });

    // 表格配置项可以用 cellRender: { name: 'CellTags' },
    vxeUI.renderer.add('CellTags', {
      renderTableDefault(_renderOpts, params) {
        const { column, row } = params;
        const children: any[] = row[column.field];
        const node = h(
          'div',
          { class: 'flex flex-wrap justify-center gap-1' },
          {
            default: () =>
              children?.map((item) => h(ElTag, {}, { default: () => item })),
          },
        );

        return children?.length > 0 ? node : '-';
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
