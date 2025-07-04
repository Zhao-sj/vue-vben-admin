import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DictApi, FileApi } from '#/api';

import { useIsMobile } from '@vben/hooks';

import { useGridActions } from '#/adapter/vxe-table';
import { DictTypeEnum, FileStorageEnum } from '#/enums';
import { $t } from '#/locales';
import { useDictStore } from '#/store';

const { isMobile } = useIsMobile();
const dictStore = useDictStore();

export function useFormSchema(isEdit = false): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('infra.file.config.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        autosize: {
          maxRows: 5,
          minRows: 3,
        },
        resize: 'none',
        type: 'textarea',
      },
      fieldName: 'remark',
      label: $t('infra.file.config.remark'),
      labelClass: 'self-start h-8',
    },
    {
      component: 'ApiSelect',
      componentProps: {
        disabled: isEdit,
        api: () => dictStore.loadDictData(DictTypeEnum.FILE_STORAGE),
        afterFetch: (data: DictApi.DataSimple[]) => {
          return data.map((item) => ({
            ...item,
            value: +item.value,
          }));
        },
      },
      fieldName: 'storage',
      label: $t('infra.file.config.storage'),
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      fieldName: 'config.domain',
      label: $t('infra.file.config.domain'),
      dependencies: {
        if: (values) => !!values.storage,
        required: (values) => values.storage !== FileStorageEnum.S3,
        triggerFields: ['storage'],
      },
    },
    {
      component: 'Input',
      fieldName: 'config.basePath',
      label: $t('infra.file.config.basePath'),
      rules: 'required',
      dependencies: {
        if(values) {
          const storage = values.storage;
          return (
            storage === FileStorageEnum.LOCAL ||
            storage === FileStorageEnum.FTP ||
            storage === FileStorageEnum.SFTP
          );
        },
        triggerFields: ['storage'],
      },
    },
    {
      component: 'Input',
      fieldName: 'config.host',
      formItemClass: 'lg:col-span-1',
      label: $t('infra.file.config.host'),
      rules: 'required',
      dependencies: {
        if: (values) =>
          values.storage === FileStorageEnum.FTP ||
          values.storage === FileStorageEnum.SFTP,
        triggerFields: ['storage'],
      },
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: '!w-full [&_input]:!text-left',
        controlsPosition: 'right',
        min: 1,
        max: 65_535,
      },
      fieldName: 'config.port',
      formItemClass: 'lg:col-span-1',
      label: $t('infra.file.config.port'),
      rules: 'required',
      dependencies: {
        if: (values) =>
          values.storage === FileStorageEnum.FTP ||
          values.storage === FileStorageEnum.SFTP,
        triggerFields: ['storage'],
      },
    },
    {
      component: 'Input',
      fieldName: 'config.username',
      formItemClass: 'lg:col-span-1',
      label: $t('infra.file.config.username'),
      rules: 'required',
      dependencies: {
        if: (values) =>
          values.storage === FileStorageEnum.FTP ||
          values.storage === FileStorageEnum.SFTP,
        triggerFields: ['storage'],
      },
    },
    {
      component: 'Input',
      componentProps: {
        clearable: false,
        showPassword: true,
        type: 'password',
      },
      fieldName: 'config.password',
      formItemClass: 'lg:col-span-1',
      label: $t('infra.file.config.password'),
      rules: 'required',
      dependencies: {
        if: (values) =>
          values.storage === FileStorageEnum.FTP ||
          values.storage === FileStorageEnum.SFTP,
        triggerFields: ['storage'],
      },
    },
    {
      component: 'RadioGroup',
      componentProps: {
        isButton: true,
        options: [
          { label: $t('infra.file.config.mode.active'), value: 'Active' },
          { label: $t('infra.file.config.mode.passive'), value: 'Passive' },
        ],
      },
      fieldName: 'config.mode',
      label: $t('infra.file.config.mode.title'),
      rules: 'selectRequired',
      dependencies: {
        if: (values) => values.storage === FileStorageEnum.FTP,
        triggerFields: ['storage'],
      },
    },
    {
      component: 'Input',
      fieldName: 'config.endpoint',
      label: $t('infra.file.config.endpoint'),
      rules: 'required',
      dependencies: {
        if: (values) => values.storage === FileStorageEnum.S3,
        triggerFields: ['storage'],
      },
    },
    {
      component: 'Input',
      fieldName: 'config.bucket',
      label: $t('infra.file.config.bucket'),
      rules: 'required',
      dependencies: {
        if: (values) => values.storage === FileStorageEnum.S3,
        triggerFields: ['storage'],
      },
    },
    {
      component: 'Input',
      componentProps: {
        clearable: false,
        showPassword: true,
        type: 'password',
      },
      fieldName: 'config.accessKey',
      label: $t('infra.file.config.accessKey'),
      rules: 'required',
      dependencies: {
        if: (values) => values.storage === FileStorageEnum.S3,
        triggerFields: ['storage'],
      },
    },
    {
      component: 'Input',
      componentProps: {
        clearable: false,
        showPassword: true,
        type: 'password',
      },
      fieldName: 'config.accessSecret',
      label: $t('infra.file.config.accessSecret'),
      rules: 'required',
      dependencies: {
        if: (values) => values.storage === FileStorageEnum.S3,
        triggerFields: ['storage'],
      },
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('infra.file.config.name'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: () => dictStore.loadDictData(DictTypeEnum.FILE_STORAGE),
      },
      fieldName: 'storage',
      label: $t('infra.file.config.storage'),
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
  onActionClick: OnActionClickFn<FileApi.Config>,
  onMasterChange?: (
    newStatus: boolean,
    row: FileApi.Config,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions<FileApi.Config>['columns'] {
  return [
    {
      field: 'id',
      minWidth: 80,
      title: $t('infra.file.config.id'),
    },
    {
      field: 'name',
      minWidth: 150,
      title: $t('infra.file.config.name'),
    },
    {
      field: 'storage',
      minWidth: 150,
      title: $t('infra.file.config.storage'),
      cellRender: {
        name: 'CellDict',
        props: {
          type: DictTypeEnum.FILE_STORAGE,
        },
      },
    },
    {
      field: 'master',
      minWidth: 100,
      title: $t('infra.file.config.master'),
      cellRender: {
        name: 'CellSwitch',
        props: {
          disabled: (row: FileApi.Config) => row.master,
          activeValue: true,
          inactiveValue: false,
          activeText: $t('page.yes'),
          inactiveText: $t('page.no'),
          style: null,
        },
        attrs: { beforeChange: onMasterChange },
      },
    },
    {
      field: 'remark',
      minWidth: 150,
      title: $t('infra.file.config.remark'),
      formatter: 'formatBlank',
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
      width: 240,
      fixed: isMobile.value ? null : 'right',
      cellRender: {
        name: 'CellOperate',
        attrs: {
          createActions: (row: FileApi.Config) => {
            return useGridActions(row, onActionClick)
              .addEdit('infra:file-config:update')
              .addAction({
                auth: 'infra:file-config:query',
                icon: 'lucide:flask-conical',
                btnText: $t('infra.file.config.test'),
                type: 'warning',
                popConfirm: {
                  title: $t('infra.file.config.confirm.test.title'),
                  on: {
                    confirm: () => {
                      onActionClick({ code: 'test', row });
                    },
                  },
                },
              })
              .addDelete('infra:file-config:delete')
              .build();
          },
        },
      },
    },
  ];
}
