import Router from 'koa-router'
// 用户的控制层
import UserController from '../../controller/user'

const userRouter = new Router()

// 统一注册用户路由
const baseRouteURL = '/user'

// 测试路由
userRouter.get('user', `${baseRouteURL}/query`, UserController.checkUser)

// 用户注册
userRouter.post('user', `${baseRouteURL}/register`, UserController.register)

// 用户登录
userRouter.post('user', `${baseRouteURL}/login`, UserController.login)

// 测试token (需要token)
userRouter.get('user', `${baseRouteURL}/token`, UserController.testToken)

// 通过token获取用户信息 (需要token)
userRouter.get('user', `${baseRouteURL}/info`, UserController.getUserInfo)

export default userRouter