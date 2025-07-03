import type { DictApi } from '#/api';

import { defineStore } from 'pinia';

import { getDictDataSimpleListApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';

type DictData = Record<DictTypeEnum, DictApi.DataSimple[]>;

interface DictState {
  loading: boolean;
  dictData: DictData;
}

export const useDictStore = defineStore('zen-dict', {
  state: (): DictState => ({
    dictData: {} as DictData,
    loading: false,
  }),
  actions: {
    getDictData(type: DictTypeEnum, value: string) {
      return this.getDictDataList(type).find((item) => item.value === value);
    },

    getDictDataList(type: DictTypeEnum) {
      return this.dictData[type] || [];
    },

    initDictData(...types: DictTypeEnum[]) {
      const dictTypes = types.filter(
        (item) => !Reflect.has(this.dictData, item),
      );

      dictTypes.forEach((type) =>
        useRequest(getDictDataSimpleListApi, {
          defaultParams: [type],
          onBefore: () => (this.loading = true),
          onFinally: () => (this.loading = false),
          onSuccess: (data) => {
            this.dictData[type] = data;
          },
        }),
      );
    },

    async loadDictData(type: DictTypeEnum) {
      if (Reflect.has(this.dictData, type)) {
        return this.dictData[type];
      }

      const data = await getDictDataSimpleListApi(type);
      this.dictData[type] = data;
      return data;
    },
  },
});
