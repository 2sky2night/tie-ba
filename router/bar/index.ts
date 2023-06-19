import Router from "koa-router";
import BarController from '../../controller/bar'
import middleware from "../../middleware";

// 吧的路由
const barRouter = new Router()

// 统一注册用户路由
const baseRouteURL = '/bar'

// 创建吧 (需要token) json {bname:string;bdesc:string;photo:string}
barRouter.post('bar', `${baseRouteURL}/create`, BarController.toCreateBar)

// 获取所有的吧
barRouter.get('bar', `${baseRouteURL}/all`, BarController.toGetAllBar)

// 根据吧的id获取吧的数据 (使用中间件解析token 需要使用token中的数据) query {bid:number}
barRouter.get('bar', `${baseRouteURL}/info`, middleware.tokenParse, BarController.toGetBarInfo)

// 关注吧 (需要token) query {bid:number}
barRouter.get('bar', `${baseRouteURL}/follow`, BarController.toFollowBar)

// 取消关注吧 (需要token) query {bid:number}
barRouter.delete('bar', `${baseRouteURL}/follow`, BarController.toCanceFollowBar)

// 获取关注该吧的用户 (使用中间件解析token 需要使用token中的数据) query {bid:number,limit?:number=20,offset?:number=0,desc?:number}
barRouter.get('bar', `${baseRouteURL}/follow/list`, middleware.tokenParse, BarController.toGetBarFollowUserList)

// 获取用户关注的吧列表 (使用中间件解析token 需要使用token中的数据) query {uid:number,limit?:number=20,offset?:number=0,desc?:number}
barRouter.get('bar', `${ baseRouteURL }/user/follow/list`, middleware.tokenParse, BarController.toGetUserFollowBarList)

// 获取用户创建的吧列表  (使用中间件解析token 需要使用token中的数据) query {uid:number,limit?:number=20,offset?:number=0,desc?:number}
barRouter.get('bar', `${ baseRouteURL }/user/list`, middleware.tokenParse, BarController.toGetUserBarList)

// 获取吧列表  (使用中间件解析token 需要使用token中的数据) query {limit?:number=20,offset?:number=0,desc?:number}
barRouter.get('bar', `${ baseRouteURL }/list`, middleware.tokenParse, BarController.toGetBarList)

export default barRouter