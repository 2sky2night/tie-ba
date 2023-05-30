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