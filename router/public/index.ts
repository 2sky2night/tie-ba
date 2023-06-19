import Router from 'koa-router'
import PulicController from '../../controller/public'
import Middreware from '../../middleware'

const publicRouter = new Router()

const baseUrl='/search'

publicRouter.get('search',`${baseUrl}`,PulicController.toSearch)

// 搜索用户关注列表 (中间件解析token ) query:{uid:number;limit?:number;offset?:number;desc?:boolean}
publicRouter.get('search',`${baseUrl}/user/follow`,Middreware.tokenParse,PulicController.toSearchUserFollowList)

// 搜索用户粉丝列表 (中间件解析token ) query:{uid:number;limit?:number;offset?:number;desc?:boolean}
publicRouter.get('search',`${baseUrl}/user/fans`,Middreware.tokenParse,PulicController.toSearchUserFansList)


export default publicRouter