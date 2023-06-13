// types
import type { Context } from 'koa';
import type { Token } from '../user/types'
import type { CreateArticleBody, CreateCommentBody, InserCommentBody, InsertArticleBody } from '../../model/article/types';
// service层
import ArticleService from '../../service/article';
// 工具函数
import response from '../../utils/tools/response'


const articleService = new ArticleService()

/**
 * 创建帖子
 * @param ctx 
 */
async function toCreateArticle (ctx: Context) {
  const token = ctx.state.user as Token;
  const body = (ctx.request as any).body as CreateArticleBody
  if (isNaN(body.bid) || body.content === undefined || body.title === undefined) {
    ctx.status = 400;
    ctx.body = response(null, '参数非法!', 400)
    return
  }
  const insertBody: InsertArticleBody = {
    uid: token.uid,
    content: body.content,
    bid: body.bid,
    title: body.title
  }

  if (body.photo && body.photo instanceof Array) {
    // 若携带了帖子配图且为数组 
    // 需要检验配图携带的上限
    if (body.photo.length > 3) {
      ctx.status = 400;
      return ctx.body = response(null, '发帖失败,帖子配图上限为三张')
    } else {
      insertBody.photo = body.photo.join(',')
    }
  } else if (typeof body.photo === 'string') {
    // 若是字符串(单个图片)
    insertBody.photo = body.photo
  }

  try {
    const res = await articleService.createArticle(insertBody)
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
 * 获取帖子的详情数据
 * @param ctx 
 */
async function getArticleInfo (ctx: Context) {

  const uid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined

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
    const res = await articleService.getArticleInfo(aid, uid)
    if (res) {
      // 请求文章存在
      ctx.body = response(res, 'ok')
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
async function toLikeArticle (ctx: Context) {
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
    const res = await articleService.likeArticle(token.uid, aid)
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
async function toCancelLikeArticle (ctx: Context) {
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
    const res = await articleService.cancelLikeArticle(token.uid, aid)
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
async function toStarArticle (ctx: Context) {
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
    const res = await articleService.starArticle(token.uid, aid);
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
async function toCancelStarArticle (ctx: Context) {
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
    const res = await articleService.cancelStarArticle(token.uid, aid);
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
/**
 * 发送评论
 * @param ctx 
 * @returns 
 */
async function toCreateComment (ctx: Context) {
  const token = ctx.state.user as Token;
  // 检验参数是否携带
  const body = (ctx.request as any).body as CreateCommentBody
  if (body.aid === undefined || body.content === undefined) {
    // 必要参数未携带
    ctx.status = 400
    return ctx.body = response(null, '有参数未携带', 400)
  }
  // 校验参数是否合法
  if (isNaN(body.aid)) {
    // 帖子参数非法
    ctx.status = 400
    return ctx.body = response(null, '参数非法', 400)
  }
  const inertBody: InserCommentBody = {
    uid: token.uid,
    content: body.content,
    aid: body.aid
  }
  // 是否携带了photo字段?
  if (body.photo) {
    // 携带了photo字段
    if (body.photo instanceof Array) {
      // 若传入的是数组 则需要转换为字符串
      inertBody.photo = body.photo.join(',')
    } else {
      // 传入的是字符串
      inertBody.photo = body.photo
    }
  }

  try {
    const res = await articleService.createComment(inertBody)
    if (res) {
      // 发送评论成功
      ctx.body = response(null, '发送评论成功!')
    } else {
      // 发送评论失败 帖子不存在
      ctx.status = 400;
      ctx.body = response(null, '发送评论失败,帖子不存在', 400)
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }
}

/**
 * 删除评论
 * @param ctx 
 */
async function toDeleteComment (ctx: Context) {
  const token = ctx.state.user as Token;

  // 检验评论id参数
  if (ctx.query.cid === undefined) { ctx.status = 400; return ctx.body = response(null, '参数未携带!', 400) }

  const cid = + ctx.query.cid
  if (isNaN(cid)) { ctx.status = 400; return ctx.body = response(null, '参数非法!', 400) }

  try {
    const res = await articleService.deleteComment(cid, token.uid)
    if (res === -1) {
      ctx.status = 400
      ctx.body = response(null, '删除评论失败,评论不存在', 400)
    } else if (res === 0) {
      ctx.status = 400
      ctx.body = response(null, '删除评论失败,不是评论创建者或楼主', 400)
    } else if (res === 1) {
      ctx.body = response(null, '删除评论成功,评论创建者删除评论')
    } else if (res === 2) {
      ctx.body = response(null, '删除评论成功,楼主删除评论')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}
/**
 * 点赞评论
 * @param ctx 
 * @returns 
 */
async function toLikeComment (ctx: Context) {
  const token = ctx.state.user as Token;

  // 检验评论id参数
  if (ctx.query.cid === undefined) { ctx.status = 400; return ctx.body = response(null, '参数未携带!', 400) }

  const cid = + ctx.query.cid
  if (isNaN(cid)) { ctx.status = 400; return ctx.body = response(null, '参数非法!', 400) }

  try {
    const res = await articleService.likeComment(cid, token.uid)
    if (res === -1) {
      ctx.status = 400
      ctx.body = response(null, '点赞评论失败,评论不存在', 400)
    } else if (res === 0) {
      ctx.status = 400
      ctx.body = response(null, '点赞评论失败,请勿重复点赞', 400)
    } else {
      ctx.body = response(null, '点赞评论成功!')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}
/**
 * 取消点赞评论
 * @param ctx 
 * @returns 
 */
async function toCancelLikeComment (ctx: Context) {
  const token = ctx.state.user as Token;

  // 检验评论id参数
  if (ctx.query.cid === undefined) { ctx.status = 400; return ctx.body = response(null, '参数未携带!', 400) }

  const cid = + ctx.query.cid
  if (isNaN(cid)) { ctx.status = 400; return ctx.body = response(null, '参数非法!', 400) }

  try {
    const res = await articleService.cancelLikeComment(cid, token.uid)
    if (res === -1) {
      ctx.status = 400
      ctx.body = response(null, '取消点赞评论失败,评论不存在!', 400)
    } else if (res === 0) {
      ctx.status = 400
      ctx.body = response(null, '取消点赞评论失败,还未点赞过评论!', 400)
    } else {
      ctx.body = response(null, '取消点赞评论成功!')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

/**
 * 获取帖子的评论 分页数据
 * @param ctx 
 */
async function getArticleCommentList (ctx: Context) {

  // 根据是否携带token来获取当前登录的用户id
  const uid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined

  // 检验查询参数
  if (ctx.query.aid === undefined) { ctx.status = 400; return ctx.body = response(null, '参数未携带!', 400) }
  const aid = + ctx.query.aid
  const offset = ctx.query.offset === undefined ? 0 : +ctx.query.offset;
  const limit = ctx.query.limit === undefined ? 20 : +ctx.query.limit;
  if (isNaN(aid) || isNaN(offset) || isNaN(limit)) {
    ctx.status = 400;
    return ctx.body = response(null, '参数非法!', 400)
  }

  try {
    const res = await articleService.getArticleCommentList(aid, uid, limit, offset)
    if (res === 0) {
      ctx.status = 400;
      ctx.body = response(null, '获取评论失败,帖子不存在!', 400)
    } else {
      ctx.body = response(res, 'ok')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

async function toGetUserLikeArticleList (ctx: Context) {
  const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined;

  // 校验查询参数uid
  if (ctx.query.uid === undefined) {
    ctx.status = 400
    ctx.body = response(null, '参数未携带!', 400)
    return
  }
  const uid = +ctx.query.uid
  const limit = ctx.query.limit ? +ctx.query.limit : 20
  const offset = ctx.query.offset ? +ctx.query.offset : 0

  if (isNaN(uid) || isNaN(limit) || isNaN(offset)) {
    ctx.status = 400
    ctx.body = response(null, '参数非法!', 400)
    return
  }

  try {
    const res = await articleService.getUserLikeArticleList(uid, currentUid, limit, offset)
    if (res) {
      ctx.body = response(res, 'ok')
    } else {
      ctx.status = 400
      ctx.body = response(null, '获取用户点赞的帖子列表失败,用户不存在!', 400)
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
  toCancelStarArticle,
  toCreateComment,
  toDeleteComment,
  toLikeComment,
  toCancelLikeComment,
  getArticleCommentList,
  toGetUserLikeArticleList
}