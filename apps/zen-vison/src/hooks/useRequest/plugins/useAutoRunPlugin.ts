import type { UseRequestPlugin } from '../types';

import { ref, unref, watch } from 'vue';

// support refreshDeps & ready
const useAutoRunPlugin: UseRequestPlugin<any, any[]> = (
  fetchInstance,
  {
    defaultParams = [],
    manual,
    ready = true,
    refreshDeps = [],
    refreshDepsAction,
  },
) => {
  const hasAutoRun = ref(false);

  watch(
    () => unref(ready),
    (readyVal) => {
      if (!unref(manual) && readyVal) {
        hasAutoRun.value = true;
        fetchInstance.run(...defaultParams);
      }
    },
  );

  if (refreshDeps.length > 0) {
    watch(refreshDeps, () => {
      if (hasAutoRun.value) {
        return;
      }
      if (!manual) {
        if (refreshDepsAction) {
          refreshDepsAction();
        } else {
          fetchInstance.refresh();
        }
      }
    });
  }

  return {
    onBefore: () => {
      if (!unref(ready)) {
        return { stopNow: true };
      }
    },
  };
};

useAutoRunPlugin.onInit = ({ manual, ready = true }) => {
  return {
    loading: !unref(manual) && unref(ready),
  };
};

export default useAutoRunPlugin;
