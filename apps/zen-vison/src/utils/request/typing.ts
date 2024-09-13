import type {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from '@vben/request';

type ErrorMessageMode = 'message' | 'modal' | 'none';
type SuccessMessageMode = ErrorMessageMode;

interface ZenRequestConfig<D = any> extends AxiosRequestConfig<D> {
  /** 错误信息提示类型 */
  errorMessageMode?: ErrorMessageMode;

  /** 是否返回原生响应头 */
  isReturnNativeResponse?: boolean;

  /** 是否处理请求结果 */
  isTransformResponse?: boolean;

  /** 成功信息提示类型 */
  successMessageMode?: SuccessMessageMode;
}

interface InternalZenRequestConfig<D = any> extends ZenRequestConfig<D> {
  headers: InternalAxiosRequestConfig['headers'];
}

interface HttpResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

export type { HttpResponse, InternalZenRequestConfig, ZenRequestConfig };
