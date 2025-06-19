<script setup lang="ts">
import { VbenButton } from '@vben/common-ui';
import { X } from '@vben/icons';

import { checkCaptchaApi, getCaptchaApi } from '#/api';
import { CaptchaEnum, ResultEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { AesEncryption } from '#/utils';

import BlockPuzzle from './modules/block-puzzle.vue';
import ClickWord from './modules/click-word.vue';

interface Props {
  random?: boolean;
  type?: CaptchaEnum;
  showClose?: boolean;
}

interface Emits {
  (e: 'success', captcha: string): void;
  (e: 'fail'): void;
}

const props = withDefaults(defineProps<Props>(), {
  showClose: true,
  type: CaptchaEnum.BLOCK_PUZZLE,
});
const emit = defineEmits<Emits>();

const modelValue = defineModel<boolean>('modelValue');

const captchaTypes = [CaptchaEnum.BLOCK_PUZZLE, CaptchaEnum.CLICK_WORD];
const captchaType = ref(props.type);

const requestConf = {
  manual: true,
};

const {
  data,
  loading,
  runAsync: getData,
} = useRequest(getCaptcha, requestConf);
const { runAsync: checkCaptcha } = useRequest(checkCaptchaApi, requestConf);

const clickWordTip = computed(() => data.value?.wordList?.join(' '));

async function getCaptcha() {
  if (props.random) {
    captchaType.value =
      captchaTypes[Math.floor(Math.random() * captchaTypes.length)]!;
  }

  const ret = await getCaptchaApi(captchaType.value);

  if (ret.basemap) {
    ret.basemap = covert2DataUrl(ret.basemap);
  }

  if (ret.slider) {
    ret.slider = covert2DataUrl(ret.slider);
  }

  return ret;
}

function covert2DataUrl(base64: string) {
  return `data:image/png;base64,${base64}`;
}

function encryptPointJson(pointJsonStr: string) {
  const { secretKey, token } = data.value!;
  let captcha = `${token}---${pointJsonStr}`;
  let pointJson = pointJsonStr;
  if (secretKey) {
    const encryption = new AesEncryption({ key: secretKey });
    pointJson = encryption.encryptByAES(pointJsonStr)!;
    captcha = encryption.encryptByAES(captcha)!;
  }

  return { captcha, pointJson };
}

async function handleRefresh() {
  try {
    await getData();
  } catch {
    emit('fail');
    handleClose();
  }
}

async function handleValidate(pointJsonStr: string) {
  const { captcha, pointJson } = encryptPointJson(pointJsonStr);
  const { code } = await checkCaptcha({
    captchaType: captchaType.value,
    pointJson,
    token: data.value!.token,
  });

  const isPassing = code === ResultEnum.SUCCESS;
  if (isPassing) {
    setTimeout(() => {
      emit('success', captcha);
      handleClose();
    }, 1200);
  }

  return isPassing;
}

function handleClose() {
  modelValue.value = false;
}

watch(modelValue, (visible) => {
  visible && handleRefresh();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="bg-overlay fixed inset-0 z-[999] flex h-screen w-screen items-center justify-center"
      >
        <div
          class="bg-background modal-enter relative overflow-hidden rounded-md p-2 shadow-md"
          v-loading="loading"
        >
          <div :class="{ 'mb-3': captchaType === CaptchaEnum.BLOCK_PUZZLE }">
            <h2 class="text-sm">{{ $t('page.captcha.title') }}</h2>
            <p
              v-if="captchaType === CaptchaEnum.CLICK_WORD"
              class="text-lg font-bold"
            >
              {{ $t('page.captcha.clickWordTip', [clickWordTip]) }}
            </p>
          </div>

          <VbenButton
            v-if="showClose"
            class="absolute right-2 top-2 h-6 w-6 rounded-full"
            size="icon"
            variant="icon"
            @click="handleClose"
          >
            <X class="h-4 w-4" />
          </VbenButton>

          <div>
            <BlockPuzzle
              v-if="captchaType === CaptchaEnum.BLOCK_PUZZLE"
              :data
              :validate="handleValidate"
              @refresh="handleRefresh"
            />

            <ClickWord
              v-if="captchaType === CaptchaEnum.CLICK_WORD"
              :data
              :validate="handleValidate"
              @refresh="handleRefresh"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="css" scoped>
.modal-enter {
  animation: modal-fade-in 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.4) forwards;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
    transform: scale(0.1);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
