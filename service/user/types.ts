import { UserRank } from '../bar/types';
import type { UserWithout } from "../../model/user/types";

/**
 * 用户信息
 */
export interface User extends UserWithout {
    is_followed: boolean;
    is_fans: boolean;
}

/**
 * 用户详情信息
 */
export interface UserInfo  extends User {
    fans_count: number;
    follow_user_count: number;
    article_count: number;
    create_bar_count: number;
    follow_bar_count: number;
}

/**
 * 用户信息+包含吧等级
 */
export interface UserWithRank extends User{
    /**
     * 用户在当前吧的等级 热评不会响应吧等级数据
     */
    bar_rank:UserRank
}