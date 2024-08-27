<script setup lang="ts">
import { assignUserRoleApi, type BaseSimple, type UserApi } from '#/api';
import { useRequest } from '#/hooks';
import { $t } from '#/locales';

interface Props {
  roleList?: BaseSimple[];
  data?: UserApi.User;
  roleIds?: number[];
}

type FormState = { roleIds: number[] } & Pick<
  UserApi.User,
  'nickname' | 'username'
>;

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  roleIds: () => [],
  roleList: () => [],
});

const modelValue = defineModel<boolean>('modelValue');

const formState = ref<Partial<FormState>>({});

const { loading, runAsync } = useRequest(assignUserRoleApi, {
  loadingDelay: 200,
  manual: true,
});

function handleOpen() {
  const { data, roleIds } = props;
  const state: Partial<FormState> = { roleIds };
  if (data) {
    state.nickname = data.nickname;
    state.username = data.username;
  }
  formState.value = state;
}

async function handleSubmit() {
  if (!props.data) {
    return;
  }

  await runAsync({
    roleIds: formState.value.roleIds!,
    userId: props.data.id,
  });
  ElMessage.success($t('zen.common.successTip'));
  modelValue.value = false;
}
</script>

<template>
  <ElDialog
    v-model="modelValue"
    :close-on-click-modal="false"
    :title="$t('zen.service.user.assignRole')"
    class="!w-11/12 md:!w-1/3 2xl:!w-1/5"
    destroy-on-close
    draggable
    width="auto"
    @open="handleOpen"
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

    <template #footer>
      <ElButton @click="modelValue = false">
        {{ $t('zen.common.cancel') }}
      </ElButton>
      <ElButton :loading type="primary" @click="handleSubmit">
        {{ $t('zen.common.confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>
