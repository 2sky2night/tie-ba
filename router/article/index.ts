import Router from 'koa-router';
import ArticleController from '../../controller/article'

const articleRouter = new Router()

// 统一注册帖子路由的路径
const baseRouteURL = '/article'

// 获取帖子的详情数据 (未完成)
articleRouter.get('article', `${ baseRouteURL }/info`, ArticleController.getArticleInfo)

// 发帖 (需要token) {bid:number;content:string;photo?:string;title:string}
articleRouter.post('article', `${ baseRouteURL }/post`, ArticleController.toCreateArticle)

// 点赞文章 (需要token) {aid:number}
articleRouter.get('article', `${ baseRouteURL }/like`, ArticleController.toLikeArticle)

// 取消点赞文章 (需要token) {aid:number}
articleRouter.delete('article', `${ baseRouteURL }/like`, ArticleController.toCancelLikeArticle)

// 收藏文章 (需要token) {aid:number}
articleRouter.get('article', `${ baseRouteURL }/star`, ArticleController.toStarArticle)

export default articleRouter