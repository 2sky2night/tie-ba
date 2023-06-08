import type { Context } from 'koa';
import type { Token } from '../user/types'
import ArticleService from '../../service/article';
import response from '../../utils/tools/response'


const acrticleService = new ArticleService()

/**
 * 创建帖子
 * @param ctx 
 */
async function toCreateArticle (ctx: Context) {
  const token = ctx.state.user as Token;

  try {

  } catch (error) {

  }
}

/**
 * 获取帖子的详情数据 (未完成)
 * @param ctx 
 */
async function getArticleInfo (ctx: Context) {

  // 检验参数
  if (ctx.query.aid === undefined) {
    ctx.status = 400;
    ctx.body = response(null, '未携带参数!', 400)
    return
  }
  const aid = +ctx.query.aid
  if (isNaN(aid)) {
    ctx.status = 400;
    ctx.body = response(null, '参数非法!', 400)
    return
  }

  try {
    const res = await acrticleService.getArticle(aid)
    if (res.length) {
      // 请求文章存在
      ctx.body = response(res, 'ok', 404)
    } else {
      // 请求文章不存在
      ctx.status = 404;
      ctx.body = response(null, '帖子不存在!', 404)
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

export default {
  toCreateArticle,
  getArticleInfo
}