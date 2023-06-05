import type { Next, Context } from "koa";
import response from "../utils/tools/response";
/**
 * 解析捕获token出错的中间件
 * @param ctx 
 * @param next 
 */
export default async function authorizationCatcher(ctx: Context, next: Next) {
    try {
        if (!ctx.header.authorization) {
            // 未携带token
            ctx.status = 401;
            ctx.body = response(null, '未携带 token', 400)
        } else {
            await next();
        }
    } catch (err) {
        // 由 koa-jwt 抛出的错误
        if (err.status === 401) {
            // 强制修改网络状态, 在接口中返回业务类型状态码(根据需求)
            ctx.status = 401;
            ctx.body = response(null, '无效的 token', 400)
        } else {
            throw err;
        }
    }
}
