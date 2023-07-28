import { ReplyBaseItem } from '../../model/article/types';
import { Bar,UserRank } from "../bar/types";
import { User, UserInfo, UserWithRank } from "../user/types";
import { UserWithout } from '../../model/user/types';

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
 * 一条评论的基本信息
 */
export interface CommentItem {
    user: UserWithRank;
    is_liked: boolean;
    like_count: number;
    cid: number;
    content: string;
    createTime: string;
    aid: number;
    uid: number;
    photo: string[] | null;
    reply: {
        list: ReplyItem[],
        total: number;
    }
}

export interface ReplyItem extends ReplyBaseItem {
    like_count: number;
    is_liked: boolean;
    user: UserWithout & {bar_rank:UserRank},
    /**
     * 回复的目标对象数据 回复对象不包含用户吧等级数据
     */
    reply?: ReplyBaseItem & {
        user: UserWithout
    }
}