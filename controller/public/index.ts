import type { Context } from 'koa';
import type { Token } from '../../types';
import response from '../../utils/tools/response';
import PublicService from '../../service/public';

const publicService = new PublicService()

async function toSearch (ctx: Context) {
  ctx.body = response(null, 'ok')
}

/**
 * 通过用户名来搜索用户关注列表
 * @param ctx 
 */
async function toSearchUserFollowList(ctx: Context) {
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
          ctx.status = 400
          ctx.body = response(null, '搜索用户关注列表失败,用户不存在!', 400)
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
async function toSearchUserFansList(ctx: Context) {
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
          ctx.status = 400
          ctx.body = response(null, '搜索用户粉丝列表失败,用户不存在!', 400)
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