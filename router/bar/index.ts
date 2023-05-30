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

export default barRouter