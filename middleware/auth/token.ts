// 单独解析token的中间件(若未携带token则ctx.state.user={} 若token解析成功则ctx.state.user=对应数据)
import type { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'
import { SECRET_KEY } from '../../config'
import response from '../../utils/tools/response'

/**
 * 解析token数据保存在上下文中
 * @param ctx 上下文
 * @param next 放行
 */
export default async function tokenParse(ctx: Context, next: Next) {
    try {
        // 获取用户的token
        const token = ctx.header.authorization
        // 若传入token就进行解析
        if (token) {
            // 把token中多余的bearer去掉 否则解析会出错
            const formatToken = token.split(' ')[1]
            // 获取解析出来的token数据
            const data = await new Promise((resolve, rejected) => {
                jwt.verify(formatToken, SECRET_KEY, function (err, decoded) {
                    if (err) {
                        // token解析失败
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
            // 将token数据保存在ctx.state.use中
            ctx.state.user = data
        } else {
            //未传入token 交给控制层进行处理

        }
        //  无论是否传入token 只要解析成功都进入控制层逻辑
        await next()
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

