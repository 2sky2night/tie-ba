import Router from 'koa-router'
// 用户的控制层
import UserController from '../../controller/user'

const userRouter = new Router()

// 统一注册用户路由
const baseRouteURL = '/user'

// 测试路由 query:{username:string}
userRouter.get('user', `${baseRouteURL}/query`, UserController.checkUser)

// 用户注册 json {username:string;password:string}
userRouter.post('user', `${baseRouteURL}/register`, UserController.register)

// 用户登录   json {username:string;password:string}
userRouter.post('user', `${baseRouteURL}/login`, UserController.login)

// 测试token (需要token)
userRouter.get('user', `${baseRouteURL}/token`, UserController.testToken)

// 通过token获取用户信息 (需要token)
userRouter.get('user', `${baseRouteURL}/info`, UserController.getUserInfo)

// 关注用户 (需要token) query:{uid:number}
userRouter.get('user', `${baseRouteURL}/follow`, UserController.followUser)

// 取消关注用户 (需要token) query:{uid:number}
userRouter.delete('user', `${baseRouteURL}/follow`, UserController.cancelFollowUser)

//  获取关注列表 query:{uid:number,limit?:number,offset?:number}
userRouter.get('user', `${baseRouteURL}/follow/list`, UserController.getUserFollowList)

//  获取粉丝列表 query:{uid:number,limit?:number,offset?:number}
userRouter.get('user', `${baseRouteURL}/fans/list`, UserController.getUserFansList)

//  修改用户信息 (需要token) query:{avatar:string;username:string}
userRouter.put('user', `${baseRouteURL}/info`, UserController.toUpdateUser)

// 修改用户密码  (需要token) query:{password:string;oldPassword:string}
userRouter.put('user', `${baseRouteURL}/info/password`, UserController.toUpdateUserPassword)


export default userRouter