// 所有的路由
import router from './router'
// 插件
import Koa from 'koa'
import koaBody from 'koa-body'
import koaStatic from 'koa-static'
// 配置项
import * as  config from './config'
// 中间件
import middleware from './middleware'

const app = new Koa()

/*********注册全局中间件*****/

// 挂载静态资源
app.use(koaStatic('static'))
// 注册解析请求体
app.use(koaBody())

// 全局检验token的中间件
app.use(middleware.authorizationCatcher)

// 注册路由
app.use(router.routes())

app.listen(config.PROT, () => {
    console.log(`server is running on ${config.BASE_URL}:${config.PROT}`)
})