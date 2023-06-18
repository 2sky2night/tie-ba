import { Bar } from "../bar/types";
import { User } from "../user/types";

/**
 * 帖子详情
 */
export interface ArticleItem {
    aid: number;
    title: string;
    content: string;
    photo: string[]|null;
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