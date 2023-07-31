import Router from "koa-router";
// 用户路由
import userRouter from './user'
// 吧路由
import barRouter from "./bar";
// 文件上传路由
import FileRouter from './file'
// 帖子路由
import ArticleRouter from './article';
// 公共路由
import publicRouter from './public';
import { BASE_REQUST } from '../config';

// 统一注册路由
const router = new Router()

// TODO 给每个模块的路由统一注册根路径 取消每个路由注册时需要添加根路径
// router.use('/api/user', userRouter.routes())

// 注册用户路由
router.use(BASE_REQUST, userRouter.routes())
// 注册吧路由
router.use(BASE_REQUST, barRouter.routes())
// 注册帖子路由
router.use(BASE_REQUST, ArticleRouter.routes())
// 注册上传文件的路由
router.use(BASE_REQUST, FileRouter.routes())
// 注册公共路由
router.use(BASE_REQUST, publicRouter.routes())
export default router
