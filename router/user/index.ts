import Router from 'koa-router'
// 中间件
import Middleware from '../../middleware'
// 用户的控制层
import UserController from '../../controller/user'

const userRouter = new Router()

// 统一注册用户路由
const baseRouteURL = '/user'

// 测试路由 query:{username:string}
userRouter.get('user', `${ baseRouteURL }/query`, UserController.checkUser)

// 用户注册 json {username:string;password:string}
userRouter.post('user', `${ baseRouteURL }/register`, UserController.toRegister)

// 用户登录   json {username:string;password:string}
userRouter.post('user', `${ baseRouteURL }/login`, UserController.toLogin)

// 测试token (需要token)
userRouter.get('user', `${ baseRouteURL }/token`, UserController.testToken)

// 通过token获取用户信息包含最近发送的帖子信息 (需要token)
userRouter.get('user', `${ baseRouteURL }/info`, UserController.getUserInfoByToken)

// 关注用户 (需要token) query:{uid:number}
userRouter.get('user', `${ baseRouteURL }/follow`, UserController.toFollowUser)

// 取消关注用户 (需要token) query:{uid:number}
userRouter.delete('user', `${baseRouteURL}/follow`, UserController.toCancelFollowUser)

//  获取关注列表 (中间件解析token) query:{uid:number,limit?:number=20,offset?:number=0;desc?:number=1}
userRouter.get('user', `${ baseRouteURL }/follow/list`, Middleware.tokenParse, UserController.toGetUserFollowList)

//  获取粉丝列表 （中间件解析token） query:{uid:number,limit?:number=20,offset?:number=0;desc?:number=1}
userRouter.get('user', `${ baseRouteURL }/fans/list`,Middleware.tokenParse, UserController.toGetUserFansList)

//  修改用户信息 (需要token) query:{avatar:string;username:string}
userRouter.put('user', `${ baseRouteURL }/info`, UserController.toUpdateUser)

// 修改用户密码  (需要token) query:{password:string;oldPassword:string}
userRouter.put('user', `${ baseRouteURL }/info/password`, UserController.toUpdateUserPassword)

// 获取用户信息 (中间件解析token) query:{uid:number}
userRouter.get('user', `${ baseRouteURL }/profile`, Middleware.tokenParse, UserController.toGetUserProfile)

// 通过token获取用户信息 (需要token)
userRouter.get('user', `${ baseRouteURL }/info/v2`, UserController.toGetUserInfo)


export default userRouter