// 模型
import BarModel from "../../model/bar";
import UserModel from '../../model/user'
import ArticleModel from '../../model/article';
// 类型
import type { BarBody, BarCreateBody, BarInfo, BarInfoWithFollow } from "../../model/bar/types";
import type { UserInfo, UserWithout } from "../../model/user/types";
import type { Bar } from '../../model/bar/types';
import { getBarList, getBarListWithId, getUserRank } from './actions';
import { getArticleList, getArticleListWithoutLikeCount } from '../article/actions'
import { getUserListById } from '../user/actions';

// 吧模型实例
const bar = new BarModel()
// 用户模型实例
const user = new UserModel()
// 帖子模型实例
const article = new ArticleModel()

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
     * @returns
     * 1.根据id获取吧的详情数据 
     * 2.吧存在 获取当前用户对吧的关注状态
     * 3.获取关注该吧的数量、发帖数量
     * 4.获取吧主信息，查询当前用户与吧主的关注状态
     */
    async getBarInfo (bid: number, uid: number | undefined) {
        try {
            //  1.获取吧的信息
            const [ barInfo ] = await bar.selectByBid(bid)
            if (!barInfo) {
                // 吧不存在
                return Promise.resolve(0)
            }
            // 2.获取到吧主的信息
            const resUser = await user.selectByUid(barInfo.uid)
            // 3.获取当前用户对吧以及吧主的关注状态
            if (resUser.length) {
                // 将用户数据和吧的数据响应给客户端
                let res: any = null
                // 通过当前登录的用户id来检验是否关注了吧
                if (uid === undefined) {
                    //  若未登陆
                    res = {
                        ...barInfo,
                        is_followed: false,
                        user: {
                            ...resUser[ 0 ],
                            is_followed: false,
                            is_fans: false,
                        },
                        // 未登录用户 吧等级信息为null
                        my_bar_rank: null
                    }
                } else {
                    //  若登录 
                    // 3.1 查询用户是否关注了吧
                    const resFollowBar = await bar.selectFollowByUidAndBid(bid, uid)
                    let isFollowBar = false
                    if (resFollowBar.length) {
                        // 关注了吧
                        isFollowBar = true
                    } else {
                        //  未关注吧
                        isFollowBar = false
                    }
                    // 3.2 查询用户是否关注了吧主
                    const resFollowUser = await user.selectByUidAndUidIsFollow(uid, barInfo.uid)
                    const resFansUser = await user.selectByUidAndUidIsFollow(barInfo.uid, uid)
                    // 3.3 查询当前用户是否签到?
                    let is_checked = false
                    if (isFollowBar) {
                        // 关注了该吧 查询签到状态
                        const [ checkItem ] = await bar.selectInUserCheckBarTableByUidAndBid(uid, bid)
                        if (checkItem.is_checked) {
                            is_checked = true
                        }
                    }
                    // 响应请求内容
                    res = {
                        ...barInfo, is_followed: isFollowBar,
                        user: {
                            ...resUser[ 0 ],
                            is_followed: resFollowUser.length ? true : false,
                            is_fans: resFansUser.length ? true : false,
                        },
                        // 查询当前用户在本吧的等级
                        my_bar_rank: await getUserRank(uid, bid),
                        // 当前是否签到了
                        is_checked
                    }
                }
                // 4.查询该吧的发帖数量
                const resArticleCount = await article.countInArticleTableByBid(bid)
                Reflect.set(res, 'article_count', resArticleCount[ 0 ].total)
                // 5.查询关注该吧的人数
                const resFollowBarCount = await bar.selectFollowByBidCount(bid)
                Reflect.set(res, 'user_follow_count', resFollowBarCount[ 0 ].total)
                return Promise.resolve(res)
            } else {
                //  获取吧主的用户数据失败
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
     * 1.查询该吧是否存在
     * 2.查询关注该吧的用户总数量
     * 3.查询关注该吧的用户列表
     * 4.遍历用户列表 1.获取用户详情数据 2.查询当前用户对用户的关注状态 3.用户的粉丝、关注数量
     * @param bid 吧id
     * @param currentUid 当前登录的用户id
     * @param limit 响应多少条数据
     * @param offset 从多少偏移量开始获取数据
     * @returns 
     */
    async getFollowBarUser (bid: number, currentUid: number | undefined, limit: number, offset: number, desc: boolean) {
        try {
            // 1.查询吧是否存在
            const resExist = await bar.selectByBid(bid)
            // 吧不存在
            if (!resExist.length) return Promise.resolve(0)
            // 2.吧存在 查询关注该吧的用户列表
            const followBarList = (await bar.selectFollowByBidLimit(bid, limit, offset, desc)).map(ele => ele.uid)
            // 3.遍历用户列表 查询对应数据
            const userList = await getUserListById(followBarList, currentUid)
            // 查询关注的总数量
            const [ followCount ] = await bar.selectFollowByBidCount(bid)
            return Promise.resolve({
                list: userList,
                limit,
                offset,
                total: followCount.total,
                has_more: followCount.total > offset + limit,
                desc
            })
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取用户关注的吧
     * 0.查询该用户是否存在
     * 1.通过uid查询当前用户关注的吧id列表，同时也需要获取该用户关注吧的总数total
     * 2.通过吧id列表来查询每个吧的详情信息
     * 3.通过吧主的id来获取每个吧的吧主信息
     * 4.通过当前登录的用户currentUid来查询当前用户对这些吧的关注状态
     * 5.通过当前登录的用户currentUid来查询当前用户对这些吧主的关注状态
     * 6.查询这些吧 关注的数量、发帖的数量
     * @param uid 要查询的用户id
     * @param currentUid 当前登录的用户id
     * @param limit 响应多少条数据
     * @param offset 从多少偏移量开始获取数据
     * @param desc 根据关注时间降序或升序
     */
    async getUserFollowBar (uid: number, currentUid: number | undefined, limit: number, offset: number, desc: boolean) {
        try {
            // 0.该用户是否存在
            const [ userInfo ] = await user.selectByUid(uid)
            // 用户不存在
            if (!userInfo) return Promise.resolve(0)

            // 1. 获取该用户关注吧的总数量
            const [ followCount ] = await bar.selectFollowByUidCount(uid)

            // 2. 获取该用户关注的吧id列表
            const bidList = (await bar.selectFollowByUidLimit(uid, limit, offset, desc)).map(ele => ele.bid)

            // 3.遍历用户关注的吧列表 查询吧的数据
            const barList = await getBarListWithId(bidList, currentUid)


            return Promise.resolve({
                list: barList,
                limit,
                offset,
                total: followCount.total,
                has_more: followCount.total > limit + offset,
                desc
            })

        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取用户创建的吧
     * 1.查询用户是否存在
     * 2.查询创建的吧列表 并查询吧相关的信息
     * 3.查询用户创建吧的总数
     * @param uid 要查询的用户id
     * @param currentUid  当前登录的用户id
     * @param limit 响应多少条数据
     * @param offset 从多少偏移量开始获取数据
     * @param desc 根据创建时间降序或升序
     */
    async getUserBarList (uid: number, currentUid: number | undefined, limit: number, offset: number, desc: boolean) {
        try {
            // 1.查询用户是否存在
            const resExist = await user.selectByUid(uid)
            // 用户不存在
            if (!resExist.length) return Promise.resolve(0)
            // 2.用户存在 查询该用户创建吧的总数
            const [ count ] = await bar.countInBarTableByUid(uid)
            // 3.查询该页的吧信息列表
            const barList = await bar.selectInBarTableByUidLimit(uid, limit, offset, desc)
            const list = await getBarList(barList, currentUid)
            return Promise.resolve({
                list,
                limit,
                offset,
                total: count.total,
                has_more: count.total > limit + offset,
                desc
            })
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取吧列表
     * 1.查询吧列表
     * 2.获取当前吧总数
     * 3.遍历吧列表 查询吧的其他信息
     * @param currentUid  当前登录的用户id
     * @param limit 响应多少条数据
     * @param offset 从多少偏移量开始获取数据
     * @param desc 根据创建时间降序或升序
     */
    async getBarList (currentUid: number | undefined, limit: number, offset: number, desc: boolean) {
        try {
            const barList = await bar.selectInBarTableLimit(limit, offset, desc)
            const [ count ] = await bar.countInBarTable()
            const list = await getBarList(barList, currentUid)

            return Promise.resolve({
                list,
                limit,
                offset,
                total: count.total,
                desc,
                has_more: count.total > limit + offset
            })

        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 查询热门的吧 根据最近x天发帖数量进行排序
     * @param currentUid 当前登录的用户id
     * @param limit 响应多少条数据
     * @param offset 从多少偏移量开始获取数据
     * @param day 天数
     */
    async getHotBarList (currentUid: number | undefined, limit: number, offset: number, day: number) {
        try {
            // 查询热吧总数
            const [ count ] = await bar.countFindHotBar(day)
            // 查询热吧
            const barList = await bar.findHotBar(day, limit, offset)
            // 查询遍历吧列表 查询吧的其他信息
            const list = await getBarList(barList, currentUid)
            return Promise.resolve({
                list,
                limit,
                offset,
                day,
                total: count.total,
                has_more: count.total > offset + limit
            })
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取吧的简要信息
     * 1.吧的基本数据
     * 2.当前用户对吧的关注状态
     * 3.吧的帖子、关注数量
     * 4.获取吧主简要信息
     * @param bid 
     * @param currentUid 
     * @returns 
     */
    async getBarBrieflyInfo (bid: number, currentUid: number | undefined) {
        try {
            const [ barInfo ] = await bar.selectByBid(bid)
            // 吧不存在
            if (barInfo === undefined) return Promise.resolve(0)
            // 关注状态
            const isFollowed = currentUid === undefined ? false : (await bar.selectFollowByUidAndBid(bid, currentUid)).length > 0
            // 帖子数量、关注数量
            const [ articleCount ] = await article.countInArticleTableByBid(bid)
            const [ followCount ] = await bar.selectFollowByBidCount(bid)
            // 获取吧主数据
            const [ userInfo ] = await user.selectByUid(barInfo.uid)
            return Promise.resolve({
                ...barInfo,
                is_followed: isFollowed,
                article_count: articleCount.total,
                followCount: followCount.total,
                user: userInfo
            })
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取该吧的帖子列表
     * @param bid 吧id
     * @param currentUid 当前登录的用户id 
     * @param limit 获取多少条数据
     * @param offset 偏移量
     * @param desc 根据创建时间降序或升序
     * @returns 
     */
    async getBarArticleList (bid: number, currentUid: number | undefined, limit: number, offset: number, desc: boolean) {
        try {
            // 查询该吧是否存在
            const resExist = await bar.selectByBid(bid)
            // 吧不存在
            if (!resExist.length) return Promise.resolve(0)
            // 吧存在 获取帖子列表
            const articleList = await article.selectInArticleTableByBidLimit(bid, limit, offset, desc)
            // 获取该吧的帖子总数
            const [ count ] = await article.countInArticleTableByBid(bid)
            // 获取帖子列表其他信息
            const list = await getArticleList(articleList, currentUid)

            return Promise.resolve({
                list,
                limit,
                offset,
                desc,
                total: count.total,
                has_more: limit + offset < count.total
            })
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取该吧的热门帖子
     * @param bid 吧id
     * @param currentUid 当前登录的用户
     * @param limit 每页长度
     * @param offset 从多少偏移量开始获取数据
     * @param desc 是否降序
     */
    async getBarHotArticleList (bid: number, currentUid: number | undefined, limit: number, offset: number, desc: boolean) {
        try {
            // 查询该吧是否存在
            const resExist = await bar.selectByBid(bid)
            // 吧不存在
            if (!resExist.length) return Promise.resolve(0)
            // 获取该吧的帖子总数
            const [ count ] = await article.countInArticleTableByBid(bid)
            // 存在 获取该吧所有的帖子
            const allArticleList = await article.selectInArticleTableByBid(bid)
            // 查询所有帖子点赞的数量
            const _allArticleList: (typeof allArticleList[ 1 ] & { like_count: number })[] = []
            for (let i = 0; i < allArticleList.length; i++) {
                const [ likeCount ] = await article.countInLikeArticleTableByAid(allArticleList[ i ].aid)
                _allArticleList.push({
                    ...allArticleList[ i ],
                    like_count: likeCount.total
                })
            }
            // 根据降序或升序进行排序
            if (desc) {
                // 热度降序
                for (let i = 0; i < _allArticleList.length; i++) {
                    for (let j = 0; j < _allArticleList.length - 1; j++) {
                        if (_allArticleList[ j ].like_count < _allArticleList[ j + 1 ].like_count) {
                            const temp = _allArticleList[ j ]
                            _allArticleList[ j ] = _allArticleList[ j + 1 ]
                            _allArticleList[ j + 1 ] = temp
                        }
                    }
                }
            } else {
                // 热度升序
                for (let i = 0; i < _allArticleList.length; i++) {
                    for (let j = 0; j < _allArticleList.length - 1; j++) {
                        if (_allArticleList[ j ].like_count > _allArticleList[ j + 1 ].like_count) {
                            const temp = _allArticleList[ j ]
                            _allArticleList[ j ] = _allArticleList[ j + 1 ]
                            _allArticleList[ j + 1 ] = temp
                        }
                    }
                }
            }
            // 获取用户截取的数据
            const _list = _allArticleList.slice(offset, offset + limit)
            // 根据这些截取的帖子数据 获取详情数据
            const list = await getArticleListWithoutLikeCount(_list, currentUid)
            return Promise.resolve({
                list,
                offset,
                limit,
                has_more: limit + offset < count.total,
                desc,
                total: count.total
            })
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 分页展示所有的吧 只包含了吧最基础的信息
     * @param limit 
     * @param offset 
     */
    async getAllBarBriefly (limit: number, offset: number, desc: boolean) {
        try {
            const list = await bar.selectInBarTableLimit(limit, offset, desc)
            const [ count ] = await bar.countInBarTable()
            return Promise.resolve({
                list,
                total: count.total,
                limit,
                offset,
                desc,
                has_more: limit + offset < count.total
            })
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 分页展示用户关注的吧列表 只包含了吧最基础的信息
     * @param uid 用户id
     * @param limit 偏移量
     * @param offset 从多少偏移量开始获取数据
     * @param desc  根据吧创建时间降序
     */
    async getUserAllFollowBarBriefly (uid: number, limit: number, offset: number, desc: boolean) {
        try {
            // 获取吧列表
            const list = await bar.findUserFollowBarLimit(uid, limit, offset, desc)
            // 获取关注吧总数
            const [ count ] = await bar.selectFollowByUidCount(uid)
            return {
                list,
                total: count.total,
                limit,
                offset,
                desc,
                has_more: limit + offset < count.total
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 用户签到吧
     * @param uid 用户id
     * @param bid 吧id
     * @return -2吧不存在 -1用户未关注吧 0用户已经签到了 1签到成功
     */
    async userCheckBar (uid: number, bid: number) {
        try {
            // 查询吧是否存在
            const resExist = await bar.selectByBid(bid)
            if (!resExist.length) return Promise.resolve(-2)
            // 查询当前用户是否关注了该吧
            const resFollowBar = await bar.selectFollowByUidAndBid(bid, uid)
            // 未关注该吧
            if (!resFollowBar.length) return Promise.resolve(-1)
            // 查询签到状态
            const [ checkItem ] = await bar.selectInUserCheckBarTableByUidAndBid(uid, bid)
            if (checkItem.is_checked === 1) {
                // 已经签到过了
                return Promise.resolve(0)
            } else {
                // 签到 每次加五经验
                await bar.updateUserCheckBarTable(uid, bid, checkItem.score + 5)
                return Promise.resolve(1)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 修改吧等级制度
     * @param uid 用户id
     * @param bid 吧id
     * @param rankLableArray 吧等级制度头衔数组 
     * @returns -1吧不存在 0您不是吧主 1修改成功
     */
    async updateBarRank (uid: number, bid: number, rankLableArray: string[]) {
        try {
            // 吧是否存在
            const [ barInfo ] = await bar.selectByBid(bid)
            if (barInfo === undefined) return Promise.resolve(-1)
            // 修改吧等级制度的必须是吧主
            if (barInfo.uid !== uid) return Promise.resolve(0)
            // 默认的吧等级制度
            const rankJSON = [
                {
                    "label": "初出茅庐",
                    "level": 1,
                    "score": 0
                },
                {
                    "label": "初级粉丝",
                    "level": 2,
                    "score": 15
                },
                {
                    "label": "中级粉丝",
                    "level": 3,
                    "score": 40
                },
                {
                    "label": "高级粉丝",
                    "level": 4,
                    "score": 100
                },
                {
                    "label": "活跃吧友",
                    "level": 5,
                    "score": 200
                },
                {
                    "label": "核心吧友",
                    "level": 6,
                    "score": 400
                },
                {
                    "label": "铁杆吧友",
                    "level": 7,
                    "score": 600
                },
                {
                    "label": "知名人士",
                    "level": 8,
                    "score": 1000
                },
                {
                    "label": "人气楷模",
                    "level": 9,
                    "score": 1500
                },
                {
                    "label": "黄牌指导",
                    "level": 10,
                    "score": 2000
                },
                {
                    "label": "意见领袖",
                    "level": 11,
                    "score": 3000
                },
                {
                    "label": "意见领袖",
                    "level": 12,
                    "score": 6000
                },
                {
                    "label": "意见领袖",
                    "level": 13,
                    "score": 10000
                },
                {
                    "label": "意见领袖",
                    "level": 14,
                    "score": 14000
                },
                {
                    "label": "意见领袖",
                    "level": 15,
                    "score": 20000
                }
            ]
            // 遍历用户传入的吧等级制度通过下标依次修改对应等级的吧等级头衔
            rankLableArray.forEach((ele, index) => {
                rankJSON[ index ].label = ele
            })
            await bar.updateInBarRankTable(bid, JSON.stringify(rankJSON))
            return Promise.resolve(1)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取吧等级制度
     * @param bid 吧id
     */
    async getBarRankInfo (bid: number) {
        try {
            // 吧是否存在
            const [ barInfo ] = await bar.selectByBid(bid)
            if (barInfo) {
                // 存在获取吧的等级制度
                const [ rankItem ] = await bar.selectInBarRankTableByBid(bid)
                return Promise.resolve({
                    ...barInfo,
                    rank_JSON: rankItem.rank_JSON
                })
            } else {
                return Promise.resolve(0)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 修改吧信息
     * @param uid 用户id
     * @param bid 吧id
     * @param bname 吧名称
     * @param bdesc 吧简介
     * @param photo 用户简介
     */
    async updateBarInfo (uid: number, bid: number, bname: string, bdesc: string, photo: string) {
        try {
            // 查询吧是否存在
            const [ barInfo ] = await bar.selectByBid(bid)
            // 吧不存在
            if (!barInfo) return Promise.resolve(-1)
            // 当前修改吧的人不为吧主 也不能修改吧的信息
            if (barInfo.uid !== uid) return Promise.resolve(0)
            // 若为吧主则可以修改吧的信息
            await bar.updateInBarTable(bid, bname, photo, bdesc)
            return Promise.resolve(1)
        } catch (error) {
            return Promise.reject(error)
        }
    }
}

export default BarService
