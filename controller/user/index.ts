// service层
import UserService from '../../service/user'
// 类型
import type { Context, Next } from 'koa'
import type { UserBody, UserUpdateBody, UserUpdatePasswordBody } from '../../model/user/types'
import type { Token } from './types'
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
async function checkUser (ctx: Context) {
    const username = ctx.query.username
    if (!username) {
        ctx.status = 400
        return ctx.body = response(null, '未携带参数 username !', 400)
    }
    try {
        const res = await userService.findUserByUsername(username as string)
        if (res.length) {
            ctx.body = response(res[ 0 ], 'ok', 200)
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
async function login (ctx: Context) {
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
        ctx.status = 400
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
async function register (ctx: Context) {
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
        ctx.status = 400;
        return ctx.body = response(null, '用户名不能为空!', 400)
    }
    if (body.password.length < 5 || body.password.length > 14) {
        // 密码长度非法
        ctx.status = 400;
        return ctx.body = response(null, '密码长度必须为6-14位!', 400)
    }
    try {
        const res = await userService.createUser(body)
        if (res) {
            // 注册成功
            ctx.body = response(null, '注册成功!', 200)
        } else {
            // 用户名重复
            ctx.status = 400;
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
async function testToken (ctx: Context) {
    console.log(ctx.state)
    ctx.body = response(ctx.state, 'ok', 200)
}

/**
 * 通过token来获取用户信息 (需要token 未完成)
 * @param ctx 
 */
async function getUserInfoByToken (ctx: Context) {

    const user = ctx.state.user as Token;

    try {

        // 通过用户的id查询用户数据
        const res = await userService.getUserInfo(user.uid)
        if (res) {
            // 查询到了
            ctx.body = response(res, 'ok', 200)
        } else {
            // 查无此人
            ctx.body = response(null, '查无此人', 400)
        }

    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }

}

/**
 * 关注用户 （需要token）
 * @param ctx 
 */
async function followUser (ctx: Context) {
    const token = ctx.state.user as Token
    const query = ctx.query
    if (query.uid === undefined) {
        // 参数未携带
        ctx.status = 400
        ctx.body = response(null, '参数未携带', 400)
    } else {
        // 携带了参数
        const uidIsFollowed = +query.uid
        // 验证参数
        if (isNaN(uidIsFollowed) || uidIsFollowed === 0) {
            // 参数不合法
            ctx.status = 400
            ctx.body = response(null, '参数不合法', 400)
        } else {
            try {
                const res = await userService.toFollowUser(token.uid, uidIsFollowed)
                if (res === 1) {
                    // 关注成功
                    ctx.body = response(null, '关注成功!')
                } else if (res === 0) {
                    // 重复关注的提示
                    ctx.body = response(null, '关注用户失败,已经关注了!', 400)
                } else if (res === -2) {
                    // 不能自己关注自己
                    ctx.body = response(null, '关注用户失败,不能自己关注自己!', 400)
                } else if (res === -1) {
                    // 被关注者不存在
                    ctx.body = response(null, '关注用户失败,被关注者不存在!', 400)
                }
            } catch (error) {
                ctx.status = 500
                ctx.body = response(null, '服务器出错了!', 500)
            }

        }
    }
}

/**
 * 取消关注用户
 * @param ctx 
 */
async function cancelFollowUser (ctx: Context) {
    const token = ctx.state.user as Token;

    if (ctx.query.uid === undefined) {
        // 参数未携带
        ctx.status = 400;
        ctx.body = response(null, '参数未携带!', 400)
        return
    }

    // 被关注者的id
    const uidIsFollowed = +ctx.query.uid;
    if (uidIsFollowed === 0 || isNaN(uidIsFollowed)) {
        // 参数非法
        ctx.status = 400;
        ctx.body = response(null, '参数非法!', 400)
        return
    }

    try {
        const res = await userService.toCancelFollow(token.uid, uidIsFollowed)
        switch (res) {
            case 0: { ctx.status = 400; ctx.body = response(null, '取消关注失败,还未关注此用户!', 400); break; }
            case -2: { ctx.status = 400; ctx.body = response(null, '取消关注失败,不能取消关注自己!', 400); break; }
            case 1: { ctx.status = 200; ctx.body = response(null, '取消关注成功!'); break; }
            case -1: { ctx.status = 400; ctx.body = response(null, '取消关注失败,被关注者不存在!', 400); break; }
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }

}

/**
 * 获取用户关注列表
 * @param ctx 
 * @returns 
 */
async function toGetUserFollowList (ctx: Context) {
    const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined
    if (ctx.query.uid === undefined) {
        // 未携带参数
        ctx.status = 400;
        ctx.body = response(null, '未携带参数!', 400)
        return
    }
    const uid = +ctx.query.uid;
    // 获取的条数默认20条
    const limit = ctx.query.limit === undefined ? 20 : +ctx.query.limit;
    // 获取的偏移量默认从0开始
    const offset = ctx.query.offset === undefined ? 0 : +ctx.query.offset;
    // 是否按照关注的时间降序排序 0升序 其他数字降序
    const desc = ctx.query.desc ? +ctx.query.desc : 1

    if (isNaN(uid) || isNaN(limit) || isNaN(offset) || isNaN(desc)) {
        // 参数非法
        ctx.status = 400;
        ctx.body = response(null, '参数非法!', 400)
        return
    }
    try {
        const res = await userService.getFollowList(uid, currentUid, limit, offset, desc ? true : false)
        if (res) {
            // 用户存在
            ctx.body = response(res, 'ok')
        } else {
            // 用户不存在
            ctx.status = 400
            ctx.body = response(null, '获取用户关注列表失败,用户不存在!', 400)
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}

/**
 * 获取用户粉丝列表
 * @param ctx 
 * @returns 
 */
async function toGetUserFansList (ctx: Context) {
    const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined
    
    if (ctx.query.uid === undefined) {
        // 未携带参数
        ctx.status = 400;
        ctx.body = response(null, '未携带参数!', 400)
        return
    }
    const uid = +ctx.query.uid;
    // 获取的条数默认20条
    const limit = ctx.query.limit === undefined ? 20 : +ctx.query.limit;
    // 获取的偏移量默认从0开始
    const offset = ctx.query.offset === undefined ? 0 : +ctx.query.offset;
    // 获取升序或降序参数 (默认降序)
    const desc = ctx.query.desc === undefined ? 1 : +ctx.query.desc

    if (isNaN(uid) || isNaN(limit) || isNaN(offset) || isNaN(desc)) {
        // 参数非法
        ctx.status = 400;
        ctx.body = response(null, '参数非法!', 400)
        return
    }

    try {
        const res = await userService.getFansList(uid, currentUid, limit, offset, desc ? true : false)
        if (res) {
            ctx.body=response(res,'ok')
        } else {
            ctx.status=400
            ctx.body=response(null,'获取用户粉丝列表失败,用户不存在!',400)
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}
/**
 * 修改用户信息 (不包含密码)
 * @param ctx 
 */
async function toUpdateUser (ctx: Context) {
    const token = ctx.state.user as Token
    const body = (ctx.request as any).body as UserUpdateBody
    if (body === undefined || body.avatar === undefined || body.username === undefined) {
        ctx.status = 400;
        return ctx.body = response(null, '有参数未携带!', 400)
    }

    if (!body.username.trim().length) {
        // 用户名长度非法
        ctx.status = 400
        return ctx.body = response(null, '用户名不能为空!', 400)
    }

    try {
        const res = await userService.updateUserData(token.uid, body.avatar, body.username)
        if (res) {
            // 更新成功
            ctx.body = response(null, '修改用户信息成功!')
        } else {
            // 用户名已经存在了
            ctx.body = response(null, '修改用户信息失败,用户名已经存在了!', 400)
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}
/**
 * 修改用户密码
 * @param ctx 
 * @returns 
 */
async function toUpdateUserPassword (ctx: Context) {
    const token = ctx.state.user as Token
    const body = (ctx.request as any).body as UserUpdatePasswordBody

    if (body === undefined || body.password === undefined || body.oldPassword === undefined) {
        ctx.status = 400;
        return ctx.body = response(null, '有参数未携带!', 400)
    }

    if (body.password.length < 5 || body.password.length > 14 || body.oldPassword.length < 5 || body.oldPassword.length > 14) {
        // 密码长度非法
        ctx.status = 400;
        return ctx.body = response(null, '密码长度必须为6-14位!', 400)
    }

    try {
        const res = await userService.updateUserPassword(token.uid, body.password, body.oldPassword)
        if (res === 1) {
            ctx.body = response(null, '修改密码成功')
        } else if (res === 0) {
            ctx.status = 400
            ctx.body = response(null, '修改密码失败,新旧密码一致!', 400)
        } else {
            ctx.status = 400
            ctx.body = response(null, '修改密码失败,密码验证失败!', 400)
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }

}

/**
 * 获取用户信息（通过查询参数的uid）
 */
async function toGetUserProfile (ctx: Context) {

    const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined

    if (ctx.query.uid === undefined) {
        ctx.status = 400
        return ctx.body = response(null, '有参数未携带!', 400)
    }
    const uid = +ctx.query.uid
    if (isNaN(uid)) {
        ctx.status = 400
        return ctx.body = response(null, '参数非法!', 400)
    }
    try {
        const res = await userService.getUserProfile(uid, currentUid)
        if (res) {
            ctx.body = response(res, 'ok')
        } else {
            ctx.status = 400
            ctx.body = response(null, '获取用户信息失败,该用户不存在!', 400)
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}

/**
 * 通过token来获取用户信息 (需要token)
 * @param ctx 
 */
async function toGetUserInfo (ctx: Context) {

    const user = ctx.state.user as Token;

    try {

        // 通过用户的id查询用户数据
        const res = await userService.getUserInfoV2(user.uid)
        if (res) {
            // 查询到了
            ctx.body = response(res, 'ok', 200)
        } else {
            // 查无此人
            ctx.body = response(null, '查无此人', 400)
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
    getUserInfoByToken,
    followUser,
    cancelFollowUser,
    toGetUserFollowList,
    toGetUserFansList,
    toUpdateUser,
    toUpdateUserPassword,
    toGetUserProfile,
    toGetUserInfo
}