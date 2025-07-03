import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { ArticleApi, CategoryApi } from '#/api';
import type { ActionItem } from '#/components';

import { useIsMobile } from '@vben/hooks';

import {
  buildMenuTree,
  getCmsCategorySimpleApi,
  getCmsTagSimpleApi,
} from '#/api';
import { DictTypeEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'ImageUpload',
      fieldName: 'banner',
      label: $t('cms.article.banner'),
      formItemClass: 'col-span-3 lg:col-span-1 lg:row-span-2',
      rules: 'selectRequired',
    },
    {
      component: 'ApiCascader',
      componentProps: {
        api: getCmsCategorySimpleApi,
        afterFetch: (data: CategoryApi.Simple[]) => buildMenuTree(data),
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
        class: 'w-full',
      },
      fieldName: 'categoryId',
      label: $t('cms.article.category'),
      formItemClass: 'col-span-3 lg:col-span-1',
      rules: 'selectRequired',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        isButton: true,
        options: dictStore
          .getDictDataList(DictTypeEnum.ARTICLE_STATUS)
          .map((item) => ({
            ...item,
            value: +item.value,
          })),
      },
      defaultValue: 10,
      fieldName: 'status',
      label: $t('cms.article.status'),
      formItemClass: 'col-span-3 lg:col-span-1',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getCmsTagSimpleApi,
        labelField: 'name',
        valueField: 'id',
        multiple: true,
        multipleLimit: 5,
      },
      fieldName: 'tagIds',
      formItemClass: 'col-span-3 lg:col-span-2',
      label: $t('cms.article.tag'),
    },
    {
      component: 'Input',
      fieldName: 'title',
      formItemClass: 'col-span-3',
      label: $t('cms.article.title'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        autosize: {
          maxRows: 5,
          minRows: 3,
        },
        showWordLimit: true,
        maxlength: 200,
        resize: 'none',
        type: 'textarea',
      },
      fieldName: 'description',
      formItemClass: 'col-span-3',
      label: $t('cms.article.description'),
      labelClass: 'self-start h-8',
    },
    {
      component: 'Input',
      componentProps: {
        width: '100%',
        height: 450,
        options: {
          auto_focus: false,
          placeholder: $t('page.pleaseInput'),
        },
      },
      fieldName: 'content',
      formItemClass: 'col-span-3 flex-col items-start',
      label: $t('cms.article.content'),
      labelClass: 'mb-2',
      rules: 'required',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    // TODO 添加状态筛选
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('cms.article.title'),
    },
    {
      component: 'Input',
      fieldName: 'description',
      label: $t('cms.article.description'),
    },
    {
      component: 'ApiCascader',
      componentProps: {
        api: getCmsCategorySimpleApi,
        afterFetch: (data: CategoryApi.Simple[]) => buildMenuTree(data),
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
      },
      fieldName: 'categoryId',
      label: $t('cms.article.category'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: getCmsTagSimpleApi,
        labelField: 'name',
        valueField: 'id',
        multiple: true,
        multipleLimit: 3,
      },
      fieldName: 'tagIds',
      label: $t('cms.article.tag'),
    },
    {
      component: 'Input',
      fieldName: 'publicId',
      label: $t('cms.article.publicId'),
      help: $t('cms.article.help.publicId'),
    },
    {
      component: 'DatePicker',
      componentProps: {
        placeholder: $t('page.date.placeholder.between'),
        range: true,
        multiCalendars: {
          solo: true,
        },
      },
      fieldName: 'createTime',
      label: $t('page.createTime'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<ArticleApi.Article>,
): VxeTableGridOptions<ArticleApi.Article>['columns'] {
  return [
    {
      field: 'id',
      minWidth: 80,
      title: $t('cms.article.id'),
    },
    {
      field: 'banner',
      minWidth: 100,
      title: $t('cms.article.banner'),
      cellRender: {
        name: 'CellImage',
        props: {
          class: 'max-h-16 rounded-md',
          fit: 'cover',
          lazy: true,
        },
      },
    },
    {
      field: 'title',
      minWidth: 200,
      title: $t('cms.article.title'),
      showOverflow: true,
    },
    {
      field: 'description',
      minWidth: 300,
      title: $t('cms.article.description'),
      formatter: 'formatBlank',
      showOverflow: true,
    },
    {
      field: 'categoryName',
      minWidth: 100,
      title: $t('cms.article.category'),
    },
    {
      field: 'tagList',
      minWidth: 200,
      title: $t('cms.article.tag'),
      cellRender: {
        name: 'CellTags',
        props: {
          label: 'name',
        },
      },
    },
    {
      field: 'status',
      minWidth: 100,
      title: $t('cms.article.status'),
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.ARTICLE_STATUS,
        },
      },
    },
    {
      field: 'viewCount',
      minWidth: 100,
      title: $t('cms.article.viewCount'),
      formatter: 'formatThousand',
    },
    {
      field: 'likeCount',
      minWidth: 100,
      title: $t('cms.article.likeCount'),
      formatter: 'formatThousand',
      visible: false,
    },
    {
      field: 'commentCount',
      minWidth: 100,
      title: $t('cms.article.commentCount'),
      formatter: 'formatThousand',
      visible: false,
    },
    {
      field: 'favoriteCount',
      minWidth: 100,
      title: $t('cms.article.favoriteCount'),
      formatter: 'formatThousand',
      visible: false,
    },
    {
      field: 'forwardCount',
      minWidth: 100,
      title: $t('cms.article.forwardCount'),
      formatter: 'formatThousand',
      visible: false,
    },
    {
      field: 'creatorName',
      minWidth: 100,
      title: $t('cms.article.author'),
      visible: false,
    },
    {
      field: 'createTime',
      minWidth: 150,
      title: $t('page.createTime'),
      formatter: 'formatDateTime',
    },
    {
      field: 'operate',
      title: $t('page.options'),
      width: 180,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: ArticleApi.Article) => {
            const actions: ActionItem[] = [
              {
                auth: 'cms:article:update',
                icon: 'ep:edit',
                btnText: $t('page.edit'),
                onClick: () => {
                  onActionClick({ code: 'edit', row });
                },
                type: 'primary',
              },
              {
                auth: 'cms:article:delete',
                icon: 'ep:delete',
                btnText: $t('page.delete'),
                popConfirm: {
                  on: {
                    confirm: () => {
                      onActionClick({ code: 'delete', row });
                    },
                  },
                  title: $t('page.confirmDelete'),
                },
                type: 'danger',
              },
            ];

            return { actions };
          },
        },
      },
    },
  ];
}
