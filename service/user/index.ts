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
     * 通过uid获取用户（我的）信息 --- 将要被废除
     * 1.获取我的基本信息
     * 2.获取我的发帖数量,发帖被点赞数量、发帖被收藏数量、评论被点赞的数量,我点赞帖子、收藏帖子、点赞评论的数量
     * 3.获取用户发送评论数量、评论被点赞数量
     * 4.获取用户粉丝、关注数量
     * 5.获取我最近10条点赞、收藏的帖子 以及这些帖子的点赞收藏数量，收藏状态，评论数量 (这个业务以后需要被删除 因为可以在其他单独接口中实现)
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
                // 获取点赞帖子的总数
                const [ likeArticleCount ] = await article.countInLikeArticleTableByUid(uid)
                // 6.获取用户所有的帖子列表来查询每个帖子的点赞数量以及收藏数量
                const userArticleList = await article.selectInArticleTableByUid(uid)
                // 用户所有帖子被点赞的总数
                let articleLikedCount = 0;
                let articleStaredCount = 0;
                for (let i = 0; i < userArticleList.length; i++) {
                    // 获取帖子点赞数量
                    const [ likeCount ] = await article.countInLikeArticleTableByAid(userArticleList[ i ].aid)
                    if (likeCount.total) {
                        articleLikedCount += likeCount.total
                    }
                    // 获取帖子收藏数量
                    const [ starCount ] = await article.countInStarArticleTableByAid(userArticleList[ i ].aid)
                    if (starCount.total) {
                        articleStaredCount += starCount.total
                    }
                }
                // 7.获取用户所有的评论来查询被点赞的总数
                const userCommentList = await article.selectInCommentTableByUid(uid)
                // 所有评论被点赞的总数
                let commentLikedCount = 0;
                for (let i = 0; i < userCommentList.length; i++) {
                    const [ count ] = await article.countInLikeCommentTabeByCid(userCommentList[ i ].cid)
                    if (count && count.total) {
                        commentLikedCount += count.total
                    }
                }

                // 8.获取用户收藏帖子的总数
                const [ starArticleCount ] = await article.countInStarArticleTableByUid(uid)

                // 9.获取用户关注吧的总数
                const [ followBarCount ] = await bar.selectFollowByUidCount(uid)

                // 10.获取用户最近10条点赞的帖子
                const recentlyLikeArticleList = await article.selectInLikeArticleTableByUidLimit(uid, 10, 0, true)
                // 这十条帖子数据
                const articleLikeList: any[] = [];
                for (let i = 0; i < recentlyLikeArticleList.length; i++) {
                    // 获取帖子的数据
                    const [ articleInfo ] = await article.selectInArticleTableByAid(recentlyLikeArticleList[ i ].aid)
                    if (articleInfo) {
                        // 帖子存在
                        // 1.则获取对应帖子创建者信息
                        const [ userInfo ] = await user.selectByUid(articleInfo.uid)
                        // 2.查询当前用户是否关注了创建者
                        const [ isFollowed ] = await user.selectByUidAndUidIsFollow(uid, userInfo.uid)
                        // 3.是否收藏了该帖子？
                        const [ isStar ] = await article.selectInStarArticleTableByUidAndAid(uid, articleInfo.aid)
                        // 4.帖子收藏人数
                        const [ isStarCount ] = await article.countInStarArticleTableByAid(articleInfo.aid)
                        // 5.帖子点赞人数
                        const [ isLikeCount ] = await article.countInLikeArticleTableByAid(articleInfo.aid)
                        // 6.帖子评论数量
                        const [ commentCount ] = await article.countInCommentTableByAid(articleInfo.aid)
                        // 7.查询该帖子所属吧的信息
                        const [ barInfo ] = await bar.selectByBid(articleInfo.bid)
                        // 8.对吧的关注状态
                        const [ isFollowedBar ] = await bar.selectFollowByUidAndBid(articleInfo.bid, uid)

                        articleLikeList.push({
                            aid: articleInfo.aid,
                            title: articleInfo.title,
                            content: articleInfo.content,
                            photo: articleInfo.photo !== null ? articleInfo.photo.split(',') : null,
                            bid: articleInfo.bid,
                            uid: articleInfo.uid,
                            createTime: articleInfo.createTime,
                            like_count: isLikeCount.total,
                            is_liked: true,
                            is_star: isStar ? true : false,
                            star_count: isStarCount.total,
                            comment_count: commentCount.total,
                            user: { ...userInfo, is_followed: isFollowed ? true : false },
                            bar: { ...barInfo, is_followed: isFollowedBar ? true : false }
                        })

                    }
                }

                // 11.获取用户最近10条收藏的帖子
                const recentlyStarArticleList = await article.selectInStarArticleTableByUidLimit(uid, 10, 0, true)
                // 这十条帖子数据
                const articleStarList: any[] = []
                for (let i = 0; i < recentlyStarArticleList.length; i++) {
                    // 获取帖子的数据
                    const [ articleInfo ] = await article.selectInArticleTableByAid(recentlyStarArticleList[ i ].aid)
                    if (articleInfo) {
                        // 帖子存在
                        // 1.则获取对应帖子创建者信息
                        const [ userInfo ] = await user.selectByUid(articleInfo.uid)
                        // 2.查询当前用户是否关注了创建者
                        const [ isFollowed ] = await user.selectByUidAndUidIsFollow(uid, userInfo.uid)
                        // 3.是否点赞了该帖子？
                        const [ isLiked ] = await article.selectInLikeArticleTableByAidAndUid(uid, articleInfo.aid)
                        // 4.帖子收藏人数
                        const [ isStarCount ] = await article.countInStarArticleTableByAid(articleInfo.aid)
                        // 5.帖子点赞人数
                        const [ isLikeCount ] = await article.countInLikeArticleTableByAid(articleInfo.aid)
                        // 6.帖子评论数量
                        const [ commentCount ] = await article.countInCommentTableByAid(articleInfo.aid)
                        // 7.查询该帖子所属吧的信息
                        const [ barInfo ] = await bar.selectByBid(articleInfo.bid)
                        // 8.对吧的关注状态
                        const [ isFollowedBar ] = await bar.selectFollowByUidAndBid(articleInfo.bid, uid)

                        articleStarList.push({
                            aid: articleInfo.aid,
                            title: articleInfo.title,
                            content: articleInfo.content,
                            photo: articleInfo.photo !== null ? articleInfo.photo.split(',') : null,
                            bid: articleInfo.bid,
                            uid: articleInfo.uid,
                            createTime: articleInfo.createTime,
                            like_count: isLikeCount.total,
                            is_liked: isLiked ? true : false,
                            is_star: true,
                            star_count: isStarCount.total,
                            comment_count: commentCount.total,
                            user: { ...userInfo, is_followed: isFollowed ? true : false },
                            bar: { ...barInfo, is_followed: isFollowedBar ? true : false }
                        })
                    }

                }

                // 12.获取用户点赞评论的总数
                const [ commentLikeCount ] = await article.countInLikeCommentTableByUid(uid)


                return Promise.resolve({
                    ...userInfo,
                    fans_count: fansCount.total,
                    follow_count: followCount.total,
                    follow_bar_count: followBarCount.total,
                    article: {
                        article_count: articleCount.total,
                        article_liked_count: articleLikedCount,
                        article_like_count: likeArticleCount.total,
                        article_star_count: starArticleCount.total,
                        article_stared_count: articleStaredCount
                    },
                    comment: {
                        comment_count: commentCount.total,
                        comment_liked_count: commentLikedCount,
                        comment_like_count: commentLikeCount.total
                    },
                    recently: {
                        article_like_list: articleLikeList,
                        article_star_list: articleStarList
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
     * 获取用户的关注列表 (未写完)
     * 1.查询用户是否存在
     * 2.查询用户关注的列表
     * 3.查询每个用户的基本信息，关注数量、粉丝数量、发帖数量、关注吧的数量
     * 4.查询当前用户对这些用户的关注状态、粉丝状态
     * @param uid 用户id
     * @param currentUid 当前登录的用户id
     * @param limit 多少条数据
     * @param offset 从第几条开始获取数据
     * @returns 
     */
    async getFollowList (uid: number, currentUid: number | undefined, limit: number, offset: number, desc: boolean) {
        try {
            // 1.查询用户是否存在
            const resExist = await user.selectByUid(uid)
            // uid用户不存在
            if (!resExist.length) return Promise.resolve(0)

            // 用户存在
            // 获取通过当前uid来获取被关注的用户列表 (分页的数据)
            const resIdList = await user.selectByUidScopedFollowLimit(uid, limit, offset, desc)
            const userInfoList: any[] = []
            // 遍历关注信息获取被关注者的数据
            for (let i = 0; i < resIdList.length; i++) {
                // 被关注者的用户id
                const uidIsFollowed = resIdList[ i ].uid_is_followed
                // 1.查询被关注者的基本信息
                const [ userInfo ] = await user.selectByUid(uidIsFollowed)
                // 2.查询被关注者的关注数量
                const [ followUserCount ] = await user.selectByUidScopedFollowCount(uidIsFollowed)
                // 3.查询被关注者的粉丝数量
                const [ fansCount ] = await user.selectByUidFollowedScopedFollowCount(uidIsFollowed)
                // 4.查询被关注者的发帖数量
                const [ articleCount ] = await article.countInArticleTableByUid(uidIsFollowed)
                // 5.查询被关注则的关注吧的数量
                const [ followBarCount ] = await bar.selectFollowByUidCount(uidIsFollowed)
                // 6.查询当前用户对此用户的关注、粉丝状态
                const isFollowed = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(currentUid, uidIsFollowed)).length ? true : false
                const isFans = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(uidIsFollowed, currentUid)).length ? true : false
                userInfoList.push({
                    ...userInfo,
                    follow_user_count: followUserCount.total,
                    fans_count: fansCount.total,
                    article_count: articleCount.total,
                    follow_bar_count: followBarCount.total,
                    is_followe: isFollowed,
                    is_fans: isFans
                })
            }
            // 获取关注数量
            const total = await user.selectByUidScopedFollowCount(uid)

            return Promise.resolve({
                list: userInfoList,
                total: total[ 0 ].total,
                limit,
                offset,
                has_more: total[ 0 ].total > offset + limit
            })

        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取粉丝列表 (未写完)
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
            return Promise.resolve({
                list: userList,
                total: total[ 0 ].total,
                limit,
                offset,
                has_more: total[ 0 ].total > offset + limit
            })
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
     * 1.获取用户信息
     * 2.获取当前登录用户对该用户的关注状态
     * 3.获取用户的粉丝、关注、关注的吧、创建的吧、发帖、评论、收藏帖子的数量，帖子被点赞,帖子被收藏、评论被点赞的数量
     * 4.获取用户最近点赞的帖子、收藏的帖子(不在这个接口里面实现 在用户点赞、收藏帖子列表中实现)
     * @param uid 用户的id
     * @param currentUid 当前登录的用户id
     */
    async getUserProfile (uid: number, currentUid: number | undefined) {
        try {
            // 1.获取用户信息
            const [ userInfo ] = await user.selectByUid(uid)
            if (!userInfo) {
                // 用户不存在
                return Promise.resolve(0)
            }
            // 2.获取当前用户对该用户的关注状态
            const userIsFollowed = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(currentUid, uid)).length ? true : false
            // 3.获取该用户对当前用户的关注状态（粉丝）
            const userIsFans = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, currentUid)).length ? true : false
            // 4.获取各种数据
            // 粉丝数量
            const [ fansCount ] = await user.selectByUidFollowedScopedFollowCount(uid)
            // 关注数量
            const [ followCount ] = await user.selectByUidScopedFollowCount(uid)
            // 关注吧数量
            const [ followBarCount ] = await bar.selectFollowByUidCount(uid)
            // 发帖数量
            const [ articleCount ] = await article.countInArticleTableByUid(uid)
            // 评论数量
            const [ commentCount ] = await article.countInCommentTableByUid(uid)
            // 收藏帖子的数量
            const [ starArticleCount ] = await article.countInStarArticleTableByUid(uid)
            // 点赞帖子的数量
            const [ likeArticleCount ] = await article.countInLikeArticleTableByUid(uid)
            // 点赞评论的数量
            const [ likeCommentCount ] = await article.countInLikeCommentTableByUid(uid)
            // 获取用户创建的吧数量
            const [ barCount ] = await bar.countInBarTableByUid(uid)

            // 5.帖子被点赞的总数 帖子被收藏的数量
            let articleLikedCount = 0
            let articleStardCount = 0
            const userArticleList = await article.selectInArticleTableByUid(uid)
            for (let i = 0; i < userArticleList.length; i++) {
                const aid = userArticleList[ i ].aid
                // 查询该帖子被点赞的总数
                const [ likeCount ] = await article.countInLikeArticleTableByAid(aid)
                articleLikedCount += likeCount.total
                // 查询该帖子被收藏的总数
                const [ starCount ] = await article.countInStarArticleTableByAid(aid)
                articleStardCount += starCount.total
            }
            // 6.评论被点赞的总数
            let commentLikedCount = 0
            const userCommentList = await article.selectInCommentTableByUid(uid)
            for (let i = 0; i < userCommentList.length; i++) {
                // 查询该评论被点赞的总数
                const [ likeCount ] = await article.countInLikeCommentTabeByCid(userCommentList[ i ].cid)
                commentLikedCount += likeCount.total
            }

            return Promise.resolve({
                ...userInfo,
                is_followed: userIsFollowed,
                is_fans: userIsFans,
                fans_count: fansCount.total,
                follow_count: followCount.total,
                bar: {
                    create_bar_count: barCount.total,
                    follow_bar_count: followBarCount.total,
                },
                article: {
                    article_count: articleCount.total,
                    article_star_count: starArticleCount.total,
                    article_stared_count: articleStardCount,
                    article_liked_count: articleLikedCount,
                    article_like_count: likeArticleCount.total
                },
                comment: {
                    comment_count: commentCount.total,
                    comment_liked_count: commentLikedCount,
                    comment_like_count: likeCommentCount.total
                }
            })

        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 获取我的信息
     * 1.获取我的信息
     * 2.获取粉丝、关注数量
     * 3.获取关注的吧数量、创建的吧
     * 4.获取发送的帖子数量，发送的评论数量
     * 5.获取点赞帖子、收藏帖子、点赞评论的数量
     * 6.获取我的帖子被点赞的数量，我的帖子被收藏的数量，我的评论被点赞数量
     * @param uid 当前登录的用户id
     * @returns 
     */
    async getUserInfoV2 (uid: number) {
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
                // 获取点赞帖子的总数
                const [ likeArticleCount ] = await article.countInLikeArticleTableByUid(uid)
                // 6.获取用户所有的帖子列表来查询每个帖子的点赞数量以及收藏数量
                const userArticleList = await article.selectInArticleTableByUid(uid)
                // 用户所有帖子被点赞的总数
                let articleLikedCount = 0;
                let articleStaredCount = 0;
                for (let i = 0; i < userArticleList.length; i++) {
                    // 获取帖子点赞数量
                    const [ likeCount ] = await article.countInLikeArticleTableByAid(userArticleList[ i ].aid)
                    if (likeCount.total) {
                        articleLikedCount += likeCount.total
                    }
                    // 获取帖子收藏数量
                    const [ starCount ] = await article.countInStarArticleTableByAid(userArticleList[ i ].aid)
                    if (starCount.total) {
                        articleStaredCount += starCount.total
                    }
                }
                // 7.获取用户所有的评论来查询被点赞的总数
                const userCommentList = await article.selectInCommentTableByUid(uid)
                // 所有评论被点赞的总数
                let commentLikedCount = 0;
                for (let i = 0; i < userCommentList.length; i++) {
                    const [ count ] = await article.countInLikeCommentTabeByCid(userCommentList[ i ].cid)
                    if (count && count.total) {
                        commentLikedCount += count.total
                    }
                }

                // 8.获取用户收藏帖子的总数
                const [ starArticleCount ] = await article.countInStarArticleTableByUid(uid)

                // 9.获取用户关注吧的总数
                const [ followBarCount ] = await bar.selectFollowByUidCount(uid)

                // 10.获取用户点赞评论的总数
                const [ commentLikeCount ] = await article.countInLikeCommentTableByUid(uid)

                // 11.获取用户创建的吧数量
                const [ barCount ] = await bar.countInBarTableByUid(uid)

                return Promise.resolve({
                    ...userInfo,
                    fans_count: fansCount.total,
                    follow_count: followCount.total,
                    bar: {
                        create_bar_count: barCount.total,
                        follow_bar_count: followBarCount.total,
                    },
                    article: {
                        article_count: articleCount.total,
                        article_liked_count: articleLikedCount,
                        article_like_count: likeArticleCount.total,
                        article_star_count: starArticleCount.total,
                        article_stared_count: articleStaredCount
                    },
                    comment: {
                        comment_count: commentCount.total,
                        comment_liked_count: commentLikedCount,
                        comment_like_count: commentLikeCount.total
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
}

export default UserService