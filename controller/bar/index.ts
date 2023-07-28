// 吧的模型层
import BarService from "../../service/bar";
// 类型
import type { Context } from "koa";
import type { BarBody } from "../../model/bar/types";
import type { Token } from '../user/types'
// 工具函数
import response from '../../utils/tools/response'

/**
 * bar的service层
 */
const barService = new BarService()

/**
 * 创建吧
 * @param ctx 
 * @returns 创建吧的成功与否的信息
 */
async function toCreateBar (ctx: Context) {
    const body = (ctx.request as any).body as BarBody
    if (!body.bname || !body.bdesc || !body.photo) {
        ctx.status = 400
        ctx.body = response(null, '有参数未携带', 400)
        return
    }
    if (!body.bname.trim().length) {
        ctx.status = 400
        ctx.body = response(null, '吧名不能为空!', 400)
        return
    }
    try {
        // 把用户token 解析出来uid
        const user = ctx.state.user as Token
        if (user.uid) {
            // 创建吧
            const res = await barService.createBar({ bdesc: body.bdesc, bname: body.bname.trim(), photo: body.photo, uid: user.uid })
            if (res) {
                // 创建成功
                ctx.body = response(null, '创建吧成功!', 200)
            } else {
                // 吧名重复
                ctx.status = 400;
                ctx.body = response(null, '吧名重复!', 400)
            }
        } else {
            // token错误
            await Promise.reject()
        }
    } catch (error) {
        console.log(error)
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}


/** 
 * 获取所有的吧 近包含吧的基本数据
 * @param ctx 
 * @returns 返回所有吧
 */
async function toGetAllBar (ctx: Context) {
    const offset = ctx.query.offset ? +ctx.query.offset : 0
    const limit = ctx.query.limit ? +ctx.query.limit : 20
    const desc = ctx.query.desc ? +ctx.query.desc : 1

    if (isNaN(offset) || isNaN(limit) || isNaN(desc)) {
        ctx.status = 400
        return ctx.body = response(null, '参数非法', 400)
    }

    try {
        const res = await barService.getAllBarBriefly(limit, offset, desc ? true : false)
        ctx.body = response(res, 'ok')
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }
}

/**
 * 获取吧的数据 
 * 1.吧关注状态:若用户未登录,吧关注状态为false,若用户token解析合法通过用户id在用户关注吧中查询返回关注状态
 * 2.吧创建者的关注状态::若用户未登录,吧关注状态为false,若用户token解析合法通过用户id在用户关注中查询返回关注状态
 * @param ctx 
 * @returns 返回吧和吧创建者的数据
 */
async function toGetBarInfo (ctx: Context) {
    const token = ctx.state.user as Token;
    const query = ctx.query
    if (query.bid === undefined) {
        ctx.status = 400
        ctx.body = response(null, '参数未携带', 400)
    } else {
        const bid = + query.bid
        if (isNaN(bid) || bid === 0) {
            // 参数非法
            ctx.status = 400
            ctx.body = response(null, '参数非法', 400)
        } else {
            // 参数合法
            try {
                // 获取吧的数据 (根据是否传入token来查询当前用户是否关注了吧)
                const res = await barService.getBarInfo(bid, ctx.header.authorization ? token.uid : undefined)
                if (res === 0) {
                    ctx.status = 404;
                    ctx.body = response(null, '获取吧数据失败,该吧不存在!', 404)
                } else {
                    ctx.body = response(res, 'ok')
                }
            } catch (error) {
                console.log(error)
                ctx.status = 500;
                ctx.body = response(null, '服务器出错了!', 500)
            }
        }
    }

}

/**
 * 关注吧
 * @param ctx 
 */
async function toFollowBar (ctx: Context) {
    // 查询参数检验
    if (!ctx.query.bid) {
        ctx.status = 400
        return ctx.body = response(null, '参数未携带', 400)
    }
    const bid = +ctx.query.bid
    if (isNaN(bid) || bid === 0) {
        // 参数非法
        ctx.status = 400
        return ctx.body = response(null, '参数非法', 400)
    } else {
        // 解析出token数据
        const user = ctx.state.user as Token
        try {
            if (user.uid) {
                // token解析成功
                const res = await barService.toFollowBar(bid, user.uid)
                if (res) {
                    return ctx.body = response(null, '关注成功!')
                } else {
                    ctx.status = 400;
                    return ctx.body = response(null, '关注吧失败,已经关注了!', 400)
                }
            } else {
                // token解析失败
                await Promise.reject()
            }
        } catch (error) {
            console.log(error)
            ctx.status = 500;
            ctx.body = response(null, '服务器出错了!', 500)
        }
    }
}


/**
 * 取消关注吧
 * @param ctx 
 */
async function toCanceFollowBar (ctx: Context) {
    // 查询参数检验
    if (!ctx.query.bid) {
        ctx.status = 400
        return ctx.body = response(null, '有参数未携带!', 400)
    }
    const bid = +ctx.query.bid
    if (isNaN(bid) || bid === 0) {
        // 参数非法
        ctx.status = 400
        return ctx.body = response(null, '参数非法!', 400)
    }
    // 解析出token数据
    const token = ctx.state.user as Token
    try {
        const res = await barService.toCancelFollowBar(bid, token.uid)
        if (res) {
            // 取消关注成功
            ctx.body = response(null, '取消关注成功!')
        } else {
            // 当前未关注吧 不能取消关注
            ctx.status = 400;
            ctx.body = response(null, '取消关注吧失败,当前未关注该吧!', 400)
        }
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }

}

/**
 * 获取关注该吧的用户
 * @param ctx 
 * @returns 
 */
async function toGetBarFollowUserList (ctx: Context) {

    // 1.检查是否携带token来获取当前登录用户的id
    let uid: undefined | null | number = null;
    if (ctx.header.authorization) {
        // 若携带了token且被解析成功 则获取token中的uid数据
        uid = (ctx.state.user as Token).uid
    } else {
        // 未携带token
        uid = undefined
    }

    //  2.检验查询参数是否合法
    if (ctx.query.bid === undefined) {
        ctx.status = 400
        ctx.body = response(null, '有参数未携带!', 400)
        return
    }

    const bid = +ctx.query.bid;
    const limit = ctx.query.limit ? +ctx.query.limit : 20;
    const offset = ctx.query.offset ? +ctx.query.offset : 0;
    const desc = ctx.query.desc ? +ctx.query.desc : 1;


    if (isNaN(bid) || isNaN(limit) || isNaN(offset) || isNaN(desc)) {
        ctx.status = 400
        ctx.body = response(null, '参数不合法!', 400)
        return

    }

    // 3. 调用service层获取数据
    try {
        const res = await barService.getFollowBarUser(bid, uid, limit, offset, desc ? true : false)
        if (res) {
            ctx.body = response(res, 'ok')
        } else {
            ctx.status = 404
            ctx.body = response(null, '获取关注该吧的用户列表失败,该吧不存在!', 404)
        }
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }

}

/**
 * 获取用户关注吧的列表
 * @param ctx 
 * @returns 
 */
async function toGetUserFollowBarList (ctx: Context) {

    // 1.检查是否携带token来获取当前登录用户的id
    let currentUid: undefined | null | number = null;
    if (ctx.header.authorization) {
        // 若携带了token且被解析成功 则获取token中的uid数据
        currentUid = (ctx.state.user as Token).uid
    } else {
        // 未携带token
        currentUid = undefined
    }

    //  2.检验查询参数是否合法
    if (ctx.query.uid === undefined) {
        ctx.status = 400
        ctx.body = response(null, '有参数未携带!', 400)
        return
    }

    const uid = +ctx.query.uid;
    const limit = ctx.query.limit ? +ctx.query.limit : 20;
    const offset = ctx.query.offset ? +ctx.query.offset : 0;
    const desc = ctx.query.desc ? +ctx.query.desc : 1;

    if (isNaN(uid) || isNaN(limit) || isNaN(offset) || isNaN(desc)) {
        ctx.status = 400
        ctx.body = response(null, '参数不合法!', 400)
        return
    }

    // 3. 调用service层获取数据
    try {
        const res = await barService.getUserFollowBar(uid, currentUid, limit, offset, desc ? true : false)
        if (res) {
            ctx.body = response(res, 'ok')
        } else {
            ctx.status = 404
            ctx.body = response(null, '获取用户关注的吧列表失败,用户不存在!', 404)
        }
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }

}

/**
 * 获取用户创建的吧列表
 * @param ctx 
 * @returns 
 */
async function toGetUserBarList (ctx: Context) {
    // 1.检查是否携带token来获取当前登录用户的id
    const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined

    //  2.检验查询参数是否合法
    if (ctx.query.uid === undefined) {
        ctx.status = 400
        ctx.body = response(null, '有参数未携带!', 400)
        return
    }

    const uid = +ctx.query.uid;
    const limit = ctx.query.limit ? +ctx.query.limit : 20;
    const offset = ctx.query.offset ? +ctx.query.offset : 0;
    const desc = ctx.query.desc ? +ctx.query.desc : 1;

    if (isNaN(uid) || isNaN(limit) || isNaN(offset) || isNaN(desc)) {
        ctx.status = 400
        ctx.body = response(null, '参数不合法!', 400)
        return
    }

    try {
        const res = await barService.getUserBarList(uid, currentUid, limit, offset, desc ? true : false)
        if (res) {
            ctx.body = response(res, 'ok')
        } else {
            ctx.status = 404
            ctx.body = response(null, '获取用户创建的吧列表失败,用户不存在!', 404)
        }
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }

}

/**
 * 获取吧列表
 * @param ctx 
 * @returns 
 */
async function toGetBarList (ctx: Context) {
    // 检查是否携带token来获取当前登录用户的id
    const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined
    // 解析查询参数
    const limit = ctx.query.limit ? +ctx.query.limit : 20;
    const offset = ctx.query.offset ? +ctx.query.offset : 0;
    const desc = ctx.query.desc ? +ctx.query.desc : 1;

    if (isNaN(limit) || isNaN(offset) || isNaN(desc)) {
        ctx.status = 400
        ctx.body = response(null, '参数不合法!', 400)
        return
    }

    try {
        const res = await barService.getBarList(currentUid, limit, offset, desc ? true : false)
        ctx.body = response(res, 'ok')
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }

}
/**
 * 发现吧
 * @param ctx 
 * @returns 
 */
async function toGetHotBarList (ctx: Context) {
    const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined;
    // 解析参数
    const limit = ctx.query.limit ? +ctx.query.limit : 20
    const offset = ctx.query.offset ? +ctx.query.offset : 0
    // 查询多少天帖子，只检索该时间段吧的帖子 (1:24小时 2:3天 3:15天 4:3个月 5:1年)
    const type = ctx.query.type ? +ctx.query.type : 1
    // 校验参数是否合法
    if (isNaN(limit) || isNaN(offset) || isNaN(type) || type > 5 || type < 1) {
        ctx.status = 400
        return ctx.body = response(null, '参数非法', 400)
    }
    let day = 1;
    switch (type) {
        case 1: break;
        case 2: day = 3; break;
        case 3: day = 15; break;
        case 4: day = 90; break;
        case 5: day = 365; break;
    }
    try {
        const res = await barService.getHotBarList(currentUid, limit, offset, day)
        ctx.body = response(res, 'ok')
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }
}

/**
 * 获取吧的简要信息
 * @param ctx 
 */
async function toGetBarBrieflyInfo (ctx: Context) {
    const uid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined
    // 未携带参数
    if (ctx.query.bid === undefined) {
        ctx.status = 400
        return ctx.body = response(null, '有参数未携带!', 400)
    }
    // 简要参数类型
    const bid = +ctx.query.bid
    if (isNaN(bid)) {
        ctx.status = 400
        ctx.body = response(null, '参数不合法!', 400)
    }

    try {
        const res = await barService.getBarBrieflyInfo(bid, uid)
        if (res) {
            ctx.body = response(res, 'ok')
        } else {
            // 吧不存在
            ctx.status = 404
            ctx.body = response(null, '获取吧简要数据失败,吧不存在!', 404)

        }
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }
}

/**
 * 获取吧的帖子列表
 * @param ctx 
 */
async function toGetBarArticleList (ctx: Context) {
    const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined;
    // 校验查询参数bid
    if (ctx.query.bid === undefined) {
        ctx.status = 400
        ctx.body = response(null, '参数未携带!', 400)
        return
    }
    const bid = +ctx.query.bid
    const limit = ctx.query.limit ? +ctx.query.limit : 20
    const offset = ctx.query.offset ? +ctx.query.offset : 0
    // 排序方式 默认降序
    const desc = ctx.query.desc ? +ctx.query.desc : 1
    // 排序依据 1热度 2时间 默认热度
    const type = ctx.query.type ? +ctx.query.type : 1

    if (isNaN(bid) || isNaN(limit) || isNaN(offset) || isNaN(desc) || (type !== 1 && type !== 2)) {
        ctx.status = 400
        ctx.body = response(null, '参数非法!', 400)
        return
    }

    try {
        const res = type === 1 ?
            await barService.getBarHotArticleList(bid, currentUid, limit, offset, desc ? true : false)
            : await barService.getBarArticleList(bid, currentUid, limit, offset, desc ? true : false)
        if (res) {
            ctx.body = response(res, 'ok')
        } else {
            ctx.status = 404
            ctx.body = response(null, '获取吧的帖子列表失败,吧不存在!', 404)
        }
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }
}

/**
 * 分页获取用户关注的吧列表 仅包含简要信息
 * @param ctx 
 */
async function toGetUserFollowBarListBriefly (ctx: Context) {
    const uid = (ctx.state.user as Token).uid

    const limit = ctx.query.limit ? +ctx.query.limit : 20;
    const offset = ctx.query.offset ? +ctx.query.offset : 0;
    const desc = ctx.query.desc ? +ctx.query.desc : 1;

    if (isNaN(limit) || isNaN(offset) || isNaN(desc)) {
        ctx.status = 400
        ctx.body = response(null, '参数不合法!', 400)
        return
    }

    try {
        const res = await barService.getUserAllFollowBarBriefly(uid, limit, offset, desc ? true : false)
        ctx.body = response(res, 'ok')
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }

}

/**
 * 用户签到吧
 * @param ctx 
 */
async function toUserCheckBar (ctx: Context) {
    const uid = (ctx.state.user as Token).uid

    // 解析查询参数
    if (ctx.query.bid === undefined) {
        ctx.status = 400
        return ctx.body = response(null, '参数未携带!', 400)
    }

    const bid = +ctx.query.bid
    // 校验参数
    if (isNaN(bid)) {
        ctx.status = 400
        return ctx.body = response(null, '参数非法', 400)
    }

    try {
        const res = await barService.userCheckBar(uid, bid)
        if (res === 1) {
            // 签到成功
            ctx.body = response(null, '签到成功!')
        } else if (res === 0) {
            // 已经签到过了
            ctx.status = 400
            ctx.body = response(null, '签到失败,今天已经签到过了!', 400)
        } else if (res === -1) {
            // 未关注吧
            ctx.status = 400
            ctx.body = response(null, '签到失败,您还未关注此吧!', 400)
        } else if (res === -2) {
            // 吧不存在
            ctx.status = 400
            ctx.body = response(null, '签到失败,吧不存在!', 400)
        }
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }

}
/**
 * 修改吧的等级制度头衔
 * @param ctx 
 */
async function toUpdateBarRank (ctx: Context) {
    const uid = (ctx.state.user as Token).uid
    const body = ctx.request.body
    // 校验参数
    if (body === undefined) {
        ctx.status = 400
        return ctx.body = response(null, '未携带请求体!', 400)
    }
    if (body.bid === undefined || body.rankLableList === undefined) {
        ctx.status = 400
        return ctx.body = response(null, '参数未携带!', 400)
    }
    const bid = +body.bid
    // 检验参数
    if (isNaN(bid) || !(body.rankLableList instanceof Array)) {
        ctx.status = 400
        return ctx.body = response(null, '参数非法!', 400)
    }
    // 吧等级制度昵称必须有15个，因为等级一共为15级
    if (body.rankLableList.length !== 15) {
        ctx.status = 400
        return ctx.body = response(null, '吧等级头衔昵称必须为15个!', 400)
    }

    try {
        const res = await barService.updateBarRank(uid, bid, body.rankLableList)
        if (res === 1) {
            ctx.body = response(null, '修改吧等级头衔昵称成功!')
        } else if (res === 0) {
            ctx.status = 400
            ctx.body = response(null, '修改吧等级头衔昵称失败,只有吧主才能修改等级头衔昵称!', 400)
        } else if (res === -1) {
            ctx.status = 400
            ctx.body = response(null, '修改吧等级头衔昵称失败,吧不存在!', 400)
        }
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }
}
/**
 * 获取吧的等级制度
 * @param ctx 
 */
async function toGetBarRankInfo (ctx: Context) {
    if (ctx.query.bid === undefined) {
        ctx.status = 400
        return ctx.body = response(null, '参数未携带!', 400)
    }
    const bid = +ctx.query.bid
    if (isNaN(bid)) {
        ctx.status = 400
        return ctx.body = response(null, '参数非法!', 400)
    }
    try {
        const res = await barService.getBarRankInfo(bid)
        if (res) {
            // 吧存在
            ctx.body = response(res, 'ok', 400)
        } else {
            // 吧不存在
            ctx.status = 400
            ctx.body = response(null, '获取吧等级制度失败,吧不存在!', 400)
        }
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }
}

/**
 * 接口：本吧等级排行榜
 */

/**
 * 接口：本吧等级分布
 */

export default {
    toCreateBar,
    toGetAllBar,
    toGetBarInfo,
    toFollowBar,
    toCanceFollowBar,
    toGetBarFollowUserList,
    toGetUserFollowBarList,
    toGetUserBarList,
    toGetBarList,
    toGetHotBarList,
    toGetBarBrieflyInfo,
    toGetBarArticleList,
    toGetUserFollowBarListBriefly,
    toUserCheckBar,
    toUpdateBarRank,
    toGetBarRankInfo
}