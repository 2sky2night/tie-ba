export interface Count {
    total:number
}
/**
 * 查询总数的结果
 */
export type CountRes = Count[]

/**
 * token携带的信息
 */
export interface Token {
    username: string;
    uid: number;
    iat: number,
    /**
     * token过期时间
     */
    exp: number;
}