import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    accessMode: 'backend',
    loginExpiredMode: 'modal',
    name: import.meta.env.VITE_APP_TITLE,
  },
  copyright: {
    companyName: 'Zen',
    enable: false,
  },
  footer: {
    enable: false,
  },
  logo: {
    source: 'https://unpkg.com/@vbenjs/static-source@0.1.6/source/logo-v1.webp',
  },
});
