// 所有的路由
import router from './router'
// 插件
import Koa from 'koa'
import koaBody from 'koa-body'
import koajwt from 'koa-jwt'
import koaStatic from 'koa-static'
// 配置项
import * as  config from './config'
// 中间件
import authorizationCatcher from './middleware/authorization'

const app = new Koa()

/*********注册全局中间件*****/

// 挂载静态资源
app.use(koaStatic('static'))
// 注册解析请求体
app.use(koaBody())

// 捕获token解析
app.use(authorizationCatcher)
// 全局解析token koa-jwt 中间件会获取前端请求中的token,进行检验
app.use(
    koajwt({
        // SECRET为加密字符串，任意字符串即可 
        secret: config.SECRET_KEY,
        // key: "user", 默认把token解析的内容保存到 'ctx.user' 中
    }).unless({ path: config.NO_AUTH })
)

// 注册路由
app.use(router.routes())

app.listen(config.PROT, () => {
    console.log(`server is running on ${config.BASE_URL}:${config.PROT}`)
})