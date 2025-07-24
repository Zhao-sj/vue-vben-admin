<script setup lang="ts">
import { Page } from '@vben/common-ui';

import { getUserProfileApi } from '#/api';
import { DictTypeEnum } from '#/enums';
import { useRequest } from '#/hooks';
import { useDictStore } from '#/store';

import { useTabList } from './data';
import {
  AccountBind,
  BasicInfo,
  BasicSetting,
  SecuritySetting,
} from './modules';

const dictStore = useDictStore();
dictStore.initDictData(DictTypeEnum.SEX);

const { data, run } = useRequest(getUserProfileApi);

const tabList = useTabList();

const activeTab = ref(tabList[0]?.key);

const tabs = {
  BasicSetting,
  SecuritySetting,
  AccountBind,
};
</script>

<template>
  <Page auto-content-height>
    <div v-if="data" class="flex flex-col gap-4 xl:flex-row xl:items-start">
      <div class="bg-card rounded-xl p-4 xl:w-1/3">
        <BasicInfo :data />
      </div>

      <div class="bg-card rounded-xl px-4 pb-4 pt-2 xl:w-2/3">
        <ElTabs v-model="activeTab">
          <template v-for="item in tabList" :key="item.key">
            <ElTabPane :label="item.name" :name="item.key">
              <component
                :is="tabs[item.component as keyof typeof tabs]"
                :data
                @success="run"
              />
            </ElTabPane>
          </template>
        </ElTabs>
      </div>
    </div>
  </Page>
</template>
