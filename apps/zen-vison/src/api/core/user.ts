import type { UserInfo } from '@vben/types';

/**
 * 获取用户信息
 */
export async function getUserInfo() {
  // return requestClient.get<UserInfo>('/user/info');
  return {
    id: 0,
    realName: 'Zen',
    roles: ['super'],
    username: 'zen',
  } as unknown as UserInfo;
}
