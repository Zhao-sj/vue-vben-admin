import type { UseRequestPlugin } from '../types';
import type { CachedData } from '../utils/cache';

import { onUnmounted, ref, watchEffect } from 'vue';

import { getCache, setCache } from '../utils/cache';
import { getCachePromise, setCachePromise } from '../utils/cachePromise';
import { subscribe, trigger } from '../utils/cacheSubscribe';

const useCachePlugin: UseRequestPlugin<any, any[]> = (
  fetchInstance,
  {
    cacheKey,
    cacheTime = 5 * 60 * 1000,
    getCache: customGetCache,
    setCache: customSetCache,
    staleTime = 0,
  },
) => {
  const unSubscribeRef = ref<() => void>();
  const currentPromiseRef = ref<Promise<any>>();

  const _setCache = (key: string, cachedData: CachedData) => {
    customSetCache
      ? customSetCache(cachedData)
      : setCache(key, cacheTime, cachedData);
    trigger(key, cachedData.data);
  };

  const _getCache = (key: string, params: any[] = []) => {
    return customGetCache ? customGetCache(params) : getCache(key);
  };

  watchEffect(() => {
    if (!cacheKey) return;

    // get data from cache when init
    const cacheData = _getCache(cacheKey);
    if (cacheData && Object.hasOwnProperty.call(cacheData, 'data')) {
      fetchInstance.state.data = cacheData.data;
      fetchInstance.state.params = cacheData.params;

      if (staleTime === -1 || Date.now() - cacheData.time <= staleTime) {
        fetchInstance.state.loading = false;
      }
    }

    // subscribe same cachekey update, trigger update
    unSubscribeRef.value = subscribe(cacheKey, (data) => {
      fetchInstance.setState({ data });
    });
  });

  onUnmounted(() => {
    unSubscribeRef.value?.();
  });

  if (!cacheKey) {
    return {};
  }

  return {
    onBefore: (params) => {
      const cacheData = _getCache(cacheKey, params);

      if (!cacheData || !Object.hasOwnProperty.call(cacheData, 'data')) {
        return {};
      }

      // If the data is fresh, stop request
      return staleTime === -1 || Date.now() - cacheData.time <= staleTime
        ? {
            data: cacheData?.data,
            error: undefined,
            loading: false,
            returnNow: true,
          }
        : { data: cacheData?.data, error: undefined }; // If the data is stale, return data, and request continue
    },
    onMutate: (data) => {
      if (cacheKey) {
        // cancel subscribe, avoid trigger self
        unSubscribeRef.value?.();

        _setCache(cacheKey, {
          data,
          params: fetchInstance.state.params,
          time: Date.now(),
        });

        // resubscribe
        unSubscribeRef.value = subscribe(cacheKey, (d) => {
          fetchInstance.setState({ data: d });
        });
      }
    },
    onRequest: (service, args) => {
      let servicePromise = getCachePromise(cacheKey);

      // If has servicePromise, and is not trigger by self, then use it
      if (servicePromise && servicePromise !== currentPromiseRef.value) {
        return { servicePromise };
      }

      servicePromise = service(...args);
      currentPromiseRef.value = servicePromise;
      setCachePromise(cacheKey, servicePromise);

      return { servicePromise };
    },
    onSuccess: (data, params) => {
      if (cacheKey) {
        // cancel subscribe, avoid trgger self
        unSubscribeRef.value?.();

        _setCache(cacheKey, { data, params, time: Date.now() });

        // resubscribe
        unSubscribeRef.value = subscribe(cacheKey, (d) => {
          fetchInstance.setState({ data: d });
        });
      }
    },
  };
};

export default useCachePlugin;
