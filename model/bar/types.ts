import type { UserInfo } from '../user/types';
/**
 * 吧的全部数据
 */
export interface Bar {
    /**
     * 吧的id
     */
    bid: number;
    /**
     * 吧的名称
     */
    bname: string;
    /**
     * 吧创建的时间
     */
    createTime: string;
    /**
     * 吧的创建人
     */
    uid: number;
    /**
     * 吧的描述信息
     */
    bdesc: string;
    /**
     * 吧的头像
     */
    photo: string;
}

/**
 * 创建吧的请求体
 */
export interface BarBody {
    bname: string;
    bdesc: string;
    photo: string;
}

/**
 * 操作sql时创建吧的数据
 */
export interface BarCreateBody extends BarBody {
    uid: number
}

/**
 * 用户关注吧表的元组数据
 */
export interface UserFollowBarItem {
    bid: number;
    uid: number;
    createTime: string;
}

/**
 * 吧的信息包括用户关注吧的信息 
 */
export interface BarInfoWithFollow extends Bar {
    is_followed: boolean
}

/**
 * 吧的信息（包含吧关注的信息以及吧主的信息+关注状态）
 */
export interface BarInfo extends BarInfoWithFollow {
    user: UserInfo
}

/**
 * 用户签到吧表
 */
export interface UserCheckBar {
    uid: number;
    bid: number;
    /**
     * 0未签到 1签到
     */
    is_checked: 0 | 1;
    /**
     * 签到分数
     */
    score: number;
}

/**
 * 吧等级制度
 */
export interface BarRank {
    bid: number;
    rank_JSON: string;
}