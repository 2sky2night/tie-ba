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