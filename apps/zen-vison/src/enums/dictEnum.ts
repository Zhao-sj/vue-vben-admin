export enum DictTypeEnum {
  DATA_SCOPE = 'system_data_scope',
  ERROR_LOG_PROCESS_STATUS = 'system_error_log_process_status',
  LOGIN_RESULT = 'system_login_result',
  LOGIN_TYPE = 'system_login_type',
  NOTICE_TYPE = 'system_notice_type',
  OPERATE_TYPE = 'system_operate_type',
  ROLE_TYPE = 'system_role_type',
  SEX = 'system_user_sex',
  STATUS = 'system_status',
  USER_TYPE = 'user_type',
}

export enum DictStatus {
  DISABLE = 1,
  ENABLE = 0,
}

export enum DictSex {
  FEMALE = 2,
  MALE = 1,
}

export enum DictRoleType {
  /** 内置角色 */
  ADMIN = 1,
}

export enum DictRoleDataScope {
  /** 自定义数据权限 */
  CUSTOM = 2,
}

export enum DictLogProcess {
  /** 已忽略 */
  IGNORE = 2,

  /** 已处理 */
  PROCESSED = 1,

  /** 未处理 */
  UN_PROCESS = 0,
}

export enum NoticeType {
  /** 通知 */
  NOTICE = 1,

  /** 公告 */
  REMIND = 2,
}

export const DICT_DATA_NAME = 'DictDataManage';
export const ACCOUNT_SETTING = 'AccountSetting';
