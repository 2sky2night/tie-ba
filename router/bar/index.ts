import Router from "koa-router";
import BarController from '../../controller/bar'

// 吧的路由
const barRouter = new Router()

// 统一注册用户路由
const baseRouteURL = '/bar'

// 创建吧 (需要token)
barRouter.post('bar',`${baseRouteURL}/create`,BarController.createBar)

// 获取所有的吧
barRouter.get('bar', `${baseRouteURL}/all`, BarController.getAllBar)

// 根据吧的id获取吧的数据
barRouter.get('bar',`${baseRouteURL}/info`,BarController.getBarInfo)

// 关注吧 (需要token)
barRouter.get('bar', `${baseRouteURL}/follow`, BarController.followBar)

export default barRouter