import Router from 'koa-router';
import ArticleController from '../../controller/article'
import Middleware from '../../middleware/index'

const articleRouter = new Router()

// 统一注册帖子路由的路径
const baseRouteURL = '/article'

// 获取帖子的详情数据  (单独解析token)  query {aid:number}
articleRouter.get('article', `${ baseRouteURL }/info`, Middleware.tokenParse, ArticleController.toGetArticleInfo)

// 发帖 (需要token) json {bid:number;content:string;photo?:string;title:string}
articleRouter.post('article', `${ baseRouteURL }/post`, ArticleController.toCreateArticle)

// 点赞文章 (需要token) query {aid:number}
articleRouter.get('article', `${ baseRouteURL }/like`, ArticleController.toLikeArticle)

// 取消点赞文章 (需要token) query {aid:number}
articleRouter.delete('article', `${ baseRouteURL }/like`, ArticleController.toCancelLikeArticle)

// 收藏文章 (需要token) query {aid:number}
articleRouter.get('article', `${ baseRouteURL }/star`, ArticleController.toStarArticle)

// 取消收藏文章 (需要token) query {aid:number}
articleRouter.delete('article', `${ baseRouteURL }/star`, ArticleController.toCancelStarArticle)

// 发送评论 (需要token) json {aid:number,photo?:string|string[],content:string}
articleRouter.post('article', `${ baseRouteURL }/comment`, ArticleController.toCreateComment)

// 删除评论 (需要token)  query {cid:number}
articleRouter.delete('article', `${ baseRouteURL }/comment`, ArticleController.toDeleteComment)

// 点赞评论 (需要token) query {cid:number}
articleRouter.get('article', `${ baseRouteURL }/comment/like`, ArticleController.toLikeComment)

// 取消点赞评论 (需要token) query {cid:number}
articleRouter.delete('article', `${ baseRouteURL }/comment/like`, ArticleController.toCancelLikeComment)

// 获取帖子的评论列表 (单独解析token) query {aid:number;limit?number=20;offset?:number=0}
articleRouter.get('article', `${ baseRouteURL }/comment/list`, Middleware.tokenParse, ArticleController.toGetArticleCommentList)

// 获取用户点赞的帖子列表 (单独解析token) query {uid:number;limit?number=20;offset?:number=0,desc:number}
articleRouter.get('article', `${ baseRouteURL }/user/like/list`, Middleware.tokenParse, ArticleController.toGetUserLikeArticleList)

// 获取用户收藏的帖子列表 (单独解析token) query {uid:number;limit?number=20;offset?:number=0,desc:number}
articleRouter.get('article', `${ baseRouteURL }/user/star/list`, Middleware.tokenParse, ArticleController.toGetUserStarArticleList)

// 获取点赞帖子的用户列表  (单独解析token) query {aid:number;limit?number=20;offset?:number=0,desc:number}
articleRouter.get('article', `${ baseRouteURL }/liked/list`, Middleware.tokenParse, ArticleController.toGetLikeArticleUserList)

// 获取收藏帖子的用户列表 (单独解析token) query {aid:number;limit?number=20;offset?:number=0,desc:number}
articleRouter.get('article', `${ baseRouteURL }/star/list`, Middleware.tokenParse, ArticleController.toGetStarArticleUserList)

// 获取用户的帖子列表 (单独解析token) query {uid:number;limit?number=20;offset?:number=0,desc:number}
articleRouter.get('article', `${ baseRouteURL }/user/list`, Middleware.tokenParse, ArticleController.toGetUserArticleList)

export default articleRouter