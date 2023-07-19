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

// 统一注册路由
const router = new Router()

// 注册用户路由
router.use('/api',userRouter.routes())
// 注册吧路由
router.use('/api',barRouter.routes())
// 注册帖子路由
router.use('/api',ArticleRouter.routes())
// 注册上传文件的路由
router.use('/api',FileRouter.routes())
// 注册公共路由
router.use('/api',publicRouter.routes())
export default router
