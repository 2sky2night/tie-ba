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
}

export interface BarCreateBody extends BarBody{
    uid:number
}