import type { ArticleBaseItem, CommentBaseItem, ReplyBaseItem } from "../../model/article/types"
import type { ArticleItem, CommentItem, ReplyItem } from "./types"
import ArticleModel from "../../model/article"
import UserModel from "../../model/user"
import BarModel from "../../model/bar"

const article = new ArticleModel()
const user = new UserModel()
const bar = new BarModel()

/**
 * 遍历帖子列表 获取帖子的其他数据
 * 1.帖子点赞、收藏、评论数量，当前用户对帖子的点赞、收藏状态
 * 2.帖子创建者信息、当前用户对楼主的关注状态、粉丝状态
 * 3.帖子所属吧的信息，当前用户是否关注吧
 * @param articleList 帖子列表
 * @param uid 当前登录的用户id
 */
export async function getArticleList (articleList: ArticleBaseItem[], uid: number | undefined) {
    try {
        const list: ArticleItem[] = []
        for (let i = 0; i < articleList.length; i++) {
            const aid = articleList[ i ].aid
            // 1.查询帖子点赞数量
            const [ likeCount ] = await article.countInLikeArticleTableByAid(aid)
            // 2.查询帖子收藏数量
            const [ starCount ] = await article.countInStarArticleTableByAid(aid)
            // 3.查询帖子评论数量
            const [ commentCount ] = await article.countInCommentTableByAid(aid)
            // 4.查询当前用户对帖子的状态
            const isLiked = uid === undefined ? false : (await article.selectInLikeArticleTableByAidAndUid(uid, aid)).length ? true : false
            const isStar = uid === undefined ? false : (await article.selectInStarArticleTableByUidAndAid(uid, aid)).length ? true : false
            // 5.查询该帖子的创建者信息
            // 查询是否已经存在该用户信息了
            const userExist = list.find(ele => ele.uid === articleList[ i ].uid)
            const userInfo = userExist ? { uid: userExist.uid, username: userExist.user.username, createTime: userExist.user.createTime, avatar: userExist.user.avatar, udesc: userExist.user.udesc } : (await user.selectByUid(articleList[ i ].uid))[ 0 ]
            let isFollowedUser = false
            let isFollowedMe = false
            if (userExist) {
                // 用户存在则,复制当前用户对楼主的关注状态
                isFollowedUser = userExist.user.is_followed
                isFollowedMe = userExist.user.is_fans
            } else {
                // 用户不存在,查询当前用户对楼主的关注状态
                isFollowedUser = uid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, articleList[ i ].uid)).length ? true : false
                isFollowedMe = uid === undefined ? false : (await user.selectByUidAndUidIsFollow(articleList[ i ].uid, uid)).length ? true : false
            }

            // 6.查询对应吧的信息
            const barExist = list.find(ele => ele.bid === articleList[ i ].bid)
            const barInfor = barExist ? barExist.bar : (await bar.selectByBid(articleList[ i ].bid))[ 0 ]
            let isFollowedBar = false
            //  查询当前用户对吧的关注状态
            if (barExist) {
                isFollowedBar = barExist.bar.is_followed
            } else {
                isFollowedBar = uid === undefined ? false : (await bar.selectFollowByUidAndBid(articleList[ i ].bid, uid)).length ? true : false
            }


            list.push({
                aid: articleList[ i ].aid,
                title: articleList[ i ].title,
                content: articleList[ i ].content,
                // @ts-ignore
                photo: articleList[ i ].photo ? articleList[ i ].photo.split(',') : null,
                createTime: articleList[ i ].createTime,
                uid: articleList[ i ].uid,
                bid: articleList[ i ].bid,
                like_count: likeCount.total,
                is_liked: isLiked,
                star_count: starCount.total,
                is_star: isStar,
                comment_count: commentCount.total,
                user: {
                    ...userInfo,
                    is_followed: isFollowedUser,
                    is_fans: isFollowedMe
                },
                bar: {
                    ...barInfor,
                    is_followed: isFollowedBar
                }
            })

        }
        return Promise.resolve(list)

    } catch (error) {
        return Promise.reject(error)
    }
}

/**
 * 遍历帖子id列表获取帖子信息
 * 0.查询帖子的信息
 * 1.帖子点赞、收藏、评论数量，当前用户对帖子的点赞、收藏状态
 * 2.帖子创建者信息、当前用户对楼主的关注状态、粉丝状态
 * 3.帖子所属吧的信息，当前用户是否关注吧
 * @param articleIdList 帖子id列表
 * @param uid 当前登录的用户id
 */
export async function getArticleListWithId (articleIdList: number[], uid: number | undefined) {
    try {
        const list: ArticleItem[] = []
        for (let i = 0; i < articleIdList.length; i++) {

            const aid = articleIdList[ i ]
            // 1.查询帖子信息
            const [ articleInfo ] = await article.selectInArticleTableByAid(aid)
            // 2.获取帖子点赞数量
            const [ likeCount ] = await article.countInLikeArticleTableByAid(aid)
            // 3.获取帖子收藏数量
            const [ starCount ] = await article.countInStarArticleTableByAid(aid)
            // 4.获取帖子评论数量
            const [ commentCount ] = await article.countInCommentTableByAid(aid)
            // 5.获取当前用户对帖子的点赞状态
            const isLiked = uid === undefined ? false : (await article.selectInLikeArticleTableByAidAndUid(uid, aid)).length ? true : false
            // 6.获取当前用户对帖子的收藏状态
            const isStar = uid === undefined ? false : (await article.selectInStarArticleTableByUidAndAid(uid, aid)).length ? true : false
            // 7.帖子所属吧的信息
            const [ barInfo ] = await bar.selectByBid(articleInfo.bid)
            // 8.获取吧关注的状态
            const isFollowedBar = uid === undefined ? false : (await bar.selectFollowByUidAndBid(articleInfo.bid, uid)).length ? true : false
            // 9.获取楼主信息
            const [ userInfo ] = await user.selectByUid(articleInfo.uid)
            // 10.获取对楼主的关注状态
            const isFollowedUser = uid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, userInfo.uid)).length ? true : false
            // 10.楼主是否关注了我？
            const isFollowedMe = uid === undefined ? false : (await user.selectByUidAndUidIsFollow(userInfo.uid, uid)).length ? true : false

            list.push({
                aid: articleInfo.aid,
                title: articleInfo.title,
                content: articleInfo.content,
                createTime: articleInfo.createTime,
                bid: articleInfo.bid,
                uid: articleInfo.uid,
                photo: articleInfo.photo ? articleInfo.photo.split(',') : null,
                like_count: likeCount.total,
                star_count: starCount.total,
                comment_count: commentCount.total,
                is_liked: isLiked,
                is_star: isStar,
                bar: {
                    ...barInfo,
                    is_followed: isFollowedBar
                },
                user: {
                    ...userInfo,
                    is_followed: isFollowedUser,
                    is_fans: isFollowedMe
                }
            })

        }
        return Promise.resolve(list)
    } catch (error) {
        return Promise.reject(error)
    }
}

/**
 * 遍历评论列表查询评论的其他信息
 * 1.评论被点赞的数量
 * 2.评论的创建者信息 以及当前用户对评论创建者的关注状态
 * 3.当前用户对评论的点赞状态
 * @param commentList 评论列表
 * @param uid 当前登录的用户id
 */
export async function getCommentList (commentList: CommentBaseItem[], uid: number | undefined) {
    try {
        const list: CommentItem[] = []

        for (let i = 0; i < commentList.length; i++) {
            const cid = commentList[ i ].cid
            // 查询评论被点赞的数量
            const [ likeCount ] = await article.countInLikeCommentTabeByCid(cid)
            // 查询当前评论者的信息
            // 若当前已经记录过该用户信息了 则直接复用用户信息
            const userExist = list.find(ele => ele.uid === commentList[ i ].uid)
            const userInfo = userExist ? { uid: userExist.user.uid, username: userExist.user.username, avatar: userExist.user.avatar, createTime: userExist.user.createTime, udesc: userExist.user.udesc } : (await user.selectByUid(commentList[ i ].uid))[ 0 ]
            let isFollowedUser = false
            let isFollowedMe = false
            if (userExist) {
                // 若当前有用户记录 则直接复用关注状态
                isFollowedUser = userExist.user.is_followed
                isFollowedMe = userExist.user.is_fans
            } else {
                // 没有用户记录 需要查询来获取用户对其关注状态
                isFollowedUser = uid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, commentList[ i ].uid)).length ? true : false;
                isFollowedMe = uid === undefined ? false : (await user.selectByUidAndUidIsFollow(commentList[ i ].uid, uid)).length ? true : false;
            }
            // 是否点赞该评论
            const isLiked = uid === undefined ? false : (await article.selectInLikeCommentTableByCidAndUid(cid, uid)).length ? true : false;
            // 获取回复总数
            const [ replyCount ] = await article.countInReplyTableByCid(cid)
            // 获取该评论的热门3条回复
            const _replyList = await getCommentHotReply(cid,3)
            const replyList = await getCommentReplyInfoList(_replyList, uid)
            list.push({
                cid: commentList[ i ].cid,
                content: commentList[ i ].content,
                aid: commentList[ i ].aid,
                uid: commentList[ i ].uid,
                // @ts-ignore
                photo: commentList[ i ].photo === null ? null : commentList[ i ].photo.split(','),
                createTime: commentList[ i ].createTime,
                is_liked: isLiked,
                like_count: likeCount.total,
                reply: {
                    list: replyList,
                    total: replyCount.total
                },
                user: {
                    ...userInfo,
                    is_followed: isFollowedUser,
                    is_fans: isFollowedMe,
                }
            })

        }

        return Promise.resolve(list)
    } catch (error) {
        return Promise.reject(error)
    }
}

/**
 * 遍历评论列表获取其他信息
 * @param commentList 评论列表项 每一项必须包含点赞数量
 * @param uid 
 * @returns 
 */
export async function getCommentListWithOutLikeCount (commentList: (CommentBaseItem & { like_count: number })[], uid: number | undefined) {
    try {
        const list: CommentItem[] = []

        for (let i = 0; i < commentList.length; i++) {
            const cid = commentList[ i ].cid
            // 查询当前评论者的信息
            // 若当前已经记录过该用户信息了 则直接复用用户信息
            const userExist = list.find(ele => ele.uid === commentList[ i ].uid)
            const userInfo = userExist ? { uid: userExist.user.uid, username: userExist.user.username, avatar: userExist.user.avatar, createTime: userExist.user.createTime, udesc: userExist.user.udesc } : (await user.selectByUid(commentList[ i ].uid))[ 0 ]
            let isFollowedUser = false
            let isFollowedMe = false
            if (userExist) {
                // 若当前有用户记录 则直接复用关注状态
                isFollowedUser = userExist.user.is_followed
                isFollowedMe = userExist.user.is_fans
            } else {
                // 没有用户记录 需要查询来获取用户对其关注状态
                isFollowedUser = uid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, commentList[ i ].uid)).length ? true : false;
                isFollowedMe = uid === undefined ? false : (await user.selectByUidAndUidIsFollow(commentList[ i ].uid, uid)).length ? true : false;
            }
            // 是否点赞该评论
            const isLiked = uid === undefined ? false : (await article.selectInLikeCommentTableByCidAndUid(cid, uid)).length ? true : false;
            // 获取回复总数
            const [ replyCount ] = await article.countInReplyTableByCid(cid)
            // 获取该评论的热门5条回复
            const _replyList = await getCommentHotReply(cid,5)
            const replyList = await getCommentReplyInfoList(_replyList, uid)
            list.push({
                cid: commentList[ i ].cid,
                content: commentList[ i ].content,
                aid: commentList[ i ].aid,
                uid: commentList[ i ].uid,
                // @ts-ignore
                photo: commentList[ i ].photo === null ? null : commentList[ i ].photo.split(','),
                createTime: commentList[ i ].createTime,
                is_liked: isLiked,
                like_count: commentList[ i ].like_count,
                reply: {
                    list: replyList,
                    total: replyCount.total
                },
                user: {
                    ...userInfo,
                    is_followed: isFollowedUser,
                    is_fans: isFollowedMe
                }
            })

        }

        return Promise.resolve(list)
    } catch (error) {
        return Promise.reject(error)
    }
}

/**
 * 遍历帖子列表 获取帖子详情数据
 * @param articleList 帖子列表项 每一项必须包含点赞数量
 * @param uid 
 * @returns 
 */
export async function getArticleListWithoutLikeCount (articleList: (ArticleBaseItem & { like_count: number })[], uid: number | undefined) {
    try {
        const list: ArticleItem[] = []
        for (let i = 0; i < articleList.length; i++) {
            const aid = articleList[ i ].aid
            // 1.查询帖子收藏数量
            const [ starCount ] = await article.countInStarArticleTableByAid(aid)
            // 2.查询帖子评论数量
            const [ commentCount ] = await article.countInCommentTableByAid(aid)
            // 4.查询当前用户对帖子的状态
            const isLiked = uid === undefined ? false : (await article.selectInLikeArticleTableByAidAndUid(uid, aid)).length ? true : false
            const isStar = uid === undefined ? false : (await article.selectInStarArticleTableByUidAndAid(uid, aid)).length ? true : false
            // 6.查询该帖子的创建者信息
            // 查询是否已经存在该用户信息了
            const userExist = list.find(ele => ele.uid === articleList[ i ].uid)
            const userInfo = userExist ? { uid: userExist.uid, username: userExist.user.username, createTime: userExist.user.createTime, avatar: userExist.user.avatar, udesc: userExist.user.udesc } : (await user.selectByUid(articleList[ i ].uid))[ 0 ]
            let isFollowedUser = false
            let isFollowedMe = false
            if (userExist) {
                // 用户存在则,复制当前用户对楼主的关注状态
                isFollowedUser = userExist.user.is_followed
                isFollowedMe = userExist.user.is_fans
            } else {
                // 用户不存在,查询当前用户对楼主的关注状态
                isFollowedUser = uid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, articleList[ i ].uid)).length ? true : false
                isFollowedMe = uid === undefined ? false : (await user.selectByUidAndUidIsFollow(articleList[ i ].uid, uid)).length ? true : false
            }

            // 6.查询对应吧的信息
            const barExist = list.find(ele => ele.bid === articleList[ i ].bid)
            const barInfor = barExist ? barExist.bar : (await bar.selectByBid(articleList[ i ].bid))[ 0 ]
            let isFollowedBar = false
            //  查询当前用户对吧的关注状态
            if (barExist) {
                isFollowedBar = barExist.bar.is_followed
            } else {
                isFollowedBar = uid === undefined ? false : (await bar.selectFollowByUidAndBid(articleList[ i ].bid, uid)).length ? true : false
            }


            list.push({
                aid: articleList[ i ].aid,
                title: articleList[ i ].title,
                content: articleList[ i ].content,
                // @ts-ignore
                photo: articleList[ i ].photo ? articleList[ i ].photo.split(',') : null,
                createTime: articleList[ i ].createTime,
                uid: articleList[ i ].uid,
                bid: articleList[ i ].bid,
                like_count: articleList[ i ].like_count,
                is_liked: isLiked,
                star_count: starCount.total,
                is_star: isStar,
                comment_count: commentCount.total,
                user: {
                    ...userInfo,
                    is_followed: isFollowedUser,
                    is_fans: isFollowedMe
                },
                bar: {
                    ...barInfor,
                    is_followed: isFollowedBar
                }
            })

        }
        return Promise.resolve(list)

    } catch (error) {
        return Promise.reject(error)
    }
}

/**
 * 根据回复列表 查询详情数据
 * @param list 回复列表
 * @param uid 当前登录的用户
 */
export async function getCommentReplyInfoList (replyList: ReplyBaseItem[], uid: number | undefined) {
    try {
        const list: ReplyItem[] = []
        for (let i = 0; i < replyList.length; i++) {
            const rid = replyList[ i ].rid
            // 点赞总数
            const [ likeCount ] = await article.countInLikeReplyTableByRid(rid)
            // 当前用户是否点赞
            const isLiked = uid === undefined ? false : (await article.selectInLikeReplyTable(uid, rid)).length > 0
            // 发送回复的用户数据
            const [ userInfo ] = await user.selectByUid(replyList[ i ].uid)
            // 若该回复是对某个回复进行回复的 还需要查询该目标回复的数据
            if (replyList[ i ].type === 2) {
                // 查询回复的对象
                const [ replyBase ] = await article.selectInReplyTableByRid(replyList[ i ].id)
                // 查询该回复的用户数据
                const [ replyUserInfo ] = await user.selectByUid(replyBase.uid)
                list.push({
                    ...replyList[ i ],
                    like_count: likeCount.total,
                    is_liked: isLiked,
                    user: userInfo,
                    reply: {
                        ...replyBase,
                        user: replyUserInfo
                    }
                })
            } else {
                // 对于评论的回复
                list.push({
                    ...replyList[ i ],
                    like_count: likeCount.total,
                    is_liked: isLiked,
                    user: userInfo
                })
            }
        }
        return Promise.resolve(list)
    } catch (error) {
        return Promise.reject(error)
    }
}

/**
 * 获取该评论的热门回复 n条
 * @param cid 评论id
 * @param limit 获取多少条目
 */
export async function getCommentHotReply (cid: number,limit:number) {
    try {
        // 根据点赞数量 让回复列表倒叙排列
        const replyList = await article.selectInReplyTableByCid(cid)
        // 获取所有回复的点赞数量
        const likeList = await article.getCommentReplyCount(cid)
        // 回复列表
        const list: (ReplyBaseItem & { like_count: number })[] = []
        replyList.forEach(ele => {
            const item = likeList.find(item => item.rid === ele.rid)
            if (item) {
                // 有点赞数据
                list.push({
                    ...ele,
                    like_count: item.total
                })
            } else {
                list.push({
                    ...ele,
                    like_count: 0
                })
            }
        })
        // 根据回复列表对点赞数量进行降序排序
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < list.length - 1; j++) {
                if (list[ j ].like_count < list[ j + 1 ].like_count) {
                    const temp = list[ j ]
                    list[ j ] = list[ j + 1 ]
                    list[ j + 1 ] = temp
                }
            }
        }
        // 只要前n个
        return Promise.resolve(list.slice(0,limit))
    } catch (error) {
        return Promise.reject(error)
    }
}