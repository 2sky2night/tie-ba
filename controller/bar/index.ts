// 吧的模型层
import BarService from "../../service/bar";
// 类型
import type { Context } from "koa";
import type { BarBody } from "../../model/bar/types";
// 工具函数
import response from '../../utils/tools/response'

/**
 * 创建吧
 * @param ctx 
 */
async function createBar(ctx: Context) {
    const body = (ctx.request as any).body as BarBody
    if (!body.bname) {
        ctx.status = 400
        ctx.body = response(null, '有参数未携带', 400)
    }
    try {
        // 把用户token 解析出来username

    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}
