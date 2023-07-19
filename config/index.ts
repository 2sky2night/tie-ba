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

export const BASE_REQUST='/api'

/**
 * 路由白名单
 */
export const NO_AUTH = [
    `${BASE_REQUST}/user/login`,
    `${BASE_REQUST}/user/query`,
    `${BASE_REQUST}/user/register`,
    `${BASE_REQUST}/user/follow/list`,
    `${BASE_REQUST}/user/fans/list`,
    `${BASE_REQUST}/user/profile`,
    `${BASE_REQUST}/user/card`,
    `${BASE_REQUST}/bar/all`,
    `${BASE_REQUST}/bar/info`,
    `${BASE_REQUST}/bar/follow/list`,
    `${BASE_REQUST}/bar/user/follow/list`,
    `${BASE_REQUST}/bar/user/list`,
    `${BASE_REQUST}/bar/list`,
    `${BASE_REQUST}/bar/discover`,
    `${BASE_REQUST}/bar/briefly`,
    `${BASE_REQUST}/bar/article/list`,
    `${BASE_REQUST}/article/info`,
    `${BASE_REQUST}/article/comment/list`,
    `${BASE_REQUST}/article/user/like/list`,
    `${BASE_REQUST}/article/user/star/list`,
    `${BASE_REQUST}/article/liked/list`,
    `${BASE_REQUST}/article/star/list`,
    `${BASE_REQUST}/article/user/list`,
    `${BASE_REQUST}/article/list`,
    `${BASE_REQUST}/article/hot`,
    `${BASE_REQUST}/article/comment/discover`,
    `${BASE_REQUST}/article/list/aids`,
    `${BASE_REQUST}/search`,
    `${BASE_REQUST}/search/user/follow`,
    `${BASE_REQUST}/search/user/fans`
]