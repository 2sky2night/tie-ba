// model层
import UserModel from '../../model/user'
import ArticleModel from '../../model/article'
import BarModel from '../../model/bar'
// 类型
import type { User, UserBody, UserWithout } from '../../model/user/types'
import type { ArticleBaseItem } from '../../model/article/types'

// 用户模型
const user = new UserModel()
// 文章模型
const article = new ArticleModel()
// 吧模型
const bar = new BarModel()


/**
 * 用户service层
 */
class UserService {
    /**
     * 通过用户名查询用户
     * @param username 
     * @returns 用户信息
     */
    async findUserByUsername (username: string) {
        try {
            const res = await user.selectDataByUsername(username)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 创建用户
     * @param data 
     * @returns 0注册失败 1注册成功
     */
    async createUser (data: UserBody): Promise<0 | 1> {
        try {
            // 查询当前需要注册的用户名称是否存在
            const resExist = await user.selectByUsername(data.username)
            if (resExist.length) {
                // 若有记录说明用户存在
                return Promise.resolve(0)
            }
            // 在表中创建用户数据
            user.insertUser(data)
            return Promise.resolve(1)
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * 
     * 登录业务
     * @param data 
     * @returns 0:用户名不存在 1:密码错误 用户信息:登录成功
     */
    async checkLogin (data: UserBody): Promise<0 | 1 | User> {
        try {
            // 查询登录用户是否存在
            const resExit = await user.selectByUsername(data.username)
            if (!resExit.length) {
                // 若用户不存在
                return Promise.resolve(0)
            }
            // 检查密码和用户名是否匹配
            const resUser = await user.selectByUsernameAndPassword(data.username, data.password)
            if (resUser.length) {
                // 匹配成功 返回用户的数据 token中保存用户的id和用户名称
                return Promise.resolve(resUser[ 0 ])
            } else {
                // 密码错误
                return Promise.resolve(1)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 通过uid获取用户（我的）信息 (未完成)
     * 1.获取用户基本信息
     * 2.获取用户发帖数量、发帖被点赞数量、用户收藏的数量
     * 3.获取用户发送评论数量、评论被点赞数量
     * 4.获取用户粉丝、关注数量
     * 5.获取我最近10条点赞、收藏的帖子
     * 6.获取用户关注吧的数量
     * @param uid 
     * @returns 0查无此人 用户信息:查询数据成功
     */
    async getUserInfo (uid: number) {
        try {
            // 1.获取用户基本信息
            const [ userInfo ] = await user.selectByUid(uid)
            if (userInfo) {
                // 查询到了
                // 2.获取用户发帖数量
                const [ articleCount ] = await article.countInArticleTableByUid(uid)
                // 3.获取用户发送评论数量
                const [ commentCount ] = await article.countInCommentTableByUid(uid)
                // 4.获取用户粉丝数量
                const [ fansCount ] = await user.selectByUidFollowedScopedFollowCount(uid)
                // 5.获取用户关注数量
                const [ followCount ] = await user.selectByUidScopedFollowCount(uid)
                // 6.获取用户所有的帖子列表来查询每个帖子的点赞数量
                const userArticleList = await article.selectInArticleTableByUid(uid)
                // 用户所有帖子被点赞的总数
                let articleLikeCount = 0;
                for (let i = 0; i < userArticleList.length; i++) {
                    const [ count ] = await article.countInLikeArticleTableByAid(userArticleList[ i ].aid)
                    if (count && count.total) {
                        articleLikeCount += count.total
                    }
                }
                // 7.获取用户所有的评论来查询被点赞的总数
                const userCommentList = await article.selectInCommentTableByUid(uid)
                // 所有评论被点赞的总数
                let commentLikeCount = 0;
                for (let i = 0; i < userCommentList.length; i++) {
                    const [ count ] = await article.countInLikeCommentTabeByCid(userCommentList[ i ].cid)
                    if (count && count.total) {
                        commentLikeCount += count.total
                    }
                }

                // 8.获取用户收藏帖子的总数
                const [ starArticleCount ] = await article.countInStarArticleTableByUid(uid)

                // 9.获取用户关注吧的总数
                const [ followBarCount ] = await bar.selectFollowByUidCount(uid)

                // 10.获取用户最近10条点赞的帖子
                const recentlyLikeArticleList = await article.selectInLikeArticleTableByUidLimit(uid, 10, 0)
                // 这十条帖子数据
                const articleLikeList: any[] = [];
                for (let i = 0; i < recentlyLikeArticleList.length; i++) {
                    // 获取帖子的数据
                    const [ articleInfo ] = await article.selectInArticleTableByAid(recentlyLikeArticleList[ i ].aid)
                    if (articleInfo) {
                        // 帖子存在
                        // 1.则获取对应帖子创建者信息
                        const [ userInfo ] = await user.selectByUid(articleInfo.uid)
                        
                        articleLikeList.push({
                            ...articleInfo,

                            user:userInfo
                        })
                    }
                }

                return Promise.resolve({
                    ...userInfo,
                    fans_count: fansCount.total,
                    follow_count: followCount.total,
                    follow_bar_count: followBarCount.total,
                    article: {
                        article_count: articleCount.total,
                        article_like_count: articleLikeCount,
                        article_star_count: starArticleCount.total
                    },
                    comment: {
                        comment_count: commentCount.total,
                        comment_like_count: commentLikeCount
                    },
                    recently: {
                        article_like_list:articleLikeList
                    }
                })

            } else {
                // 查无此人
                return Promise.resolve(0)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 关注用户
     * @param uid 关注者
     * @param uidIsFollowed 被关注者
     * @returns -2不能自己关注自己 -1被关注者不存在 0已经关注了 1关注成功 
     */
    async toFollowUser (uid: number, uidIsFollowed: number): Promise<-2 | -1 | 0 | 1> {
        if (uid === uidIsFollowed) {
            return Promise.resolve(-2)
        }
        try {
            // 1.查询被关注着是否存在
            const resFollowerExist = await user.selectByUid(uidIsFollowed)
            if (!resFollowerExist.length) {
                return Promise.resolve(-1)
            }
            // 2.查询是否已经关注了
            const resExist = await user.selectByUidAndUidIsFollow(uid, uidIsFollowed)
            if (resExist.length) {
                // 已经关注了
                return Promise.resolve(0)
            } else {
                // 未关注
                await user.insertFollow(uid, uidIsFollowed)
                return Promise.resolve(1)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * 取消关注用户
     * @param uid 关注者的id
     * @param uidIsFollowed 被关注者的id
     * @returns -2：自己不能取消关注自己 -1：被关注者不存在 0：还未关注不能取消关注 1：取关成功
     */
    async toCancelFollow (uid: number, uidIsFollowed: number): Promise<-2 | -1 | 0 | 1> {
        if (uid === uidIsFollowed) {
            // 自己不能取消关注自己
            return Promise.resolve(-2)
        }
        try {
            // 1.查询被关注着是否存在
            const resFollowerExist = await user.selectByUid(uidIsFollowed)
            if (!resFollowerExist.length) {
                return Promise.resolve(-1)
            }
            // 2.查询是否已经关注了
            const resExist = await user.selectByUidAndUidIsFollow(uid, uidIsFollowed)
            if (resExist.length) {
                // 已经关注了 则删除该记录
                await user.deleteByUidAndUidIsFollowedScopedFollow(uid, uidIsFollowed)
                return Promise.resolve(1)
            } else {
                // 未关注 则说明没有该记录取消关注失败
                return Promise.resolve(0)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取用户的关注列表
     * @param uid 用户id
     * @param limit 多少条数据
     * @param offset 从第几条开始获取数据
     * @returns 
     */
    async getFollowList (uid: number, limit: number, offset: number) {
        try {
            // 获取通过当前uid来获取被关注的用户列表 (分页的数据)
            const resIdList = await user.selectByUidScopedFollowLimit(uid, limit, offset)
            const userList: UserWithout[] = []
            // 遍历获取用户数据
            for (let i = 0; i < resIdList.length; i++) {
                // 通过被关注者的id获取被关注者数据
                const userItem = await user.selectByUid(resIdList[ i ].uid_is_followed)
                if (userItem.length) {
                    // 若查询到了 保存该数据
                    userList.push(userItem[ 0 ])
                }
            }
            // 获取关注数量
            const total = await user.selectByUidScopedFollowCount(uid)
            return Promise.resolve({ list: userList, total: total[ 0 ].total, limit, offset })
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取粉丝列表
     * @param uidIsFollowed 被关注者的id
     * @param limit 多少条数据
     * @param offset 从第几条开始获取数据
     * @returns 
     */
    async getFansList (uidIsFollowed: number, limit: number, offset: number) {
        try {
            // 获取通过当前uid来获取粉丝列表 (分页的数据)
            const resIdList = await user.selectByUidFollowedScopedFollowLimit(uidIsFollowed, limit, offset)
            const userList: UserWithout[] = []
            // 遍历获取用户数据
            for (let i = 0; i < resIdList.length; i++) {
                // 通过关注者的id获取粉丝数据
                const userItem = await user.selectByUid(resIdList[ i ].uid)
                if (userItem.length) {
                    // 若查询到了 保存该数据
                    userList.push(userItem[ 0 ])
                }
            }
            // 获取粉丝数量
            const total = await user.selectByUidFollowedScopedFollowCount(uidIsFollowed)
            return Promise.resolve({ list: userList, total: total[ 0 ].total, limit, offset })
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 修改用户信息(不包括密码)
     * 1.查询要修改的用户是否重复
     * 2.不重复则可以修改用户信息
     * @param uid 用户id
     * @param avatar 头像
     * @param username 用户名称
     * @returns 0:用户名已经存在了 1:修改成功
     */
    async updateUserData (uid: number, avatar: string, username: string): Promise<0 | 1> {
        try {
            const resExist = await user.selectByUsername(username)
            if (resExist.length) {
                // 用户名已经存在了 不能修改
                return Promise.resolve(0)
            } else {
                // 用户名不存在 则可以修改
                await user.updateInUserTableByUid(uid, username, avatar)
                return Promise.resolve(1)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 更新用户密码
     * @param uid 用户id
     * @param password 新密码
     * @param oldPassword 旧密码
     * @returns -1:旧密码对不上 0:新旧密码一致 1:修改密码成功
     */
    async updateUserPassword (uid: number, password: string, oldPassword: string): Promise<-1 | 0 | 1> {
        try {
            const [ userInfo ] = await user.selectInUserTableByUid(uid)
            if (userInfo) {
                // 用户存在
                if (userInfo.password === oldPassword) {
                    // 旧密码匹配成功
                    if (userInfo.password === password) {
                        // 新旧密码一样
                        return Promise.resolve(0)
                    } else {
                        await user.updateInUserTableByUidWithPassword(uid, password)
                        return Promise.resolve(1)
                    }
                } else {
                    // 验证密码失败
                    return Promise.resolve(-1)
                }
            } else {
                // 用户不存在
                return await Promise.reject('用户不存在!')
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 通过查询参数uid 来获取用户信息 （一般指访问别人的主页）
     * @param uid 用户的id
     * @param currentUid 当前登录的用户id
     */
    async getUserProfile (uid: number, currentUid: number | undefined) {
        try {
            // const [userInfo] = await 
        } catch (error) {

        }
    }
}

export default UserService