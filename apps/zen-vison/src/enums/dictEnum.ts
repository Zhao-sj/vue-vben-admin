export enum DictTypeEnum {
  ARTICLE_STATUS = 'cms_article_status',
  DATA_SCOPE = 'system_data_scope',
  ERROR_LOG_PROCESS_STATUS = 'system_error_log_process_status',
  FILE_STORAGE = 'infra_file_storage',
  LOGIN_RESULT = 'system_login_result',
  LOGIN_TYPE = 'system_login_type',
  MENU_TYPE = 'system_menu_type',
  NOTICE_TYPE = 'system_notice_type',
  OAUTH2_GRANT_TYPE = 'system_oauth2_grant_type',
  OPERATE_TYPE = 'system_operate_type',
  PORTAL_CONSULT_PROCESS_STATUS = 'portal_consult_process_status',
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

export enum DictConsultAccept {
  /** 已处理 */
  ACCEPT = 1,

  /** 已忽略 */
  IGNORE = 2,

  /** 未处理 */
  UN_ACCEPT = 0,
}

export enum NoticeType {
  /** 通知 */
  NOTICE = 1,

  /** 公告 */
  REMIND = 2,
}

export enum FileStorageEnum {
  DB = 1,
  FTP = 11,
  LOCAL = 10,
  S3 = 20,
  SFTP = 12,
}

export const DICT_DATA_NAME = 'DictDataManage';
export const ACCOUNT_SETTING = 'AccountSetting';
