<script setup lang="ts">
import { Nullable } from '@vben/types';

import { type AuthApi, checkCaptchaApi, getCaptchaApi } from '#/api';
import { CaptchaEnum, ResultEnum } from '#/enums';
import { AesEncryption } from '#/utils';

import BlockPuzzle from './BlockPuzzle.vue';
import ClickWord from './ClickWord.vue';

interface Props {
  random?: boolean;
  type?: CaptchaEnum;
}

interface Emits {
  (e: 'success', captcha: string): void;
}

defineOptions({ name: 'Captcha' });
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const dialogVisible = defineModel<boolean>('modelValue');

const captchaTypes = [CaptchaEnum.BLOCK_PUZZLE, CaptchaEnum.CLICK_WORD];
const captchaType = ref(props.type || captchaTypes[0]);
const dialogRef =
  ref<Nullable<{ dialogContentRef: { $el: HTMLDivElement } }>>(null);
const loading = ref(false);
const showFeedback = ref(false);
const isSuccess = ref(false);
const dialogOffsetLeft = ref(0);
const captchaData = ref<Nullable<AuthApi.CaptchaResp>>(null);

function covert2DataUrl(base64: string) {
  return `data:image/png;base64,${base64}`;
}

async function getCaptcha() {
  if (props.random) {
    captchaType.value =
      captchaTypes[Math.floor(Math.random() * captchaTypes.length)];
  }

  try {
    loading.value = true;
    const ret = await getCaptchaApi(captchaType.value);

    if (ret.basemap) {
      ret.basemap = covert2DataUrl(ret.basemap);
    }

    if (ret.slider) {
      ret.slider = covert2DataUrl(ret.slider);
    }

    captchaData.value = ret;
  } catch (error) {
    dialogVisible.value = false;
    throw new Error(error as any);
  } finally {
    loading.value = false;
  }
}

function getDialogOffsetLeft() {
  dialogOffsetLeft.value = dialogRef.value!.dialogContentRef.$el.offsetLeft;
}

function encryptData(data: string) {
  const { secretKey, token } = captchaData.value!;
  let captcha = `${token}---${data}`;
  let pointJson = data;
  if (secretKey) {
    const encryption = new AesEncryption({ key: secretKey });
    pointJson = encryption.encryptByAES(data)!;
    captcha = encryption.encryptByAES(captcha)!;
  }

  return { captcha, pointJson };
}

async function handleValidate(data: string) {
  loading.value = true;
  const { captcha, pointJson } = encryptData(data);
  const { code } = await checkCaptchaApi({
    captchaType: captchaType.value,
    pointJson,
    token: captchaData.value!.token,
  });

  loading.value = false;
  isSuccess.value = code === ResultEnum.SUCCESS;
  showFeedback.value = true;
  setTimeout(async () => {
    if (!isSuccess.value) {
      await getCaptcha();
      showFeedback.value = false;
      return;
    }
    dialogVisible.value = false;
    emit('success', captcha);
  }, 1200);
}

watch(dialogVisible, (dialogVisible) => {
  if (dialogVisible) {
    showFeedback.value = false;
    getCaptcha();
  }
});
</script>

<template>
  <ElDialog
    ref="dialogRef"
    v-model="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :modal="false"
    append-to-body
    title="请完成安全验证"
    width="fit-content"
  >
    <div v-loading="loading">
      <BlockPuzzle
        v-if="CaptchaEnum.BLOCK_PUZZLE === captchaType"
        :base-offset-left="dialogOffsetLeft"
        :data="captchaData"
        :is-success="isSuccess"
        :show-feedback="showFeedback"
        @load="getDialogOffsetLeft"
        @refresh="getCaptcha"
        @validate="handleValidate"
      />

      <ClickWord
        v-if="CaptchaEnum.CLICK_WORD === captchaType"
        :data="captchaData"
        :is-success="isSuccess"
        :show-feedback="showFeedback"
        @refresh="getCaptcha"
        @validate="handleValidate"
      />
    </div>
  </ElDialog>
</template>
