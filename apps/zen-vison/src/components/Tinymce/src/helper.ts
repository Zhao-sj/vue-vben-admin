import type { AnyFunction } from '@vben/types';

const validEvents = new Set([
  'onActivate',
  'onAddUndo',
  'onBeforeAddUndo',
  'onBeforeExecCommand',
  'onBeforeGetContent',
  'onBeforePaste',
  'onBeforeRenderUI',
  'onBeforeSetContent',
  'onBlur',
  'onChange',
  'onClearUndos',
  'onClick',
  'onContextMenu',
  'onCopy',
  'onCut',
  'onDblclick',
  'onDeactivate',
  'onDirty',
  'onDrag',
  'onDragDrop',
  'onDragEnd',
  'onDragGesture',
  'onDragOver',
  'onDrop',
  'onExecCommand',
  'onFocus',
  'onFocusIn',
  'onFocusOut',
  'onGetContent',
  'onHide',
  'onInit',
  'onKeyDown',
  'onKeyPress',
  'onKeyUp',
  'onLoadContent',
  'onMouseDown',
  'onMouseEnter',
  'onMouseLeave',
  'onMouseMove',
  'onMouseOut',
  'onMouseOver',
  'onMouseUp',
  'onNodeChange',
  'onObjectResized',
  'onObjectResizeStart',
  'onObjectSelected',
  'onPaste',
  'onPostProcess',
  'onPostRender',
  'onPreProcess',
  'onProgressState',
  'onRedo',
  'onRemove',
  'onReset',
  'onSaveContent',
  'onSelectionChange',
  'onSetAttrib',
  'onSetContent',
  'onShow',
  'onSubmit',
  'onUndo',
  'onVisualAid',
]);

const isValidKey = (key: string) => validEvents.has(key);

export const bindHandlers = (
  initEvent: Event,
  listeners: any,
  editor: any,
): void => {
  Object.keys(listeners)
    .filter(isValidKey)
    .forEach((key: string) => {
      const handler = listeners[key];
      if (typeof handler === 'function') {
        if (key === 'onInit') {
          handler(initEvent, editor);
        } else {
          editor.on(key.slice(2), (e: any) => handler(e, editor));
        }
      }
    });
};

/**
 * 在 OnMounted 或者 OnActivated 时触发
 * @param hook 任何函数（包括异步函数）
 */
export function onMountedOrActivated(hook: AnyFunction) {
  let mounted: boolean;

  onMounted(() => {
    hook();
    nextTick(() => {
      mounted = true;
    });
  });

  onActivated(() => {
    if (mounted) {
      hook();
    }
  });
}

let unique = 0;
export function buildShortUUID(prefix = ''): string {
  const time = Date.now();
  const random = Math.floor(Math.random() * 1_000_000_000);
  unique++;
  return `${prefix}_${random}${unique}${String(time)}`;
}
