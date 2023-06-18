/**
 * 用户信息
 */
export interface User {
    uid: number;
    username: string;
    createTime: string;
    avatar: string;
    is_followed: boolean;
    is_fans: boolean;
}
