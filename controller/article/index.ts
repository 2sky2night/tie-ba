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

  if (!body.title.trim().length) {
    ctx.status = 400;
    ctx.body = response(null, '帖子标题不能为空!', 400)
    return
  }

  if (!body.content.trim().length) {
    ctx.status = 400;
    ctx.body = response(null, '帖子内容不能为空!', 400)
    return
  }

  const insertBody: InsertArticleBody = {
    uid: token.uid,
    content: body.content.trim(),
    bid: body.bid,
    title: body.title.trim()
  }

  // 校验图片
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
  // 校验文本
  if (body.title.length > 30) {
    ctx.status = 400;
    return ctx.body = response(null, '发帖失败,帖子标题不超过30个字符')
  }

  try {
    const res = await articleService.createArticle(insertBody)
    if (res) {
      ctx.body = response(null, '发帖成功!')
    } else {
      ctx.status = 404;
      ctx.body = response(null, '发帖失败,所在的吧不存在!', 404)
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
async function toGetArticleInfo (ctx: Context) {

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
      ctx.status = 404;
      ctx.body = response(null, '点赞帖子失败,帖子不存在!', 404)
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
      ctx.status = 404;
      ctx.body = response(null, '取消点赞帖子失败,帖子不存在!', 404)
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
      ctx.status = 404;
      ctx.body = response(null, '收藏帖子失败,帖子不存在!', 404)
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
      ctx.status = 404;
      ctx.body = response(null, '取消收藏帖子失败,帖子不存在!', 404)
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
      ctx.status = 404;
      ctx.body = response(null, '发送评论失败,帖子不存在', 404)
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
      ctx.status = 404
      ctx.body = response(null, '删除评论失败,评论不存在', 404)
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
      ctx.status = 404
      ctx.body = response(null, '点赞评论失败,评论不存在', 404)
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
      ctx.status = 404
      ctx.body = response(null, '取消点赞评论失败,评论不存在!', 404)
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
async function toGetArticleCommentList (ctx: Context) {

  // 根据是否携带token来获取当前登录的用户id
  const uid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined

  // 检验查询参数
  if (ctx.query.aid === undefined) { ctx.status = 400; return ctx.body = response(null, '参数未携带!', 400) }
  const aid = + ctx.query.aid
  const offset = ctx.query.offset === undefined ? 0 : +ctx.query.offset;
  const limit = ctx.query.limit === undefined ? 20 : +ctx.query.limit;
  // type ===1 根据点赞数量排序 type===2 根据创建数量排序
  const type = ctx.query.type === undefined ? 1 : +ctx.query.type;
  // 升序还是降序
  const desc = ctx.query.desc === undefined ? 1 : +ctx.query.desc;

  if (isNaN(aid) || isNaN(offset) || isNaN(limit) || isNaN(type) || isNaN(desc) || (type !== 1 && type !== 2)) {
    ctx.status = 400;
    return ctx.body = response(null, '参数非法!', 400)
  }

  try {
    const res = type === 1 ?
      await articleService.getArticleHotComment(aid, uid, limit, offset, desc ? true : false)
      : await articleService.getArticleCommentList(aid, uid, limit, offset, desc ? true : false)
    if (res === 0) {
      ctx.status = 404;
      ctx.body = response(null, '获取评论失败,帖子不存在!', 404)
    } else {
      ctx.body = response(res, 'ok')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

/**
 * 获取用户点赞的帖子列表 分页数据
 * @param ctx 
 * @returns 
 */
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
  // 是否根据点赞时间降序 默认降序
  const desc = ctx.query.desc ? +ctx.query.desc : 1

  if (isNaN(uid) || isNaN(limit) || isNaN(offset) || isNaN(desc)) {
    ctx.status = 400
    ctx.body = response(null, '参数非法!', 400)
    return
  }

  try {
    const res = await articleService.getUserLikeArticleList(uid, currentUid, limit, offset, desc ? true : false)
    if (res) {
      ctx.body = response(res, 'ok')
    } else {
      ctx.status = 404
      ctx.body = response(null, '获取用户点赞的帖子列表失败,用户不存在!', 404)
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

/**
 * 获取用户收藏帖子的列表 分页数据
 * @param ctx 
 * @returns 
 */
async function toGetUserStarArticleList (ctx: Context) {
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
  // 是否根据收藏降序 默认降序
  const desc = ctx.query.desc ? +ctx.query.desc : 1

  if (isNaN(uid) || isNaN(limit) || isNaN(offset) || isNaN(desc)) {
    ctx.status = 400
    ctx.body = response(null, '参数非法!', 400)
    return
  }

  try {
    const res = await articleService.getUserStarArticleList(uid, currentUid, limit, offset, desc ? true : false)
    if (res) {
      ctx.body = response(res, 'ok')
    } else {
      ctx.status = 404
      ctx.body = response(null, '获取用户收藏的帖子列表失败,用户不存在!', 404)
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }
}

/**
 * 点赞帖子的用户列表（分页限制）
 * @param ctx 
 */
async function toGetLikeArticleUserList (ctx: Context) {
  const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined;
  // 校验查询参数aid
  if (ctx.query.aid === undefined) {
    ctx.status = 400
    ctx.body = response(null, '参数未携带!', 400)
    return
  }
  const aid = +ctx.query.aid
  const limit = ctx.query.limit ? +ctx.query.limit : 20
  const offset = ctx.query.offset ? +ctx.query.offset : 0
  // 是否根据收藏降序 默认降序
  const desc = ctx.query.desc ? +ctx.query.desc : 1

  // 非法校验
  if (isNaN(aid) || isNaN(limit) || isNaN(offset) || isNaN(desc)) {
    ctx.status = 400
    ctx.body = response(null, '参数非法!', 400)
    return
  }

  try {
    const res = await articleService.getArticleLikedUserList(aid, currentUid, limit, offset, desc ? true : false)
    if (res) {
      ctx.body = response(res, 'ok')
    } else {
      ctx.status = 404
      ctx.body = response(null, '获取点赞帖子的用户列表失败,帖子不存在!', 404)
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

/**
 * 收藏帖子的用户列表 （分页限制)
 * @param ctx 
 * @returns 
 */
async function toGetStarArticleUserList (ctx: Context) {
  const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined;
  // 校验查询参数aid
  if (ctx.query.aid === undefined) {
    ctx.status = 400
    ctx.body = response(null, '参数未携带!', 400)
    return
  }
  const aid = +ctx.query.aid
  const limit = ctx.query.limit ? +ctx.query.limit : 20
  const offset = ctx.query.offset ? +ctx.query.offset : 0
  // 是否根据收藏降序 默认降序
  const desc = ctx.query.desc ? +ctx.query.desc : 1

  // 非法校验
  if (isNaN(aid) || isNaN(limit) || isNaN(offset) || isNaN(desc)) {
    ctx.status = 400
    ctx.body = response(null, '参数非法!', 400)
    return
  }

  try {
    const res = await articleService.getStarArticleUserList(aid, currentUid, limit, offset, desc ? true : false)
    if (res) {
      ctx.body = response(res, 'ok')
    } else {
      ctx.status = 404
      ctx.body = response(null, '获取收藏帖子的用户列表失败,帖子不存在!', 404)
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

/**
 * 获取用户的帖子列表 （分页限制）
 * @param ctx 
 * @returns 
 */
async function toGetUserArticleList (ctx: Context) {
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
  // 是否根据收藏降序 默认降序
  const desc = ctx.query.desc ? +ctx.query.desc : 1

  if (isNaN(uid) || isNaN(limit) || isNaN(offset) || isNaN(desc)) {
    ctx.status = 400
    ctx.body = response(null, '参数非法!', 400)
    return
  }

  try {
    const res = await articleService.getUserArticleList(uid, currentUid, limit, offset, desc ? true : false)
    if (res) {
      ctx.body = response(res, 'ok')
    } else {
      ctx.status = 404
      ctx.body = response(null, '获取用户的帖子列表失败,用户不存在!', 404)
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }
}
/**
 * 删除帖子
 * @param ctx 
 * @returns 
 */
async function toDeleteArticle (ctx: Context) {
  const token = ctx.state.user as Token
  if (ctx.query.aid === undefined) {
    ctx.status = 400
    return ctx.body = response(null, '参数未携带!', 400)
  }
  const aid = +ctx.query.aid
  if (isNaN(aid)) {
    ctx.status = 400
    return ctx.body = response(null, '参数非法!', 400)
  }
  try {
    const res = await articleService.deleteArticle(aid, token.uid)
    if (res === 1) {
      ctx.body = response(null, '删除帖子成功!')
    } else if (res === -1) {
      ctx.status = 404
      ctx.body = response(null, '删除帖子失败,帖子不存在!', 404)
    } else if (res === 0) {
      ctx.status = 400
      ctx.body = response(null, '删除帖子失败,您不是帖子创建者!', 400)
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }
}

/**
 * 获取帖子列表
 * @param ctx 
 */
async function toGetArticleList (ctx: Context) {
  const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined;
  // 解析参数
  const limit = ctx.query.limit ? +ctx.query.limit : 20
  const offset = ctx.query.offset ? +ctx.query.offset : 0
  const desc = ctx.query.desc ? +ctx.query.desc : 1
  // 校验参数是否合法
  if (isNaN(limit) || isNaN(offset) || isNaN(desc)) {
    ctx.status = 400
    return ctx.body = response(null, '参数非法', 400)
  }
  try {
    const res = await articleService.getArticleList(currentUid, limit, offset, desc ? true : false)
    ctx.body = response(res, 'ok')
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }
}
/**
 * 发现热帖（近x天 评论最多的帖子列表）
 * @param ctx 
 */
async function toGetHotAricle (ctx: Context) {
  const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined;
  // 解析参数
  const limit = ctx.query.limit ? +ctx.query.limit : 20
  const offset = ctx.query.offset ? +ctx.query.offset : 0
  // 查询多少天以前的热门帖子 (1:24小时 2:3天 3:15天 4:3个月 5:1年)
  const type = ctx.query.type ? +ctx.query.type : 1
  // 校验参数是否合法
  if (isNaN(limit) || isNaN(offset) || isNaN(type) || type > 5 || type < 1) {
    ctx.status = 400
    return ctx.body = response(null, '参数非法', 400)
  }
  let day = 1;
  switch (type) {
    case 1: break;
    case 2: day = 3; break;
    case 3: day = 15; break;
    case 4: day = 90; break;
    case 5: day = 365; break;
  }
  try {
    const res = await articleService.getHotArticleList(currentUid, limit, offset, day)
    ctx.body = response(res, 'ok')
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }
}

/**
 * 发现热评
 * @param ctx 
 * @returns 
 */
async function toGetHotComment (ctx: Context) {
  const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined;
  // 解析参数
  const limit = ctx.query.limit ? +ctx.query.limit : 20
  const offset = ctx.query.offset ? +ctx.query.offset : 0
  // 查询多少天以前的热门评论 (1:24小时 2:3天 3:15天 4:3个月 5:1年)
  const type = ctx.query.type ? +ctx.query.type : 1
  // 校验参数是否合法
  if (isNaN(limit) || isNaN(offset) || isNaN(type) || type > 5 || type < 1) {
    ctx.status = 400
    return ctx.body = response(null, '参数非法', 400)
  }
  let day = 1;
  switch (type) {
    case 1: break;
    case 2: day = 3; break;
    case 3: day = 15; break;
    case 4: day = 90; break;
    case 5: day = 365; break;
  }
  try {
    const res = await articleService.getHotCommentList(currentUid, limit, offset, day)
    ctx.body = response(res, 'ok')
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }
}
/**
 * 发现帖子
 * @param ctx 
 * @returns 
 */
async function toDiscoverArticle (ctx: Context) {
  const currentUid = (ctx.state.user as Token).uid
  // 解析参数
  const limit = ctx.query.limit ? +ctx.query.limit : 20
  const offset = ctx.query.offset ? +ctx.query.offset : 0

  // 校验参数是否合法
  if (isNaN(limit) || isNaN(offset)) {
    ctx.status = 400
    return ctx.body = response(null, '参数非法', 400)
  }
  try {
    const res = await articleService.getDiscoverArticleList(currentUid, limit, offset)
    ctx.body = response(res, 'ok')
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }
}

/**
 * 通过aid列表获取帖子列表信息
 * @param ctx 
 * @returns 
 */
async function toGetArticleListByAidList (ctx: Context) {
  const uid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined
  const _aids = ctx.query.aids
  // 校验参数是否携带
  if (_aids === undefined) {
    ctx.status = 400
    return ctx.body = response(null, '参数非法', 400)
  }
  // 解析参数
  const aidList = (_aids as string).split(',').map(ele => +ele)
  // 校验参数是否合法
  if (aidList.some(ele => isNaN(ele))) {
    // 不合法
    ctx.status = 400
    ctx.body = response(null, '参数不合法', 400)
  } else {
    // 合法
    try {
      const res = await articleService.getArticleByAidList(aidList, uid)
      ctx.body = response(res, 'ok')
    } catch (error) {
      console.log(error)
      ctx.status = 500;
      ctx.body = response(null, '服务器出错了!', 500)
    }
  }
}

export default {
  toCreateArticle,
  toGetArticleInfo,
  toLikeArticle,
  toCancelLikeArticle,
  toStarArticle,
  toCancelStarArticle,
  toCreateComment,
  toDeleteComment,
  toLikeComment,
  toCancelLikeComment,
  toGetArticleCommentList,
  toGetUserLikeArticleList,
  toGetUserStarArticleList,
  toGetLikeArticleUserList,
  toGetStarArticleUserList,
  toGetUserArticleList,
  toDeleteArticle,
  toGetArticleList,
  toGetHotAricle,
  toGetHotComment,
  toDiscoverArticle,
  toGetArticleListByAidList
}