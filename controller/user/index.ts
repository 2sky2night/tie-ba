// service层
import UserService from '../../service/user'
// 类型
import type { Context, Next } from 'koa'
import type { UserBody } from '../../model/user/types'
// 工具
import response from '../../utils/tools/response'
import jwt from "jsonwebtoken"
import { SECRET_KEY } from '../../config'

/**
 * 用户的service层
 */
const userService = new UserService()

/**
 * 通过用户名查询用户 (测试用)
 * @param ctx 
 */
async function checkUser(ctx: Context) {
    const username = ctx.query.username
    if (!username) {
        ctx.status = 400
        return ctx.body = response(null, '未携带参数 username !', 400)
    }
    try {
        const res = await userService.findUserByUsername(username as string)
        if (res.length) {
            ctx.body = response(res[0], 'ok', 200)
        } else {
            ctx.body = response(null, '查无此人', 400)
        }
    } catch (err) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}

/**
 * 用户登录
 * @param ctx 
 */
async function login(ctx: Context) {
    const body = (ctx.request as any).body as UserBody
    if (!body) {
        // 未携带参数
        ctx.status = 400
        return ctx.body = response(null, '未携带参数!', 400)
    }
    if (!body.password || !body.username) {
        // 未携带参数
        ctx.status = 400
        return ctx.body = response(null, '未携带参数!', 400)
    }
    if (!body.username.trim().length) {
        // 用户名长度非法
        return ctx.body = response(null, '用户名不能为空!', 400)
    }
    if (body.password.length < 5 || body.password.length > 14) {
        // 密码长度非法
        return ctx.body = response(null, '密码长度必须为6-14位!', 400)
    }

    try {
        const res = await userService.checkLogin(body)
        switch (res) {
            case 0: return ctx.body = response(null, '用户名不存在', 400);
            case 1: return ctx.body = response(null, '密码错误', 400);
            default: {
                // const token = jwt.sign({ username: body.username, password: body.password }, SECRET_KEY, { expiresIn: '2h' });
                const token = jwt.sign({ username: body.username, uid: res.uid }, SECRET_KEY, { expiresIn: '2h' });
                return ctx.body = response(token, '登录成功!', 200)
            }
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}

/**
 * 用户注册
 * @param ctx 
 */
async function register(ctx: Context) {
    const body = (ctx.request as any).body as UserBody
    if (!body) {
        // 未携带参数
        ctx.status = 400
        return ctx.body = response(null, '未携带参数!', 400)
    }
    if (!body.password || !body.username) {
        // 未携带参数
        ctx.status = 400
        return ctx.body = response(null, '未携带参数!', 400)
    }
    if (!body.username.trim().length) {
        // 用户名长度非法
        return ctx.body = response(null, '用户名不能为空!', 400)
    }
    if (body.password.length < 5 || body.password.length > 14) {
        // 密码长度非法
        return ctx.body = response(null, '密码长度必须为6-14位!', 400)
    }
    try {
        const res = await userService.createUser(body)
        if (res) {
            // 注册成功
            ctx.body = response(null, '注册成功!', 200)
        } else {
            // 用户名重复
            ctx.body = response(null, '用户名重复!', 400)
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}

/**
 * 测试解析token
 * @param ctx 
 */
async function testToken(ctx: Context) {
    console.log(ctx.state)
    ctx.body = response(ctx.state, 'ok', 200)
}

/**
 * 获取用户信息 (需要token)
 * @param ctx 
 */
async function getUserInfo(ctx: Context) {
    // token中有用户名称,解析token后,使用用户名称查询用户数据
    const user = ctx.state.user
    try {
        if (user.uid) {
            // 通过用户的id查询用户数据
            const res = await userService.findUserByUid(user.id)
            if (res) {
                // 查询到了
                ctx.bod = response(res, 'ok', 200)
            } else {
                // 查无此人
                ctx.bod = response(null, '查无此人', 400)
            }
        } else {
            await Promise.reject()
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }

}

export default {
    login,
    checkUser,
    register,
    testToken,
    getUserInfo
}