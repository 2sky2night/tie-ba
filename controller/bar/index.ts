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
async function createBar (ctx: Context) {
    const body = (ctx.request as any).body as BarBody
    if (!body.bname || !body.bdesc || !body.photo) {
        ctx.status = 400
        ctx.body = response(null, '有参数未携带', 400)
        return
    }
    try {
        // 把用户token 解析出来uid
        const user = ctx.state.user as Token
        if (user.uid) {
            // 创建吧
            const res = await barService.createBar({ ...body, uid: user.uid })
            if (res) {
                // 创建成功
                ctx.body = response(null, '创建吧成功!', 200)
            } else {
                // 吧名重复
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
 * 获取所有的吧
 * @param ctx 
 * @returns 返回所有吧
 */
async function getAllBar (ctx: Context) {
    try {
        const res = await barService.findAllBar()
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
async function getBarInfo (ctx: Context) {
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
                    ctx.body = response(null, '获取吧数据失败,该吧不存在!', 400)
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
async function followBar (ctx: Context) {
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
async function canceFollowBar (ctx: Context) {
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
async function getBarFollowUserList (ctx: Context) {

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

    if (isNaN(bid) || isNaN(limit) || isNaN(offset)) {
        ctx.status = 400
        ctx.body = response(null, '参数不合法!', 400)
        return
    }

    // 3. 调用service层获取数据
    try {
        const res = await barService.getBarFollowUser(bid, uid, limit, offset)
        ctx.body = response(res, 'ok')
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
async function getUserFollowBarList (ctx: Context) {

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

    if (isNaN(uid) || isNaN(limit) || isNaN(offset)) {
        ctx.status = 400
        ctx.body = response(null, '参数不合法!', 400)
        return
    }

    // 3. 调用service层获取数据
    try {
        const res = await barService.getUserFollowBar(uid, currentUid, limit, offset)
        ctx.body = response(res, 'ok')
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }

}

export default {
    createBar,
    getAllBar,
    getBarInfo,
    followBar,
    canceFollowBar,
    getBarFollowUserList,
    getUserFollowBarList
}