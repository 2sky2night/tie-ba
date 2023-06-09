// types
import type { Context } from 'koa';
import type { Token } from '../user/types'
import type { CreateArticleBody } from '../../model/article/types';
// service层
import ArticleService from '../../service/article';
// 工具函数
import response from '../../utils/tools/response'


const acrticleService = new ArticleService()

/**
 * 创建帖子
 * @param ctx 
 */
async function toCreateArticle(ctx: Context) {
  const token = ctx.state.user as Token;
  const body = (ctx.request as any).body as CreateArticleBody
  if (isNaN(body.bid) || body.content === undefined || body.title === undefined) {
    ctx.status = 400;
    ctx.body = response(null, '参数非法!', 400)
    return
  }
  try {
    const res = await acrticleService.createArticle({ ...body, uid: token.uid })
    if (res) {
      ctx.body = response(null, '发帖成功!')
    } else {
      ctx.status = 400;
      ctx.body = response(null, '发帖失败,所在的吧不存在!', 500)
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }
}

/**
 * 获取帖子的详情数据 (未完成)
 * @param ctx 
 */
async function getArticleInfo(ctx: Context) {

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
    const res = await acrticleService.getArticleInfo(aid)
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

/**
 * 点赞帖子
 * @param ctx 
 * @returns 
 */
async function toLikeArticle(ctx: Context) {
  const token = ctx.state.user as Token

  // 验证帖子aid参数
  if (ctx.query.aid === undefined) {
    // 未携带参数
    ctx.status = 400;
    ctx.body = response(null, '参数未携带!', 400)
    return
  }

  const aid = +ctx.query.aid
  // 帖子aid参数非法
  if (isNaN(aid)) {
    ctx.status = 400;
    ctx.body = response(null, '参数非法!', 400)
    return
  }

  try {
    const res = await acrticleService.likeArticle(token.uid, aid)
    if (res === -1) {
      ctx.status = 400;
      ctx.body = response(null, '点赞帖子失败,帖子不存在!', 400)
    } else if (res === 0) {
      ctx.status = 400;
      ctx.body = response(null, '点赞帖子失败,请勿重复点赞!', 400)
    } else if (res === 1) {
      ctx.body = response(null, '点赞帖子成功!')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

/**
 * 取消点赞帖子
 * @param ctx 
 * @returns 
 */
async function toCancelLikeArticle(ctx: Context) {
  const token = ctx.state.user as Token

  // 验证帖子aid参数
  if (ctx.query.aid === undefined) {
    // 未携带参数
    ctx.status = 400;
    ctx.body = response(null, '参数未携带!', 400)
    return
  }

  const aid = +ctx.query.aid
  // 帖子aid参数非法
  if (isNaN(aid)) {
    ctx.status = 400;
    ctx.body = response(null, '参数非法!', 400)
    return
  }

  try {
    const res = await acrticleService.cancelLikeArticle(token.uid, aid)
    if (res === -1) {
      ctx.status = 400;
      ctx.body = response(null, '取消点赞帖子失败,帖子不存在!', 400)
    } else if (res === 0) {
      ctx.status = 400;
      ctx.body = response(null, '取消点赞帖子失败,还未对该帖子点赞!', 400)
    } else if (res === 1) {
      ctx.body = response(null, '取消点赞帖子成功!')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

/**
 * 收藏帖子
 * @param ctx 
 */
async function toStarArticle(ctx: Context) {
  const token = ctx.state.user as Token;

  // 验证帖子aid参数
  if (ctx.query.aid === undefined) {
    ctx.status = 400;
    return ctx.body = response(null, '参数未携带!', 400)
  }

  const aid = +ctx.query.aid

  if (isNaN(aid)) {
    ctx.status = 400;
    return ctx.body = response(null, '参数非法!', 400)
  }

  try {
    const res = await acrticleService.starArticle(token.uid, aid);
    if (res === -1) {
      ctx.status = 400;
      ctx.body = response(null, '收藏帖子失败,帖子不存在!', 400)
    } else if (res === 0) {
      ctx.status = 400;
      ctx.body = response(null, '收藏帖子失败,请勿重复收藏帖子!', 400)
    } else {
      ctx.body = response(null, '收藏帖子成功!')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

/**
 * 取消收藏帖子
 * @param ctx 
 */
async function toCancelStarArticle(ctx: Context) {
  const token = ctx.state.user as Token;

  // 验证帖子aid参数
  if (ctx.query.aid === undefined) {
    ctx.status = 400;
    return ctx.body = response(null, '参数未携带!', 400)
  }

  const aid = +ctx.query.aid

  if (isNaN(aid)) {
    ctx.status = 400;
    return ctx.body = response(null, '参数非法!', 400)
  }

  try {
    const res = await acrticleService.cancelStarArticle(token.uid, aid);
    if (res === -1) {
      ctx.status = 400;
      ctx.body = response(null, '取消收藏帖子失败,帖子不存在!', 400)
    } else if (res === 0) {
      ctx.status = 400;
      ctx.body = response(null, '取消收藏帖子失败,未收藏帖子!', 400)
    } else {
      ctx.body = response(null, '取消收藏帖子成功!')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

export default {
  toCreateArticle,
  getArticleInfo,
  toLikeArticle,
  toCancelLikeArticle,
  toStarArticle,
  toCancelStarArticle
}