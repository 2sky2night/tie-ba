// 吧模型
import BarModel from "../../model/bar";
import UserModel from '../../model/user'
// 类型
import type { BarBody, BarCreateBody } from "../../model/bar/types";

// 吧模型实例
const bar = new BarModel()
// 用户模型实例
const user = new UserModel()

/**
 * 吧的service层
 */
class BarService {
    /**
     * 创建吧
     * @param data 吧的数据
     * @returns 创建的结果 0吧名重复 1创建成功
     */
    async createBar (data: BarCreateBody): Promise<0 | 1> {
        try {
            // 先查询吧是否存在
            const resExist = await bar.selectByBname(data.bname)
            if (resExist.length) {
                // 吧名重复 创建失败
                return Promise.resolve(0)
            } else {
                // 吧名未重复, 则以数据来创建吧
                await bar.insertBar(data)
                return Promise.resolve(1)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取所有的吧
     * @returns 所有吧的数据
     */
    async findAllBar () {
        try {
            const res = await bar.selectAllBar()
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取吧的详情数据
     * @param bid 吧的id
     * @param uid 当前登录的用户id
     * @returns 获取吧的数据已经用户数据已经当前用户是否
     * 1. (当前登录的用户是否关注吧)
     * 2.(当前登录的用户是否关注吧主)
     */
    async getBarInfo (bid: number, uid: number | undefined) {
        try {
            //  获取吧的信息
            const resBar = await bar.selectByBid(bid)
            if (!resBar.length) {
                // 根据bid获取吧数据失败
                return Promise.resolve(0)
            }
            // 吧的数据
            const barInfo = resBar[ 0 ]
            // 获取到吧主的信息
            const resUser = await user.selectByUid(barInfo.uid)
            if (resUser.length) {
                // 将用户数据和吧的数据响应给客户端
                let res: any = null
                // 通过当前登录的用户id来检验是否关注了吧
                if (uid === undefined) {
                    //  若未登陆
                    res = { ...barInfo, is_follow: false, user: { ...resUser[ 0 ], is_follow: false } }
                } else {
                    //  若登录 
                    // 1.查询用户是否关注了吧
                    const resFollowBar = await bar.selectFollowByUidAndBid(bid, uid)
                    let isFollowBar = false
                    if (resFollowBar.length) {
                        // 关注了吧
                        isFollowBar = true
                    } else {
                        //  未关注吧
                        isFollowBar = false
                    }
                    // 2.查询用户是否关注了吧主
                    const resFollowUser = await user.selectByUidAndUidIsFollow(uid, barInfo.uid)
                    let isFollowUser = false
                    if (resFollowUser.length) {
                        // 关注了吧主
                        isFollowUser = true
                    } else {
                        // 未关注吧主
                        isFollowUser = false
                    }
                    // 响应请求内容
                    res = { ...barInfo, follow_bar: isFollowBar, user: { ...resUser[ 0 ], is_follow: isFollowUser } }
                }

                return Promise.resolve(res)
            } else {
                //  获取用户数据失败
                await Promise.reject()
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 用户关注吧
     * @param bid 吧的id
     * @param uid 用户的id
     * @returns 0已经关注了 1关注成功
     */
    async toFollowBar (bid: number, uid: number): Promise<0 | 1> {
        try {
            // 先检查用户是否关注吧
            const resExist = await bar.selectFollowByUidAndBid(bid, uid)
            if (resExist.length) {
                // 用户已经关注了该吧了!
                return Promise.resolve(0)
            }
            // 关注吧
            await bar.insertFollow(bid, uid)
            return Promise.resolve(1)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 取消关注吧
     * @param bid 吧id 
     * @param uid 用户id
     * @returns 0:未关注不能取消关注吧 1：关注了则取消关注吧
     */
    async toCancelFollowBar (bid: number, uid: number):Promise<0|1> {
        try {
            // 1.当前用户是否关注过吧
            const resExist = await bar.selectFollowByUidAndBid(bid, uid)
            if (!resExist.length) {
                // 未关注不能取消关注
                return Promise.resolve(0)
            }
            // 2.删除关注记录
            await bar.deleteFollowByUidAndBid(bid, uid)
            return Promise.resolve(1)
        } catch (error) {
            return Promise.reject(error) 
        }
    }
}

export default BarService
