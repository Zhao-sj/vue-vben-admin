<script setup lang="ts">
import type { Nullable } from '@vben/types';

import { usePreferences } from '@vben/preferences';

import Player, { type IPlayerOptions } from 'xgplayer';

import 'xgplayer/dist/index.min.css';
import './index.scss';

interface Props {
  options?: IPlayerOptions;
}

const props = defineProps<Props>();
let player: Nullable<Player> = null;
defineExpose({ player });

const { locale } = usePreferences();

const videoRef = ref<HTMLDivElement>();

function initPlayer() {
  player = new Player({
    el: videoRef.value,
    height: '100%',
    width: '100%',
    ...props.options,
  });

  togglePlayerLang();
}

function togglePlayerLang() {
  if (player) {
    player.lang = locale.value === 'zh-CN' ? 'zh-cn' : 'en';
  }
}

onMounted(initPlayer);
watch(locale, togglePlayerLang);
</script>

<template>
  <div ref="videoRef"></div>
</template>
