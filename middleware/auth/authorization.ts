import type { Next, Context } from "koa";
import jwt from 'jsonwebtoken'
import { SECRET_KEY, NO_AUTH } from '../../config'
import response from '../../utils/tools/response'

/**
 * 检验token的中间件
 * @param ctx 
 * @param next 
 */
export default async function authorizationCatcher (ctx: Context, next: Next) {
    if (NO_AUTH.includes(ctx.path)) {
        // 路由白名单
        await next()
    } else {
        // 需要检验token的
        try {
            if (!ctx.header.authorization) {
                // 未携带token
                ctx.status = 401;
                ctx.body = response(null, '未携带 token', 400)
            } else {
                // 携带了token需要进行验证 (需要先格式化token，把Bearer 截取掉)
                const tokenFormat = ctx.header.authorization.split(' ')[ 1 ]
                // 解析token中的数据
                const data = await new Promise((resolve, rejected) => {
                    jwt.verify(tokenFormat, SECRET_KEY, function (err, decoded) {
                        if (err) {
                            console.log(JSON.stringify(err))
                            // token解析失败
                            if (err.message === "invalid signature") {
                                // 无效的token
                                rejected(2)
                            } else if (err.message === "jwt expired") {
                                // token过期
                                rejected(1)
                            }
                        } else {
                            // token解析成功
                            resolve(decoded)
                        }
                    })
                })
                // 解析成功 （保存在上下文中）
                ctx.state.user = data
                await next()
            }
        } catch (err) {
            
            if (err === 1) {
                // token过期
                ctx.status = 401;
                ctx.body = response(null, 'token过期,请重新登陆', 400)
            } else if (err === 2) {
                // 无效的token
                ctx.status = 401;
                ctx.body = response(null, '无效的token', 400)
            } else {
                ctx.status = 500;
                ctx.body = response(null, '其他错误', 500)
            }
        }

    }
}
