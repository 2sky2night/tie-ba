import type { Context } from 'koa';
import type { Token } from '../../types';
import type { SearchType } from './types';
import response from '../../utils/tools/response';
import PublicService from '../../service/public';


const publicService = new PublicService()

/**
 * 搜索
 * @param ctx 
 */
async function toSearch (ctx: Context) {
  // 解析token数据获取当前登录的用户
  const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined
  // 校验必要参数
  if (ctx.query.keywords === undefined) {
    ctx.status = 400
    return ctx.body = response(null, '未携带关键词参数!', 400)
  }
  // 搜索类型 默认搜索帖子
  const type = ctx.query.type ? +ctx.query.type : 6
  const limit = ctx.query.limit ? +ctx.query.limit : 20
  const offset = ctx.query.offset ? +ctx.query.offset : 0
  const desc = ctx.query.desc ? +ctx.query.desc : 1
  const keywords = ctx.query.keywords as string

  // 校验查询参数非法
  if (isNaN(limit) || isNaN(offset) || isNaN(desc)) {
    ctx.status = 400
    return ctx.body = response(null, '参数非法!', 400)
  }
  if (type > 6 || type < 1) {
    ctx.status = 400
    return ctx.body = response(null, '参数非法!', 400)
  }
  // 根据查询的类型不同调用不同的service获取结果
  try {
    let res: any | null = null
    switch (type as SearchType) {
      case 1: res = await publicService.searchArticleTitle(currentUid, keywords, limit, offset, desc ? true : false); break;
      case 2: res = await publicService.searchArticleContent(currentUid, keywords, limit, offset, desc ? true : false); break;
      case 3: res = await publicService.searchBar(currentUid, keywords, limit, offset, desc ? true : false); break;
      case 4: res = await publicService.searchCommentContent(currentUid, keywords, limit, offset, desc ? true : false); break;
      case 5: res = await publicService.searchUser(currentUid, keywords, limit, offset, desc ? true : false); break;
      case 6: res = await publicService.searchArticle(currentUid, keywords, limit, offset, desc ? true : false); break;
    }
    ctx.body = response(res, 'ok')
  } catch (error) {
    ctx.status = 500
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

/**
 * 通过用户名来搜索用户关注列表
 * @param ctx 
 */
async function toSearchUserFollowList (ctx: Context) {
  const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined
  // 1.校验必要参数
  if (ctx.query.uid === undefined || ctx.query.keywords === undefined) {
    ctx.status = 400
    return ctx.body = response(null, '有参数未携带!', 400)
  }
  // 2 非法校验参数
  const uid = +ctx.query.uid
  const keywords = ctx.query.keywords as string
  const limit = ctx.query.limit ? +ctx.query.limit : 20
  const offset = ctx.query.offset ? +ctx.query.offset : 0

  if (isNaN(uid) || isNaN(limit) || isNaN(offset) || keywords === '') {
    ctx.status = 400
    return ctx.body = response(null, '参数非法!', 400)
  }

  // 3.调用service获取结果
  try {
    const res = await publicService.searchUserFollow(uid, currentUid, keywords, limit, offset)
    if (res) {
      ctx.body = response(res, 'ok')
    } else {
      ctx.status = 404
      ctx.body = response(null, '搜索用户关注列表失败,用户不存在!', 404)
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

/**
* 通过用户名来搜索用户粉丝列表
* @param ctx 
* @returns 
*/
async function toSearchUserFansList (ctx: Context) {
  const currentUid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined
  // 1.校验必要参数
  if (ctx.query.uid === undefined || ctx.query.keywords === undefined) {
    ctx.status = 400
    return ctx.body = response(null, '有参数未携带!', 400)
  }
  // 2 非法校验参数
  const uid = +ctx.query.uid
  const keywords = ctx.query.keywords as string
  const limit = ctx.query.limit ? +ctx.query.limit : 20
  const offset = ctx.query.offset ? +ctx.query.offset : 0

  if (isNaN(uid) || isNaN(limit) || isNaN(offset) || keywords === '') {
    ctx.status = 400
    return ctx.body = response(null, '参数非法!', 400)
  }

  // 3.调用service获取结果
  try {
    const res = await publicService.searchFansList(uid, currentUid, keywords, limit, offset)
    if (res) {
      ctx.body = response(res, 'ok')
    } else {
      ctx.status = 404
      ctx.body = response(null, '搜索用户粉丝列表失败,用户不存在!', 404)
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

export default {
  toSearch,
  toSearchUserFollowList,
  toSearchUserFansList
}