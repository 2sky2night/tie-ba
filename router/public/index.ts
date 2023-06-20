import Router from 'koa-router'
import PulicController from '../../controller/public'
import Middreware from '../../middleware'

const publicRouter = new Router()


// 搜索  (中间件解析token ) query:{kewords:string;type?:1|2|3|4|5;limit?:number;offset?:number;desc?:boolean}
publicRouter.get('public', `/search`, Middreware.tokenParse, PulicController.toSearch)

// 搜索用户关注列表 (中间件解析token ) query:{uid:number;limit?:number;offset?:number;desc?:boolean}
publicRouter.get('public', `/search/user/follow`, Middreware.tokenParse, PulicController.toSearchUserFollowList)

// 搜索用户粉丝列表 (中间件解析token ) query:{uid:number;limit?:number;offset?:number;desc?:boolean}
publicRouter.get('public', `/search/user/fans`, Middreware.tokenParse, PulicController.toSearchUserFansList)


export default publicRouter