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
async function createBar(ctx: Context) {
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
async function getAllBar(ctx: Context) {
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
async function getBarInfo(ctx: Context) {
    const token = ctx.state.user as Token;
    const query = ctx.query
    console.log(token)
    if (query.bid === undefined) {
        ctx.status = 400
        return ctx.body = response(null, '参数未携带', 400)
    }
    try {
        // 获取吧的数据 (根据是否传入token来查询当前用户是否关注了吧)
        const res = await barService.getBarInfo(+query.bid, ctx.header.authorization ? token.uid : undefined)
        ctx.body = response(res, 'ok')
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }
}

/**
 * 关注吧
 * @param ctx 
 */
async function followBar(ctx: Context) {
    // 查询参数检验
    if (!ctx.query.bid) {
        ctx.status = 400
        return ctx.body = response(null, '参数未携带', 400)
    }
    // 解析出token数据
    const user = ctx.state.user as Token
    try {
        if (user.uid) {
            // token解析成功
            const res = await barService.followBar(+ctx.query.bid, user.uid)
            if (res) {
                return ctx.body = response(null, '关注成功!')
            } else {
                return ctx.body = response(null, '已经关注了!', 400)
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

export default {
    createBar,
    getAllBar,
    getBarInfo,
    followBar
}