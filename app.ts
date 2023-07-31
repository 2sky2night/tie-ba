// 所有的路由
import router from './router'
// 插件
import Koa from 'koa'
import koaBody from 'koa-body'
import koaStatic from 'koa-static'
import { historyApiFallback } from 'koa2-connect-history-api-fallback'
// 配置项
import * as  config from './config'
// 中间件
import middleware from './middleware'

const app = new Koa()

/*********注册全局中间件*****/
// handle fallback for HTML5 history API 除了/api以外的请求都响应index.html给用户
app.use(async(_,next) => {
   await new Promise((r)=>setTimeout(()=>r(1),Math.random()*3000))
   await next()
})
app.use(historyApiFallback({ whiteList: ['/api'] }));
// 挂载静态资源
app.use(koaStatic('public'))
app.use(koaStatic('static'))
// 注册解析请求体
app.use(koaBody())

// 全局检验token的中间件
app.use(middleware.authorizationCatcher)

// 注册路由
app.use(router.routes())

app.listen(config.PROT, () => {
    console.log(`server is running on ${ config.BASE_URL }:${ config.PROT }`)
})