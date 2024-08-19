import type { UseRequestPlugin, UseRequestTimeout } from '../types';

import { ref } from 'vue';

const useRetryPlugin: UseRequestPlugin<any, any[]> = (
  fetchInstance,
  { retryCount, retryInterval },
) => {
  const timerRef = ref<UseRequestTimeout>();
  const countRef = ref(0);

  const triggerByRetry = ref(false);

  if (!retryCount) {
    return {};
  }

  return {
    onBefore: () => {
      if (!triggerByRetry.value) {
        countRef.value = 0;
      }
      triggerByRetry.value = false;

      if (timerRef.value) {
        clearTimeout(timerRef.value);
      }
    },
    onCancel: () => {
      countRef.value = 0;
      if (timerRef.value) {
        clearTimeout(timerRef.value);
      }
    },
    onError: () => {
      countRef.value += 1;
      if (retryCount === -1 || countRef.value <= retryCount) {
        // Exponential backoff
        const timeout =
          retryInterval ?? Math.min(1000 * 2 ** countRef.value, 30_000);
        timerRef.value = setTimeout(() => {
          triggerByRetry.value = true;
          fetchInstance.refresh();
        }, timeout);
      } else {
        countRef.value = 0;
      }
    },
    onSuccess: () => {
      countRef.value = 0;
    },
  };
};

export default useRetryPlugin;
