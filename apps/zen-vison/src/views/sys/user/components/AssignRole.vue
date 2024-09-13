<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import {
  assignUserRoleApi,
  getRoleSimpleListApi,
  getUserApi,
  getUserRoleListApi,
  type UserApi,
} from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

type FormState = { roleIds: number[] } & Pick<
  UserApi.User,
  'id' | 'nickname' | 'username'
>;

const requestConf = {
  loadingDelay: 200,
  manual: true,
};

const formState = ref<Partial<FormState>>({});

const {
  data: roleList,
  loading: roleLoading,
  runAsync: getRole,
} = useRequest(getRoleSimpleListApi, requestConf);

const { loading: roleIdsLoading, runAsync: getRoleIds } = useRequest(
  getUserRoleListApi,
  requestConf,
);

const { loading: userLoading, runAsync: getUser } = useRequest(
  getUserApi,
  requestConf,
);

const { loading, runAsync } = useRequest(assignUserRoleApi, requestConf);

const [Modal, modal] = useVbenModal({ onConfirm, onOpenChange });

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
    formState.value = {};
    return;
  }

  const { id } = modal.getData();
  if (id) {
    const [user, roleIds] = await Promise.all([
      getUser(id),
      getRoleIds(id),
      getRole(),
    ]);

    const state: Partial<FormState> = {
      id: user.id,
      nickname: user.nickname,
      roleIds,
      username: user.username,
    };

    formState.value = state;
  }
}

async function onConfirm() {
  const { id, roleIds } = formState.value;
  if (!id || !roleIds) {
    return;
  }

  await runAsync({ roleIds, userId: id });
  ElMessage.success($t('zen.common.successTip'));
  modal.close();
}
</script>

<template>
  <Modal
    :close-on-click-modal="false"
    :confirm-loading="loading"
    :loading="roleLoading || roleIdsLoading || userLoading"
    :title="$t('zen.service.user.assignRole')"
    class="w-11/12 md:w-1/3 2xl:w-1/5"
    draggable
  >
    <ElForm :label-width="80" :model="formState">
      <ElRow :gutter="20">
        <ElCol :xs="24">
          <ElFormItem :label="$t('zen.service.user.username')">
            <ElInput :model-value="formState.username" disabled />
          </ElFormItem>
        </ElCol>

        <ElCol :xs="24">
          <ElFormItem :label="$t('zen.service.user.nickname')">
            <ElInput :model-value="formState.nickname" disabled />
          </ElFormItem>
        </ElCol>

        <ElCol :xs="24">
          <ElFormItem :label="$t('zen.service.user.userRole')">
            <ElSelect v-model="formState.roleIds" clearable multiple>
              <ElOption
                v-for="item in roleList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
  </Modal>
</template>
