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
    async createBar(data: BarCreateBody): Promise<0 | 1> {
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
    async findAllBar() {
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
     * 1. (当前登录的用户是否关注吧 完成)
     * 2.(当前登录的用户是否关注吧主 未完成)
     */
    async getBarInfo(bid: number, uid: number|undefined) {
        try {
            //  获取吧的信息
            const resBar = await bar.selectByBid(bid)
            if (!resBar.length) {
                // 根据bid获取吧数据失败
                await Promise.reject()
            }
            // 通过吧的数据查询用户数据
            const barInfo = resBar[0]
            // 获取到用户数据
            const resUser = await user.selectByUid(barInfo.uid)
            if (resUser.length) {
                // 将用户数据和吧的数据响应给客户端
                let res:any = null
                // 通过当前登录的用户id来检验是否关注了吧
                if (uid === undefined) {
                    //  若未登陆
                    res = { ...barInfo,follow_bar:false, user: { ...resUser[0] } }
                } else {
                    //  若登录 查询用户是否关注了吧
                    const resFollow = await bar.selectFollowByUidAndBid(bid, uid)
                    if (resFollow.length) {
                        // 关注了
                        res = { ...barInfo, follow_bar: true, user: { ...resUser[0] } }
                    } else {
                        //  未关注
                        res = { ...barInfo, follow_bar: false, user: { ...resUser[0] } }
                    }
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
    async followBar(bid: number, uid: number): Promise<0 | 1> {
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
            return Promise.reject()
        }
    }
}

export default BarService
