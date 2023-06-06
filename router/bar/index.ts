import Router from "koa-router";
import BarController from '../../controller/bar'
import middleware from "../../middleware";

// 吧的路由
const barRouter = new Router()

// 统一注册用户路由
const baseRouteURL = '/bar'

// 创建吧 (需要token) json {bname:string;bdesc:string;photo:string}
barRouter.post('bar',`${baseRouteURL}/create`,BarController.createBar)

// 获取所有的吧
barRouter.get('bar', `${baseRouteURL}/all`, BarController.getAllBar)

// 根据吧的id获取吧的数据 (使用中间件解析token 需要使用token中的数据) query {bid:number}
barRouter.get('bar', `${baseRouteURL}/info`, middleware.tokenParse ,BarController.getBarInfo)

// 关注吧 (需要token) query {bid:number}
barRouter.get('bar', `${baseRouteURL}/follow`,BarController.followBar)

// 取消关注吧 (需要token) query {bid:number}
barRouter.delete('bar', `${baseRouteURL}/follow`,BarController.canceFollowBar)

export default barRouter