import { type Editor } from 'tinymce/tinymce';

export function customRegistry(editor: Editor) {
  editor.ui.registry.addIcon(
    'indent2em',
    '<svg width="18" height="18" viewBox="0 0 1024 1024"><path d="M51.2 613.376V478.72h921.6v134.656H51.2z m0 359.424v-134.656h921.6V972.8H51.2zM489.984 253.44V118.784H972.8v134.656H489.984zM51.2 321.024V51.2l263.168 134.656L51.2 321.024z" p-id="5500"></path></svg>',
  );

  editor.ui.registry.addToggleButton('indent2em', {
    icon: 'indent2em',
    tooltip: '段落首行缩进',
    onAction() {
      // 获取当前选中的块级元素
      const blockElement = editor.selection.getNode() as HTMLElement;

      // 检查当前元素是否已有缩进样式
      const hasIndent = blockElement.style.textIndent === '2em';

      // 切换缩进样式
      editor.dom.setStyle(blockElement, 'text-indent', hasIndent ? '' : '2em');
    },
    // 设置按钮状态
    onSetup(api) {
      const checkState = () => {
        const blockElement = editor.selection.getNode() as HTMLElement;
        api.setActive(blockElement.style.textIndent === '2em');
      };

      // 监听内容变化和选择变化
      editor.on('NodeChange', checkState);

      return () => {
        editor.off('NodeChange', checkState);
      };
    },
  });
}
