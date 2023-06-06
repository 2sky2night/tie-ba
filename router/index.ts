import Router from "koa-router";
// 用户路由
import userRouter from './user'
// 吧路由
import barRouter from "./bar";
// 文件上传路由
import FileRouter from './file'

// 统一注册路由
const router = new Router()

// 注册用户路由
router.use(userRouter.routes())
// 注册吧路由
router.use(barRouter.routes())
// 注册上传文件的路由
router.use(FileRouter.routes())
export default router
