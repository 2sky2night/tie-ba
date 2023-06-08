import Router from 'koa-router';
import ArticleController from '../../controller/article'

const articleRouter = new Router()

// 统一注册帖子路由的路径
const baseRouteURL = '/article'

// 获取帖子的详情数据
articleRouter.get('article',`${baseRouteURL}/info`,ArticleController.getArticleInfo)


export default articleRouter