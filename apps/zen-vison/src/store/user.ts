import type { Nullable } from '@vben/types';

import type { AuthApi } from '#/api';

import { defineStore } from 'pinia';

interface UserState {
  tenantId: Nullable<number>;
  roles: string[];
  userInfo: Nullable<AuthApi.User>;
}

export const useUserStore = defineStore('zen-user', {
  actions: {
    setTenantId(id: number) {
      this.tenantId = id;
    },
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
    tenantId: null,
    roles: [],
    userInfo: null,
  }),
  persist: {
    pick: ['tenantId'],
  },
});
