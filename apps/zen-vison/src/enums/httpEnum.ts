/**
 * @description 提示消息返回状态
 */
export enum ResultEnum {
  SUCCESS = 200,
  TOKEN_EXPIRED = 11_013,
  TOKEN_FREEZE = 11_016,
  TOKEN_KICK_OUT = 11_015,
  TOKEN_TOP_OUT = 11_014,
  UN_AUTHORIZED = 401,
}

export function hasUnAuthentication(code: number) {
  return [
    ResultEnum.TOKEN_EXPIRED,
    ResultEnum.TOKEN_FREEZE,
    ResultEnum.TOKEN_KICK_OUT,
    ResultEnum.TOKEN_TOP_OUT,
    ResultEnum.UN_AUTHORIZED,
  ].includes(code);
}
