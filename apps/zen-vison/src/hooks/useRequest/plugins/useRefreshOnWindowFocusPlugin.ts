import type { UseRequestPlugin } from '../types';

import { onUnmounted, ref, watchEffect } from 'vue';

import { limit } from '../utils/limit';
import subscribeFocus from '../utils/subscribeFocus';

const useRefreshOnWindowFocusPlugin: UseRequestPlugin<any, any[]> = (
  fetchInstance,
  { focusTimespan = 5000, refreshOnWindowFocus },
) => {
  const unsubscribeRef = ref<() => void>();

  const stopSubscribe = () => {
    unsubscribeRef.value?.();
  };

  watchEffect(() => {
    if (refreshOnWindowFocus) {
      const limitRefresh = limit(
        fetchInstance.refresh.bind(fetchInstance),
        focusTimespan,
      );
      unsubscribeRef.value = subscribeFocus(() => {
        limitRefresh();
      });
    }

    return () => {
      stopSubscribe();
    };
  });

  onUnmounted(() => {
    stopSubscribe();
  });

  return {};
};

export default useRefreshOnWindowFocusPlugin;
