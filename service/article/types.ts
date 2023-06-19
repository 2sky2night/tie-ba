import { Bar } from "../bar/types";
import { User } from "../user/types";

/**
 * 帖子详情
 */
export interface ArticleItem {
    aid: number;
    title: string;
    content: string;
    photo: string[] | null;
    createTime: string;
    uid: number;
    bid: number;
    like_count: number;
    is_liked: boolean;
    star_count: number;
    is_star: boolean;
    comment_count: number;
    user: User;
    bar: Bar;
}

/**
 * 评论的详情信息
 */
export interface CommentInfo {
    cid: number;
    content: string;
    aid: number;
    uid: number;
    photo: null | string[];
    createTime: string;
    is_liked: boolean;
    like_count: number;
    user: User
}