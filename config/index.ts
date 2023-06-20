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
    '/user/profile',
    '/bar/all',
    '/bar/info',
    '/bar/follow/list',
    '/bar/user/follow/list',
    '/bar/user/list',
    '/bar/list',
    '/bar/hot',
    '/article/info',
    '/article/comment/list',
    '/article/user/like/list',
    '/article/user/star/list',
    '/article/liked/list',
    '/article/star/list',
    '/article/user/list',
    '/article/list',
    '/article/hot',
    '/article/comment/hot',
    '/search',
    '/search/user/follow',
    '/search/user/fans'
]