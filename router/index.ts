import Router from "koa-router";
import userRouter from './user'

// 统一注册路由
const router = new Router()

// 注册用户路由
router.use(userRouter.routes())


export default router
