import type { ZenWebSocketEvents } from './typing';

import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';

import mitt from 'mitt';

const { websocketURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

export const wsEmitter = mitt<ZenWebSocketEvents>();

export function initWebSocketClient() {
  const accessStore = useAccessStore();
  const fullURL = `${websocketURL}?token=${accessStore.accessToken}`;
  const ws = new WebSocket(fullURL);

  ws.addEventListener('open', (e) => {
    wsEmitter.emit('connect-open', e);
  });

  ws.addEventListener('message', (e) => {
    const data = e.data;
    // 心跳检测
    if (data === 'pong') {
      return;
    }

    try {
      const message: {
        content: string;
        type: keyof ZenWebSocketEvents;
      } = JSON.parse(data);

      if (!message.type) {
        return;
      }
      const content = JSON.parse(message.content);
      wsEmitter.emit(message.type, content);
    } catch (error) {
      wsEmitter.emit('parse-error', error as Error);
      console.error('消息解析错误', error);
    }
  });

  ws.addEventListener('close', (e) => {
    wsEmitter.emit('connect-close', e);
  });

  ws.addEventListener('error', (e) => {
    wsEmitter.emit('connect-error', e);
    console.error('连接异常', e);
  });
}
