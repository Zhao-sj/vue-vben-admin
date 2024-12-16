<script lang="ts" setup>
import { preferences, usePreferences } from '@vben/preferences';

import { isNumber } from 'lodash-es';
import tinymce, { Editor, type RawEditorSettings } from 'tinymce';

import { uploadFileApi } from '#/api';

import { bindHandlers, buildShortUUID, onMountedOrActivated } from './helper';
import { customRegistry } from './plugins';
import {
  plugins as defaultPlugins,
  toolbar as defaultToolbar,
} from './tinymce';

import 'tinymce/icons/default';
import 'tinymce/themes/silver/theme';
import 'tinymce/plugins/image';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/autosave';
import 'tinymce/plugins/code';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/media';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/noneditable';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/print';
import 'tinymce/plugins/save';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/tabfocus';
import 'tinymce/plugins/table';
import 'tinymce/plugins/template';
import 'tinymce/plugins/textpattern';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/visualchars';
import 'tinymce/plugins/wordcount';

interface Props {
  height?: number | string;
  options?: Partial<RawEditorSettings>;
  plugins?: string[];
  toolbar?: string[];
  width?: number | string;
}

interface Emits {
  (e: 'change', value: string): void;
  (e: 'inited', editor: Editor[]): void;
  (e: 'initError', error: Error): void;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
  height: 400,
  options: () => ({}),
  plugins: () => defaultPlugins,
  toolbar: () => defaultToolbar,
  width: 'auto',
});

const emit = defineEmits<Emits>();

const modelValue = defineModel<string>('modelValue');

const attrs = useAttrs();
const { isDark } = usePreferences();

const editorRef = ref<Editor | null>(null);
const tinymceId = ref<string>(buildShortUUID('tiny-vue'));
const elRef = ref<HTMLElement | null>(null);

const containerWidth = computed(() => {
  const width = props.width;
  if (isNumber(width)) {
    return `${width}px`;
  }
  return width;
});

const skinName = computed(() => (isDark.value ? 'oxide-dark' : 'oxide'));

const langName = computed(() => {
  const lang = preferences.app.locale;
  return ['en-US', 'zh_CN'].includes(lang) ? lang : 'zh_CN';
});

const initOptions = computed((): RawEditorSettings => {
  const { height, options, plugins, toolbar } = props;
  const publicPath = import.meta.env.VITE_BASE || '/';
  return {
    auto_focus: true,
    branding: false,
    content_css: `${publicPath}resource/tinymce/skins/ui/${
      skinName.value
    }/content.min.css`,
    default_link_target: '_blank',
    height,
    language: langName.value,
    language_url: `${publicPath}resource/tinymce/langs/${langName.value}.js`,
    link_title: false,
    menubar: 'file edit insert view format table',
    object_resizing: false,
    plugins,
    selector: `#${unref(tinymceId)}`,
    skin: skinName.value,
    skin_url: `${publicPath}resource/tinymce/skins/ui/${skinName.value}`,
    toolbar,
    image_title: true,
    file_picker_callback: filePicker,
    ...options,
    setup: (editor: Editor) => {
      customRegistry(editor);
      editorRef.value = editor;
      editor.on('init', (e) => initSetup(e));
    },
  };
});

function initSetup(e: any) {
  const editor = unref(editorRef);
  if (!editor) {
    return;
  }
  const value = modelValue.value || '';

  editor.setContent(value);
  bindModelHandlers(editor);
  bindHandlers(e, attrs, unref(editorRef));
}

function bindModelHandlers(editor: any) {
  const modelEvents = attrs.modelEvents || null;
  const normalizedEvents = Array.isArray(modelEvents)
    ? modelEvents.join(' ')
    : modelEvents;

  editor.on(normalizedEvents || 'change keyup undo redo', () => {
    const content = editor.getContent({ format: attrs.outputFormat });
    modelValue.value = content;
    emit('change', content);
  });
}

function initEditor() {
  const el = unref(elRef);
  if (el) {
    el.style.visibility = '';
  }
  tinymce
    .init(unref(initOptions))
    .then((editor) => {
      emit('inited', editor);
    })
    .catch((error) => {
      emit('initError', error);
    });
}

function setValue(editor: Record<string, any>, val?: string, prevVal?: string) {
  if (
    editor &&
    typeof val === 'string' &&
    val !== prevVal &&
    val !== editor.getContent({ format: attrs.outputFormat })
  ) {
    editor.setContent(val);
  }
}

function destory() {
  if (tinymce !== null) {
    tinymce?.remove?.(unref(initOptions).selector!);
  }
}

function filePicker(cb: Function, _val: any, meta: Record<string, any>) {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  if (meta.filetype === 'image') {
    input.setAttribute('accept', 'image/*');
  }
  if (meta.filetype === 'media') {
    input.setAttribute('accept', 'video/*');
  }
  input.addEventListener('change', async (e) => {
    const files = (e.target as HTMLInputElement)?.files;
    if (!files) return;
    const file = files[0];
    if (file) {
      const url = await uploadFileApi({ file });
      cb(url, { title: file.name });
    }
  });
  input.click();
}

watch(modelValue, (val, prevVal) => {
  editorRef.value && setValue(editorRef.value, val, prevVal);
});

watch(
  () => attrs.disabled,
  () => {
    const editor = unref(editorRef);
    if (!editor) {
      return;
    }
    editor.setMode(attrs.disabled ? 'readonly' : 'design');
  },
);

onMountedOrActivated(() => {
  if (!initOptions.value.inline) {
    tinymceId.value = buildShortUUID('tiny-vue');
  }
  nextTick(() => {
    setTimeout(initEditor, 30);
  });
});

onBeforeUnmount(destory);
onDeactivated(destory);
</script>

<template>
  <div :style="{ width: containerWidth }" class="tinymce__wrapper">
    <textarea
      :id="tinymceId"
      ref="elRef"
      :style="{ visibility: 'hidden' }"
    ></textarea>
  </div>
</template>

<style lang="scss">
.tinymce__wrapper {
  .tox {
    &-tinymce {
      @apply rounded-md;
    }
  }
}
</style>
