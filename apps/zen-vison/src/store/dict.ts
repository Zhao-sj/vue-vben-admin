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
  actions: {
    getDictData(type: DictTypeEnum, value: string) {
      return this.getDictDataList(type).find((item) => item.value === value);
    },

    getDictDataList(type: DictTypeEnum) {
      return this.dictData[type] || [];
    },

    getLoginResult(value: number | string) {
      return this.getDictData(DictTypeEnum.LOGIN_RESULT, value.toString());
    },

    getLoginType(value: number | string) {
      return this.getDictData(DictTypeEnum.LOGIN_TYPE, value.toString());
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

    getRoleType(value: number | string) {
      return this.getDictData(DictTypeEnum.ROLE_TYPE, value.toString());
    },

    getSex(value: number | string) {
      return this.getDictData(DictTypeEnum.SEX, value.toString());
    },

    getStatus(value: number | string) {
      return this.getDictData(DictTypeEnum.STATUS, value.toString());
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
  state: (): DictState => ({
    dictData: {} as DictData,
    loading: false,
  }),
});
