import type { User } from '../user/types';

/**
 * 吧的信息
 */
export interface Bar {
    bid: number;
    bname: string;
    createTime: string;
    uid: number;
    bdesc: string;
    photo: string;
    is_followed: boolean;
}

/**
 * 吧的基本信息
 */
export interface BarInfo extends Bar {
    article_count: number;
    user_follow_count: number;
    user:User
}