/**
 * 用户字段
 */
export interface User {
    /**
     * 用户的id
     */
    uid: number;
    /**
     * 用户的名称
     */
    username: string;
    /**
     * 用户的密码
     */
    password: string;
    /**
     * 创建时间
     */
    createTime: string;
    /**
     * 用户的头像
     */
    avatar: string;
    /**
     * 用户的状态 0注销 1存在
     */
    state: number;
}


/**
 * 注册/登录时的请求体
 */
export interface UserBody {
    username: string;
    password: string
}

/**
 * 用户基本信息
 */
export interface UserWithout {
    /**
 * 用户的id
 */
    uid: number;
    /**
     * 用户的名称
     */
    username: string;
    /**
     * 创建时间
     */
    createTime: string;
    /**
     * 用户的头像
     */
    avatar: string;
}

/**
 * 一条用户关注的信息
 */
export interface UserFollow {
    /**
     * 关注者
     */
    uid: number;
    /**
     * 被关注的用户
     */
    uid_is_followed: number;
    /**
     * 创建时间
     */
    createTime: string;
}

/**
 * 用户详情数据
 */
export interface UserInfo extends UserWithout {
    /**
     * 当前用户是否关注了该用户
     */
    is_followed: boolean
}
