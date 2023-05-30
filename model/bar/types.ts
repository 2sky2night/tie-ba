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
    uid: number
}

/**
 * 创建吧的请求体
 */
export interface BarBody {
    bname: string;
    desc: string;
}

/**
 * 操作sql时创建吧的数据
 */
export interface BarCreateBody extends BarBody{
    uid:number
}