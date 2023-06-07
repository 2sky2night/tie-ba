/**
 * 域名
 */
export const BASE_URL = '127.0.0.1'
/**
 * 端口号
 */
export const PROT = '3000'
/**
 * jwt密钥
 */
export const SECRET_KEY = 'tie-ba-lower'

/**
 * 路由白名单
 */
export const NO_AUTH = [
    '/user/login',
    '/user/query',
    '/user/register',
    '/user/follow/list',
    '/user/fans/list',
    '/bar/all',
    '/bar/info',
    '/bar/follow/list'
]