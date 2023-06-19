import type { ArticleBaseItem } from "../../model/article/types"
import type { ArticleItem } from "./types"
import type { User, UserInfo } from '../user/types'
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
            const userInfo = userExist ? {uid:userExist.uid,username:userExist.user.username,createTime:userExist.user.createTime,avatar:userExist.user.avatar} : (await user.selectByUid(articleList[ i ].uid))[ 0 ]
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
 * 通过遍历用户id列表,查询:
 * 1.对应的用户信息
 * 2.当前用户对其关注状态
 * 3.该用户的粉丝关注数量
 * @param userIdList 用户id列表
 * @param currentUid 当前登录的用户id
 * @returns 
 */
export async function getUserListById (userIdList: number[], currentUid: number | undefined) {
    try {
        const userList: UserInfo[] = []
        for (let i = 0; i < userIdList.length; i++) {
            // 1.查询用户数据
            const [ userInfo ] = await user.selectByUid(userIdList[ i ])
            // 2.查询当前用户对此用户的状态
            const isFollowedUser = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(currentUid, userIdList[ i ])).length ? true : false;
            const isFollowedMe = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(userIdList[ i ], currentUid)).length ? true : false;
            // 3.查询粉丝、关注数量
            const [ fansCount ] = await user.selectByUidFollowedScopedFollowCount(userIdList[ i ])
            const [ followCount ] = await user.selectByUidScopedFollowCount(userIdList[ i ])
            userList.push({
                ...userInfo,
                is_followed: isFollowedUser,
                is_fans: isFollowedMe,
                fans_count: fansCount.total,
                follow_user_count: followCount.total
            })
        }
        return Promise.resolve(userList)
    } catch (error) {
        return Promise.reject(error)
    }
}