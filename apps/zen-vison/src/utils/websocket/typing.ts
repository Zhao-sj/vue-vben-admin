import type { NoticeApi } from '#/api';

export type ZenWebSocketEvents = {
  'connect-close': Event;
  'connect-error': Event;
  'connect-open': Event;
  'notice-push': NoticeApi.Notice;
  'parse-error': Error;
};
