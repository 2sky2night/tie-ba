// 吧模型
import BarModel from "../../model/bar";
import UserModel from '../../model/user'
// 类型
import type { BarBody, BarCreateBody, BarInfo, BarInfoWithFollow } from "../../model/bar/types";
import type { UserInfo, UserWithout } from "../../model/user/types";
import type { Bar } from '../../model/bar/types';

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
                    res = { ...barInfo, is_followed: false, user: { ...resUser[ 0 ], is_followed: false } }
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
                    res = { ...barInfo, is_followed: isFollowBar, user: { ...resUser[ 0 ], is_followed: isFollowUser } }
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
    async toCancelFollowBar (bid: number, uid: number): Promise<0 | 1> {
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
    /**
     * 获取关注该吧的用户
     * @param bid 吧id
     * @param uid 当前登录的用户id
     * @param limit 响应多少条数据
     * @param offset 从多少偏移量开始获取数据
     * @returns 
     */
    async getBarFollowUser (bid: number, uid: number | undefined, limit: number, offset: number) {
        try {
            // 1.获取关注该吧的用户数量
            const resCount = await bar.selectFollowByBidCount(bid)
            if (!resCount.length) {
                // 查询出错
                await Promise.reject()
            }
            // 2.获取关注该吧的所有用户id列表
            const resUid = await bar.selectFollowByBidLimit(bid, limit, offset)

            // 3.通过用户id来获取用户详情数据
            const userList: UserWithout[] = []
            for (let i = 0; i < resUid.length; i++) {
                const userInfo = await user.selectByUid(resUid[ i ].uid)
                if (userInfo.length) {
                    // 有记录就保存用户数据
                    userList.push(userInfo[ 0 ])
                }
            }

            // 用户详情信息列表
            const userInfoList: UserInfo[] = []
            // 4.若当前登录了用户还需要查询当前用户是否关注了这些用户
            if (uid !== undefined) {
                // 登录了 需要使用查询当前用户对这些用户的关注状态
                for (let i = 0; i < userList.length; i++) {
                    // 通过当前用户id和列表用户id来查询是否有关注状态
                    const resFollow = await user.selectByUidAndUidIsFollow(uid, userList[ i ].uid)
                    if (resFollow.length) {
                        // 有记录 说明关注了
                        userInfoList.push({ ...userList[ i ], is_followed: true })
                    } else {
                        // 无记录 说明未关注
                        userInfoList.push({ ...userList[ i ], is_followed: false })
                    }
                }
            } else {
                // 未登录 则对这些用户的关注状态为未关注
                userList.map(ele => {
                    return { ...ele, is_followed: false }
                }).forEach(ele => {
                    userInfoList.push(ele)
                })
            }
            return Promise.resolve({
                list: userInfoList,
                limit,
                offset,
                total: resCount[ 0 ].total
            })
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取用户关注的吧
     * 1.通过uid查询当前用户关注的吧id列表，同时也需要获取该用户关注吧的总数total
     * 2.通过吧id列表来查询每个吧的详情信息
     * 3.通过吧主的id来获取每个吧的吧主信息
     * 4.通过当前登录的用户currentUid来查询当前用户对这些吧的关注状态
     * 5.通过当前登录的用户currentUid来查询当前用户对这些吧主的关注状态
     * @param uid 要查询的用户id
     * @param currentUid 当前登录的用户id
     * @param limit 响应多少条数据
     * @param offset 从多少偏移量开始获取数据
     */
    async getUserFollowBar (uid: number, currentUid: number | undefined, limit: number, offset: number) {
        try {
            // 1. 获取该用户关注吧的总数量
            const resTotal = await bar.selectFollowByUidCount(uid)
            if (!resTotal.length) {
                // 查询失败
                await Promise.reject()
            }

            // 2. 获取该用户关注的吧id列表
            const resBidList = await bar.selectFollowByUidLimit(uid, limit, offset)

            // 3. 通过bid列表获取吧的详情数据
            const barInfoList: Bar[] = []
            // 遍历吧id列表来查询吧的详情数据
            for (let i = 0; i < resBidList.length; i++) {
                const barInfo = await bar.selectByBid(resBidList[ i ].bid)
                if (barInfo.length) {
                    barInfoList.push(barInfo[ 0 ])
                }
            }

            // 4.通过当前登录的用户来获取对每个吧的关注状态
            const barInfoFollowList: BarInfoWithFollow[] = []
            if (currentUid === undefined) {
                // 未登录 则对吧的关注状态都为 false 未关注
                barInfoList.map(ele => {
                    return { ...ele, is_followed: false }
                }).forEach(item => {
                    barInfoFollowList.push(item)
                })
            } else {
                // 登录 则需要通过吧的详情数据列表进行查询每个吧的关注状态
                for (let i = 0; i < barInfoList.length; i++) {
                    const resFollowBar = await bar.selectFollowByUidAndBid(barInfoList[ i ].bid, currentUid)
                    if (resFollowBar.length) {
                        // 有记录说明当前用户关注了吧
                        barInfoFollowList.push({ ...barInfoList[ i ], is_followed: true })
                    } else {
                        // 没记录说明没有关注吧
                        barInfoFollowList.push({ ...barInfoList[ i ], is_followed: false })
                    }
                }
                
            }

            // 5.通过吧详情数据来获取每个吧的吧主信息以及对吧主的关注状态
            const barInformationList: BarInfo[] = [];
            for (let i = 0; i < barInfoFollowList.length; i++) {
                const userInfo = await user.selectByUid(barInfoFollowList[ i ].uid)
                if (userInfo.length) {
                    // 查询吧主信息成功 并查询对吧主关注状态
                    if (currentUid === undefined) {
                        // 若未登录则关注状态为未关注
                        barInformationList.push({ ...barInfoFollowList[ i ], user: { ...userInfo[ 0 ], is_followed: false } })
                    } else {
                        // 登录了 需要查询是否关注了用户
                        const resFollow = await user.selectByUidAndUidIsFollow(currentUid, barInfoFollowList[ i ].uid)
                        if (resFollow.length) {
                            // 关注了
                            barInformationList.push({ ...barInfoFollowList[ i ], user: { ...userInfo[ 0 ], is_followed: true } })
                        } else {
                            // 未关注
                            barInformationList.push({ ...barInfoFollowList[ i ], user: { ...userInfo[ 0 ], is_followed: false } })
                        }
                    }
                }
            }

            return Promise.resolve({
                list: barInformationList,
                limit,
                offset,
                total: resTotal[ 0 ].total
            })

        } catch (error) {
            return Promise.reject(error)
        }
    }
}

export default BarService
