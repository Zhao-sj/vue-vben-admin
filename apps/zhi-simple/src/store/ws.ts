import type { Nullable } from '@vben/types';

import type { NoticeApi } from '#/api';

import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';

import mitt from 'mitt';
import { defineStore } from 'pinia';

const { websocketURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

type WsEvents = {
  'connect-close': Event;
  'connect-error': Event;
  'connect-open': Event;
  'notice-push': NoticeApi.Notice;
  'parse-error': Error;
};

export const useWsStore = defineStore('zen-ws', () => {
  const accessStore = useAccessStore();

  let ws: Nullable<WebSocket> = null;
  const emitter = mitt<WsEvents>();
  const connecting = ref(false);

  if (accessStore.accessToken) {
    connect(accessStore.accessToken);
  }

  function connect(accessToken: string) {
    if (connecting.value) {
      return;
    }

    connecting.value = true;
    const fullURL = `${websocketURL}?token=${accessToken}`;
    ws = new WebSocket(fullURL);

    ws.addEventListener('open', (e) => {
      emitter.emit('connect-open', e);
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
          type: keyof WsEvents;
        } = JSON.parse(data);

        if (!message.type) {
          return;
        }
        const content = JSON.parse(message.content);
        emitter.emit(message.type, content);
      } catch (error) {
        emitter.emit('parse-error', error as Error);
        console.error('消息解析错误', error);
      }
    });

    ws.addEventListener('close', (e) => {
      ws = null;
      emitter.emit('connect-close', e);
    });

    ws.addEventListener('error', (e) => {
      emitter.emit('connect-error', e);
      console.error('连接异常', e);
    });

    connecting.value = false;
  }

  function disconnect(clearEmitter = false) {
    if (connecting.value) {
      return;
    }

    ws?.close();
    ws = null;

    if (clearEmitter) {
      emitter.all.clear();
    }
  }

  function $reset() {
    disconnect();
  }

  return {
    $reset,
    emitter,
    connect,
    disconnect,
  };
});
