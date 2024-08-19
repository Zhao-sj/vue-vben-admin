export enum ModuleEnum {
  SYSTEM = 'system',
}

export interface PageParam {
  pageNum: number;
  pageSize: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

export interface BaseSimple {
  id: number;
  name: string;
}
