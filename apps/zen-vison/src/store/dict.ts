import { defineStore } from 'pinia';

import { type DictApi, getDictDataSimpleListApi } from '#/api';
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

    getLogProcess(value: number | string) {
      return this.getDictData(
        DictTypeEnum.ERROR_LOG_PROCESS_STATUS,
        value.toString(),
      );
    },

    getOperaType(value: number | string) {
      return this.getDictData(DictTypeEnum.OPERATE_TYPE, value.toString());
    },

    getSex(value: number | string) {
      return this.getDictData(DictTypeEnum.SEX, value.toString());
    },

    getUserType(value: number | string) {
      return this.getDictData(DictTypeEnum.USER_TYPE, value.toString());
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
  },
});
