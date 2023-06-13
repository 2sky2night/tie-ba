import Router from 'koa-router';
import ArticleController from '../../controller/article'
import Middleware from '../../middleware/index'

const articleRouter = new Router()

// 统一注册帖子路由的路径
const baseRouteURL = '/article'

// 获取帖子的详情数据  (单独解析token)  query {aid:number}
articleRouter.get('article', `${baseRouteURL}/info`, Middleware.tokenParse, ArticleController.getArticleInfo)

// 发帖 (需要token) json {bid:number;content:string;photo?:string;title:string}
articleRouter.post('article', `${baseRouteURL}/post`, ArticleController.toCreateArticle)

// 点赞文章 (需要token) query {aid:number}
articleRouter.get('article', `${baseRouteURL}/like`, ArticleController.toLikeArticle)

// 取消点赞文章 (需要token) query {aid:number}
articleRouter.delete('article', `${baseRouteURL}/like`, ArticleController.toCancelLikeArticle)

// 收藏文章 (需要token) query {aid:number}
articleRouter.get('article', `${baseRouteURL}/star`, ArticleController.toStarArticle)

// 取消收藏文章 (需要token) query {aid:number}
articleRouter.delete('article', `${baseRouteURL}/star`, ArticleController.toCancelStarArticle)

// 发送评论 (需要token) json {aid:number,photo?:string|string[],content:string}
articleRouter.post('article', `${baseRouteURL}/comment`, ArticleController.toCreateComment)

// 删除评论 (需要token)  query {cid:number}
articleRouter.delete('article', `${baseRouteURL}/comment`, ArticleController.toDeleteComment)

// 点赞评论 (需要token) query {cid:number}
articleRouter.get('article', `${baseRouteURL}/comment/like`, ArticleController.toLikeComment)

// 取消点赞评论 (需要token) query {cid:number}
articleRouter.delete('article', `${baseRouteURL}/comment/like`, ArticleController.toCancelLikeComment)

// 获取帖子的评论列表 (单独解析token) query {aid:number;limit?number=20;offset?:number=0}
articleRouter.get('article', `${ baseRouteURL }/comment/list`, Middleware.tokenParse, ArticleController.getArticleCommentList)

// 获取用户点赞的帖子列表
articleRouter.get('article', `${baseRouteURL}/user/like/list`, Middleware.tokenParse, ArticleController.toGetUserLikeArticleList)


export default articleRouter