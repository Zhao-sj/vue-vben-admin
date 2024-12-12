<script setup lang="ts">
import type { IPlayerOptions } from 'xgplayer';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { VideoPlayer } from '#/components';

interface Props {
  url: string;
}

const props = defineProps<Props>();

const options: IPlayerOptions = {
  url: props.url,
};

const [Modal, modal] = useVbenModal();
</script>

<template>
  <div>
    <video
      :src="props.url"
      class="h-16 cursor-pointer rounded-md"
      @click="modal.open()"
    ></video>

    <Modal
      :close-on-click-modal="false"
      :footer="false"
      :fullscreen-button="false"
      :title="$t('infra.file.list.preview.video')"
      class="lg:w-2/3 2xl:w-1/2"
      draggable
    >
      <div class="aspect-video w-full overflow-hidden rounded-lg">
        <VideoPlayer :options />
      </div>
    </Modal>
  </div>
</template>
