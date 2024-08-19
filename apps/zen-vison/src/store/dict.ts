import { defineStore } from 'pinia';

import { type DictApi, getDictDataSimpleListApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';

type DictData = Record<DictTypeEnum, DictApi.DataSimple[]>;

interface DictState {
  dictData: DictData;
}

export const useDictStore = defineStore('zen-dict', {
  actions: {
    getDictData(type: DictTypeEnum, value: string) {
      return this.getDictDataList(type).find((item) => item.value === value);
    },

    getDictDataList(type: DictTypeEnum) {
      return this.dictData[type] || [];
    },

    getStatus(value: number | string) {
      return this.getDictData(DictTypeEnum.STATUS, value.toString());
    },

    initDictData(type: DictTypeEnum) {
      if (Reflect.has(this.dictData, type)) {
        return;
      }

      const { run } = useRequest(getDictDataSimpleListApi, {
        manual: true,
        onSuccess: (data) => {
          this.dictData[type] = data;
        },
      });

      run(type);
    },
  },
  state: (): DictState => ({
    dictData: {} as DictData,
  }),
});
