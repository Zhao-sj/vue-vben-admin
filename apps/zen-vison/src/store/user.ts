import type { Nullable } from '@vben/types';

import type { AuthApi } from '#/api';

import { defineStore } from 'pinia';

interface UserState {
  roles: string[];
  userInfo: Nullable<AuthApi.User>;
}

export const useUserStore = defineStore('zen-user', {
  actions: {
    setRoles(roles: string[]) {
      this.roles = roles;
    },
    setUserInfo(userInfo: AuthApi.User) {
      this.userInfo = userInfo;
    },
  },
  getters: {
    userId(): number | undefined {
      return this.userInfo?.id;
    },
  },
  state: (): UserState => ({
    roles: [],
    userInfo: null,
  }),
});
