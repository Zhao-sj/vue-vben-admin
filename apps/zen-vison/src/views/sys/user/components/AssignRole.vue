<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { useVbenForm, type VbenFormSchema } from '#/adapter';
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

const formSchema = computed<VbenFormSchema[]>(() => [
  {
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    fieldName: 'username',
    label: $t('zen.service.user.username'),
  },
  {
    component: 'Input',
    componentProps: {
      disabled: true,
    },
    fieldName: 'nickname',
    label: $t('zen.service.user.nickname'),
  },
  {
    component: 'Select',
    componentProps: {
      clearable: true,
      multiple: true,
      options: roleList.value?.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      placeholder: $t('zen.common.pleaseSelect', [
        $t('zen.service.user.userRole'),
      ]),
    },
    fieldName: 'roleIds',
    label: $t('zen.service.user.userRole'),
  },
]);

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      labelClass: 'mr-4',
      labelWidth: 65,
    },
    schema: formSchema,
    showDefaultActions: false,
    wrapperClass: 'grid-cols-1',
  }),
);

async function onOpenChange(isOpen: boolean) {
  if (!isOpen) {
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

    formApi.setValues(state);
  }
}

async function onConfirm() {
  const { id, roleIds } = await formApi.getValues();
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
    <Form />
  </Modal>
</template>
