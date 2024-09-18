import type { App } from 'vue';

import { usePreferences } from '@vben/preferences';

import {
  VxeButtonGroup,
  VxeIcon,
  VxeInput,
  VxeLoading,
  VxeSelect,
  VxeTooltip,
} from 'vxe-pc-ui';
import { VxeUI } from 'vxe-table';
import enUS from 'vxe-table/lib/locale/lang/en-US';
import zhCN from 'vxe-table/lib/locale/lang/zh-CN';

import 'vxe-pc-ui/lib/style.css';
import 'vxe-table/lib/style.css';

const { isDark } = usePreferences();
watch(
  isDark,
  (isDark) => {
    VxeUI.setTheme(isDark ? 'dark' : 'light');
  },
  { immediate: true },
);

// 使用配置式需要手动导入
VxeUI.component(VxeIcon);
VxeUI.component(VxeLoading);
VxeUI.component(VxeTooltip);

VxeUI.setI18n('zh-CN', zhCN);
VxeUI.setI18n('en-US', enUS);

// 全局配置
VxeUI.setConfig({
  grid: {
    toolbarConfig: {
      custom: true,
      zoom: true,
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

function registerVxeUI(app: App) {
  app.use(VxeInput).use(VxeButtonGroup).use(VxeSelect);
}

export { registerVxeUI, VxeUI };
