<script setup lang="ts">
import type { InputInstance, InputProps } from 'element-plus';

import { getCurrentInstance, h } from 'vue';

import { zxcvbn } from '@zxcvbn-ts/core';
import { ElInput } from 'element-plus';

interface Props extends Partial<InputProps> {
  showInput?: boolean;
}

interface Emits {
  (e: 'scoreChange', score: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'password',
  showPassword: true,
  showInput: true,
});

const emit = defineEmits<Emits>();

defineExpose<InputInstance>();

const vm = getCurrentInstance();

function changeRef(inputInstance: any) {
  if (vm) {
    vm.exposeProxy = inputInstance || {};
  }
}

const getPasswordStrength = computed(() => {
  const { disabled, modelValue } = props;
  if (disabled) return -1;
  const score = modelValue ? zxcvbn(`${modelValue}`).score : -1;
  emit('scoreChange', score);
  return score;
});
</script>

<template>
  <div class="strength-meter bg-background w-full">
    <component
      v-if="showInput"
      :is="h(ElInput, { ...$attrs, ...props, ref: changeRef }, $slots)"
    />

    <div class="strength-meter__bar bg-border relative mt-1 h-1.5 rounded-full">
      <div
        class="strength-meter__progress"
        :data-score="getPasswordStrength"
      ></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.strength-meter {
  &__bar {
    &::before,
    &::after {
      position: absolute;
      z-index: 10;
      display: block;
      width: 20%;
      height: inherit;
      content: '';
      background-color: transparent;
      border-color: hsl(var(--background));
      border-style: solid;
      border-width: 0 6px;
    }

    &::before {
      left: 20%;
    }

    &::after {
      right: 20%;
    }
  }

  &__progress {
    position: absolute;
    width: 0;
    height: inherit;
    background-color: transparent;
    border-radius: inherit;
    transition:
      width 0.5s ease-in-out,
      background 0.25s;

    &[data-score='0'] {
      width: 20%;
      background-color: hsl(var(--destructive));
    }

    &[data-score='1'] {
      width: 40%;
      background-color: hsl(359.33deg 100% 75.1%);
    }

    &[data-score='2'] {
      width: 60%;
      background-color: hsl(var(--warning));
    }

    &[data-score='3'] {
      width: 80%;
      background-color: hsl(144deg 57% 38%);
    }

    &[data-score='4'] {
      width: 100%;
      background-color: hsl(var(--success));
    }
  }
}
</style>
