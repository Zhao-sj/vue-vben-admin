import type { DebouncedFunc, ThrottleSettings } from 'lodash-es';

import type { UseRequestPlugin } from '../types';

import { ref, watchEffect } from 'vue';

import { throttle } from 'lodash-es';

const useThrottlePlugin: UseRequestPlugin<any, any[]> = (
  fetchInstance,
  { throttleLeading, throttleTrailing, throttleWait },
) => {
  const throttledRef = ref<DebouncedFunc<any>>();

  const options: ThrottleSettings = {};
  if (throttleLeading !== undefined) {
    options.leading = throttleLeading;
  }
  if (throttleTrailing !== undefined) {
    options.trailing = throttleTrailing;
  }

  watchEffect(() => {
    if (throttleWait) {
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance);

      throttledRef.value = throttle(
        (callback) => {
          callback();
        },
        throttleWait,
        options,
      );

      // throttle runAsync should be promise
      // https://github.com/lodash/lodash/issues/4400#issuecomment-834800398
      fetchInstance.runAsync = (...args) => {
        return new Promise((resolve, reject) => {
          throttledRef.value?.(() => {
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject);
          });
        });
      };

      return () => {
        fetchInstance.runAsync = _originRunAsync;
        throttledRef.value?.cancel();
      };
    }
  });

  if (!throttleWait) {
    return {};
  }

  return {
    onCancel: () => {
      throttledRef.value?.cancel();
    },
  };
};

export default useThrottlePlugin;
