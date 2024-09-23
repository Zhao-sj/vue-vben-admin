import type { LocaleSetupOptions, SupportedLanguagesType } from '@vben/locales';
import type { Language } from 'element-plus/es/locale';

import type { App } from 'vue';
import { ref } from 'vue';

import { $t, setupI18n as coreSetup, loadLocalesMap } from '@vben/locales';
import { preferences } from '@vben/preferences';

import dayjs from 'dayjs';
import enLocale from 'element-plus/es/locale/lang/en';
import defaultLocale from 'element-plus/es/locale/lang/zh-cn';

import { VxeTable } from '#/utils';

const elementLocale = ref<Language>(defaultLocale);

const modules = import.meta.glob('./langs/*.json');

const localesMap = loadLocalesMap(modules);

/**
 * 加载应用特有的语言包
 * 这里也可以改造为从服务端获取翻译数据
 * @param lang
 */
async function loadMessages(lang: SupportedLanguagesType) {
  const [appLocaleMessages] = await Promise.all([
    localesMap[lang] ? localesMap[lang]() : null,
    loadThirdPartyMessage(lang),
  ]);
  return appLocaleMessages?.default;
}

/**
 * 加载第三方组件库的语言包
 * @param lang
 */
async function loadThirdPartyMessage(lang: SupportedLanguagesType) {
  await Promise.all([
    loadElementLocale(lang),
    loadDayjsLocale(lang),
    loadVxeTableLocale(lang),
  ]);
}

/**
 * 加载dayjs的语言包
 * @param lang
 */
async function loadDayjsLocale(lang: SupportedLanguagesType) {
  let locale;
  switch (lang) {
    case 'zh-CN': {
      locale = await import('dayjs/locale/zh-cn');
      break;
    }
    case 'en-US': {
      locale = await import('dayjs/locale/en');
      break;
    }
    // 默认使用英语
    default: {
      locale = await import('dayjs/locale/en');
    }
  }
  dayjs.locale(locale);
}

/**
 * 加载element-plus的语言包
 * @param lang
 */
async function loadElementLocale(lang: SupportedLanguagesType) {
  switch (lang) {
    case 'zh-CN': {
      elementLocale.value = defaultLocale;
      break;
    }
    case 'en-US': {
      elementLocale.value = enLocale;
      break;
    }
  }
}

/**
 * 加载vxe-table的语言包
 * @param lang
 */
function loadVxeTableLocale(lang: SupportedLanguagesType) {
  VxeTable.setLanguage(lang);
}

async function setupI18n(app: App, options: LocaleSetupOptions = {}) {
  await coreSetup(app, {
    defaultLocale: preferences.app.locale,
    loadMessages,
    missingWarn: !import.meta.env.PROD,
    ...options,
  });
}

export { $t, elementLocale, setupI18n };
