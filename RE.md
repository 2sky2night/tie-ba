tie-ba-lower

​	一个简易版的贴吧论坛：该系统有多个吧，一个吧中有多个帖子，一个帖子有多个评论，一个评论来自一个用户，一个用户可以发送帖子，可以创建吧，点赞帖子，点赞评论,一个用户可以关注多个用户，一个用户也可以被多个用户关注，一个吧可以被多个用户关注，一个用户可以关注多个吧

## 一、环境搭建

### 1.使用ts构建项目

​	安装typescript依赖`pnpm add typescript -D`

​	在当前文件夹中初始化ts配置文件`tsc --init --rootDir src --outDir dist`

​	配置好ts后安装`npm i -D @types/node nodemon ts-node` 安装ts-node是为了可以直接在node环境下运行ts代码，nodemon代码修改重新执行代码。

​	最后在包管理文件中配置脚本命令，注意ts-node 后面的文件目录指明本次执行的入口文件。

​	注意` "dev": "nodemon --watch src/**/*.ts --exec ts-node src/index.ts",`里面的文件路径需要自己配置。可以给多个watch，用来监视不同的文件夹或文件，每一个watch配置项只能监听一个模块

![image-20230529154936311](C:\Users\Dell\AppData\Roaming\Typora\typora-user-images\image-20230529154936311.png)

```json
  "scripts": {
    "dev": "nodemon --watch app.ts --watch model --watch router  --watch service --watch controller  --exec ts-node app.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

### 2.数据库设计

​	实体有吧（bid、bname、createTime、photo、bdesc）、用户（uid、username、password、createTime）、帖子（pid、content、createTime、photo？、title）、评论（cid、content、createTime）

​	关系：

​	1.一个用户可以创建多个吧（人--拥有-吧 1对n）

​	2.一个吧可以有多个帖子（吧--拥有--帖子	1对n）

​	3.一个帖子可以有多个评论（帖子--拥有-评论	1对n）

​	4.一个用户可以创建多个帖子（用户--拥有-帖子	1对n）

​	5.一个用户可以创建多个评论 （用户--拥有-评论	1对n）

​	5.5 

​		用户也可以对评论做出回复，一个用户可以做出多个回复，一个回复只有一个用户；（用户---拥有----回复 一对n）一条评论可以有多个回复，一个回复对应一条评论（评论---拥有---回复  1对n）。

​	一条回复可以有多个回复，一个回复只能有对应一个回复。（回复--拥有--回复 1对n）

​	6.一个用户可以点赞多个评论、一个评论也可以被多个用户点赞（用户--点赞--评论	n对n）

​	7.一个用户可以点赞多个帖子、一个帖子也可以被多个用户点赞	（用户--点赞--帖子	n对n）

​	8.一个用户可以关注多个用户，一个用户也可以被多个用户关注 （用户--关注--用户 n对n）

​	9.一个用户可以收藏多个帖子，一个帖子也可以被多个用户收藏（用户--收藏--帖子 n对n）

​	10.一个用户可以点赞多个回复，一个回复也可以被多个用户点赞 （用户---点赞---回复 n对n）

​	数据库ER图如下：

![image-20230608212854698](C:\Users\Dell\AppData\Roaming\Typora\typora-user-images\image-20230608212854698.png)

​	补充er图，文字描述

​	1.评论有多个回复，一个回复只能对应一个评论；用户可以发送多个回复，一个回复只能属于一个用户。回复与评论与用户的关系。评论1--回复n，用户1--回复n

​	2.一个回复可以被多个用户点赞，一个用户可以点赞多个回复。回复与用户的关系，多对多

​	3.用户可以签到多个吧，一个吧可以被多个用户签到，用户--签到--吧，多对多

1.用户表：uid、username、password、createTime、desc

2.评论表：cid、content、createTime、aid、uid

3.评论点赞表：cid、aid、createTime

4.帖子表：aid、content、photo?、title、createTime、bid、

5.帖子点赞表：aid、uid、createTime

6.吧表：bid、bname、createTime、uid、photo

7.关注吧：bid、uid、createTime

8.用户关注表: uid_is_followed（被关注的用户）、uid（关注用户的用户）、createTime

9.用户收藏帖子表:uid、aid、createTime

10.用户回复评论表：rid、uid、id、content、createTime，type（type=1为回复评论，type=2为对回复进行回复）

11.用户点赞回复表：rid,uid,createTime

12.用户签到吧表:uid,bid,is_check,score

13.吧等级制度:bid,rankJSON

### 3.项目初始化

​	项目依赖：koa、koa-router（方便写路由和模块化路由）、koa-static（挂载静态资源）、koa-body（解析请求体）、mysql2（连接数据库池）

#### 0.后端项目主要分层 

​	![image-20230529192651273](C:\Users\Dell\AppData\Roaming\Typora\typora-user-images\image-20230529192651273.png)

​	router层：router层主要处理客户端发送的请求，根据模块来分成各个router来注册对应的controller，当接收到请求时通过路由匹配下发执行对应的controller。

​	controller层：通过router层将下发到对应的路由处理函数中，一般用来**处理客户端请求的数据参数的校验**，并调用service层，执行对应的业务逻辑，并**最终将数据响应给客户端**。

​	service层（最重要的）：**执行对应的业务逻辑**，调用Model层的各个方法，处理请求的业务逻辑，最终返回给controller层。

​	model层：连接数据库，封装各种对表操作的基本方法。

#### 1.连接数据库的配置项

```ts
import type { ConnectionConfig } from 'mysql'

/**
 * 连接数据库的配置项
 */
const databaseConfig: ConnectionConfig = {
    database: 'tie_bar_lower',
    user: 'root',
    password: '1234',
    port: 3306,
    host: '127.0.0.1'
}

export default databaseConfig
```

#### 2.Model模型层

​	模型层一般都是用来操作数据库表的。

##### 创建基础模型

​	基础模型层包括了每个模型层的创建数据库连接池、连接数据库、运行sql查询语句方法。

```ts
import mysql from 'mysql'
import DBconfig from '../../config/DBconfig'

/**
 * 公共模型
 */
class BaseModel {
    pool: mysql.Connection
    constructor() {
        this.createConnection()
    }
    /**
     * 创建连接
     */
    createConnection() {
        this.pool = mysql.createConnection(DBconfig)
    }
    /**
     * 连接数据库
     */
    connect() {
        return new Promise((resolve, reject) => {
            this.pool.connect((err) => {
                if (err) {
                    // 连接数据库失败
                    reject('连接数据库失败')
                    console.log(err)
                } else {
                    resolve('ok')
                    console.log('连接数据库成功!')
                }
            })
        })
    }
    /**
     * 关闭与数据库的连接
     */
    end() {
        this.pool.end()
    }
    /**
     * 封装公共的sql方法
     */
    async runSql<T = any>(sqlString: string): Promise<T[]> {
        // 创建连接
        this.createConnection()
        // 连接数据库
        await this.connect()
        // 查询
        return new Promise((resolve, reject) => {
            this.pool.query(sqlString, (err, res) => {
                if (err) {
                    reject('查询失败')
                    console.log(err)
                } else {
                    resolve(res)
                }
                //  查询无论成功与否都关闭数据库的连接 节约服务器资源
                this.end()
            })
        })
    }
}


export default BaseModel
```

##### 创建用户模型

```ts
import BaseModel from "../base"
import type { User } from "./types"
/**
 * 用户模型
 */
class UserModel extends BaseModel {
    /**
     * 根据用户名查询用户
     */
    async getUserByUsername(username: string) {
        try {
            // 连接数据库
            await this.connect()
            const res = await this.runSql<User>(`select * from user where username='${username};'`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
}


export default UserModel
```

#### 3.service层

​	service层是完成当前请求业务的所有逻辑并返回给contoller层

##### 用户service层

​	简单实例，在复杂清空下可能会进行多个表查询等等操作。

```ts
import UserModel from '../../model/user'

const user = new UserModel()

class UserService {
    async findUserByUsername(username: string) {
        try {
            const res = await user.getUserByUsername(username)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
}

export default UserService
```

#### 4.controller控制层

​	控制层是用来处理路由业务的，包括请求的参数检验调用service层执行对应业务，并响应给客户端。

```ts
import UserService from '../../service/user'
import type { Context, Next } from 'koa'
import response from '../../utils/tools/response'

/**
 * 用户的service层
 */
const userService = new UserService()

/**
 * 检查用户是否存在
 * @param ctx 
 */
async function checkUser(ctx: Context) {
    const username = ctx.query.username
    if (!username) {
        ctx.state = 400
        return ctx.body = response(null, '未携带参数 username !', 400)
    }
    try {
        const res = await userService.findUserByUsername(username as string)
        if (res.length) {
            ctx.body = response(res[0], 'ok', 200)
        } else {
            ctx.body = response(null, '查无此人', 200)
        }
    } catch (err) {
        ctx.state = 500
        ctx.body = response(null, '出错了!', 400)
    }
}

/**
 * 用户登录
 * @param ctx 
 */
async function login(ctx: Context) {

}


export default {
    login,
    checkUser
}
```



#### 5.router路由层	

​	路由层用来处理用户请求的，通过用户的请求路径对应下发到对应路由中执行controller。通过一个统一的router来注册所有模块的路由，每个模块的路由又注册所有的路由controller。

##### 用户路由

```ts
import Router from 'koa-router'
// 用户的控制层
import UserController from '../../controller/user'

const userRouter = new Router()

// 统一注册用户路由
userRouter.get('test', '/query-user', UserController.checkUser)


export default userRouter
```

##### 统一注册所有的路由

```ts
import Router from "koa-router";
import userRouter from './user'

// 统一注册路由
const router = new Router()

// 注册用户路由
router.use(userRouter.routes())


export default router

```

#### 6.app.js

```ts
import Koa from 'koa'
import router from './router'
import koaBody from 'koa-body'

const app = new Koa()

// 注册全局中间件
app.use(koaBody())
app.use(router.routes())

app.listen(3000, () => {
    console.log('server is running on 127.0.0.1:3000')
})
```



## 二、用户模块

### 1.用户注册

#### model层

```ts
    /**
     * 在表中插入一条记录
     * @param data 
     * @returns 
     */
    async insertUser(data: UserBody) {
        try {
            const res = await this.runSql<OkPacket>(`INSERT INTO user (username, password, createTime) VALUES ('${data.username}', '${data.password}', '${new Date().toLocaleString().replace('/', '-').replace('/', '-')}');`)
            if (res.affectedRows) {
                return Promise.resolve('ok')
            }
            await Promise.reject()
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### service层

```ts
    /**
     * 创建用户
     * @param data 
     * @returns 0注册失败 1注册成功
     */
    async createUser(data: UserBody): Promise<0 | 1> {
        try {
            // 查询当前需要注册的用户名称是否存在
            const resExits = await user.selectByUsername(data.username)
            if (resExits.length) {
                // 若有记录说明用户存在
                return Promise.resolve(0)
            }
            // 在表中创建用户数据
            user.insertUser(data)
            return Promise.resolve(1)
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### controller层

```ts
/**
 * 用户注册
 * @param ctx 
 */
async function register(ctx: Context) {
    const body = ctx.request.body as UserBody
    if (!body) {
        // 未携带参数
        ctx.status = 400
        return ctx.body = response(null, '未携带参数!', 400)
    }
    if (!body.password || !body.username) {
        // 未携带参数
        ctx.status = 400
        return ctx.body = response(null, '未携带参数!', 400)
    }
    if (!body.username.trim().length) {
        // 用户名长度非法
        return ctx.body = response(null, '用户名不能为空!', 400)
    }
    if (body.password.length < 5 || body.password.length > 14) {
        // 密码长度非法
        return ctx.body = response(null, '密码长度必须为6-14位!', 400)
    }
    try {
        const res = await userService.createUser(body)
        if (res) {
            // 注册成功
            ctx.body = response(null, '注册成功!', 200)
        } else {
            // 用户名重复
            ctx.body = response(null, '用户名重复!', 400)
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '出错了!', 500)
    }
}
```

### 2.用户登录

​	登录成功后响应用户的token值 token中只有用户的id和用户的名称

![image-20230530131548638](C:\Users\Dell\AppData\Roaming\Typora\typora-user-images\image-20230530131548638.png)

#### model层

```ts
    /**
     * 通过用户名和密码检查用户是否匹配成功
     * @param username  用户名
     * @param password 密码
     * @returns 
     */
    async selectByUsernameAndPassword(username: string, password: string) {
        try {
            const res = await this.runSql<User[]>(`select * from user where username='${username}' and password='${password}';`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### service层

```ts
   /**
     * 
     * 登录业务
     * @param data 
     * @returns 0用户名不存在 1密码错误 2登录成功
     */
    async checkLogin(data: UserBody): Promise<0 | 1 | User> {
        try {
            // 查询登录用户是否存在
            const resExit = await user.selectByUsername(data.username)
            if (!resExit.length) {
                // 若用户不存在
                return Promise.resolve(0)
            }
            // 检查密码和用户名是否匹配
            const resUser = await user.selectByUsernameAndPassword(data.username, data.password)
            if (resUser.length) {
                // 匹配成功 返回用户的数据 token中保存用户的id和用户名称
                return Promise.resolve(resUser[0])
            } else {
                // 密码错误
                return Promise.resolve(1)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
```

#### controller层

```ts
/**
 * 用户登录
 * @param ctx 
 */
async function login(ctx: Context) {
    const body = (ctx.request as any).body as UserBody
    if (!body) {
        // 未携带参数
        ctx.status = 400
        return ctx.body = response(null, '未携带参数!', 400)
    }
    if (!body.password || !body.username) {
        // 未携带参数
        ctx.status = 400
        return ctx.body = response(null, '未携带参数!', 400)
    }
    if (!body.username.trim().length) {
        // 用户名长度非法
        return ctx.body = response(null, '用户名不能为空!', 400)
    }
    if (body.password.length < 5 || body.password.length > 14) {
        // 密码长度非法
        return ctx.body = response(null, '密码长度必须为6-14位!', 400)
    }

    try {
        const res = await userService.checkLogin(body)
        switch (res) {
            case 0: return ctx.body = response(null, '用户名不存在', 400);
            case 1: return ctx.body = response(null, '密码错误', 400);
            default: {
                const token = jwt.sign({ username: body.username, uid: res.uid }, SECRET_KEY, { expiresIn: '2h' });
                return ctx.body = response(token, '登录成功!', 200)
            }
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}
```

### 3.获取用户详情信息（需要token，未完成）

1.通过token中的uid来获取用户信息

2.通过uid来查询用户的关注、粉丝数量

3.通过uid来查询用户的发帖数量，以及帖子被点赞数量

4.通过uid来查询用户的评论数量，以及评论被点赞数量

5.通过uid来查询用户收藏的帖子数量，展示用户最近10条收藏的帖子基本信息(只有基本的帖子信息)

6.通过uid来查询用户点赞的帖子数量，展示用户最近10条点赞的帖子基本信息(只有基本的帖子信息)

#### model层

```ts
   /**
     * 通过用户id来查找用户数据
     * @param uid 用户的id
     * @returns 
     */
    async selectByUid(uid: number) {
        try {
            const res = await this.runSql<User[]>(`select uid,username,createTime,avatar from user where uid=${uid}`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### service层

```ts
    /**
     * 通过uid获取用户信息
     * @param uid 
     * @returns 0查无此人 用户信息:查询数据成功
     */
    async findUserByUid(uid: number): Promise<0 | User> {
        try {
            const res = await user.selectByUid(uid)
            if (res.length) {
                // 查询到了
                return Promise.resolve(res[0])
            } else {
                // 查无此人
                return Promise.resolve(0)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
```

#### controller层

```ts
/**
 * 获取用户信息 (需要token)
 * @param ctx 
 */
async function getUserInfo(ctx: Context) {
    // token中有用户名称,解析token后,使用用户名称查询用户数据
    const user = ctx.state.user
    try {
        if (user.uid) {
            // 通过用户的id查询用户数据
            const res = await userService.findUserByUid(user.id)
            if (res) {
                // 查询到了
                ctx.bod = response(res, 'ok', 200)
            } else {
                // 查无此人
                ctx.bod = response(null, '查无此人', 400)
            }
        } else {
            await Promise.reject()
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }

}
```

### 4.关注用户（需要token）

​	根据当前token解析出关注者的id，携带查询参数uid代表需要被关注者的id。需要检验当前用户是否关注了被关注者，若没有插入该记录即可，若有记录则提示已经关注的错误。

#### model

```ts
    /**
     * 在用户关注表中插入一条记录
     * @param uid 关注者的id
     * @param uidIsFollowed  被关注者的id
     */
    async insertFollow (uid: number, uidIsFollowed: number) {
        try {
            const res = await this.runSql<OkPacket>(`INSERT INTO user_follow_user(uid, uid_is_followed, createTime) VALUES (${ uid }, ${ uidIsFollowed }, '${ getNowTimeString() }')`)
            if (res.affectedRows) {
                return Promise.resolve('ok')
            } else {
                await Promise.reject()
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户关注表中通过uid和uidIsFollowed查询记录
     * @param uid 关注者的id
     * @param uidIsFollowed 被关注者的id
     * @returns 
     */
    async selectByUidAndUidIsFollow (uid: number, uidIsFollowed: number) {
        try {
            const res = await this.runSql<UserFollow[]>(`select * from user_follow_user where uid=${ uid } and uid_is_followed=${ uidIsFollowed }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### service

```tsx
    /**
     * 关注用户
     * @param uid 关注者
     * @param uidIsFollowed 被关注者
     * @returns -2不能自己关注自己 -1被关注者不存在 0已经关注了 1关注成功 
     */
    async toFollowUser (uid: number, uidIsFollowed: number): Promise<-2 | -1 | 0 | 1> {
        if (uid === uidIsFollowed) {
            return Promise.resolve(-2)
        }
        try {
            // 1.查询被关注着是否存在
            const resFollowerExist = await user.selectByUid(uidIsFollowed)
            if (!resFollowerExist.length) {
                return Promise.resolve(-1)
            }
            // 2.查询是否已经关注了
            const resExist = await user.selectByUidAndUidIsFollow(uid, uidIsFollowed)
            if (resExist.length) {
                // 已经关注了
                return Promise.resolve(0)
            } else {
                // 未关注
                await user.insertFollow(uid, uidIsFollowed)
                return Promise.resolve(1)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### controller

```ts
/**
 * 关注用户 （需要token）
 * @param ctx 
 */
async function followUser (ctx: Context) {
    const token = ctx.state.user as Token
    const query = ctx.query
    console.log(query)
    if (query.uid === undefined) {
        // 参数未携带
        ctx.status = 400
        ctx.body = response(null, '参数未携带', 400)
    } else {
        // 携带了参数
        const uidIsFollowed = +query.uid
        // 验证参数
        if (isNaN(uidIsFollowed)) {
            // 参数不合法
            ctx.status = 400
            ctx.body = response(null, '参数不合法', 400)
        } else {
            try {
                const res = await userService.toFollowUser(token.uid, uidIsFollowed)
                if (res === 1) {
                    // 关注成功
                    ctx.body = response(null, '关注成功!', 200)
                } else if (res === 0) {
                    // 重复关注的提示
                    ctx.body = response(null, '已经关注了!', 400)
                } else if (res === -2) {
                    // 不能自己关注自己
                    ctx.body = response(null, '不能自己关注自己!', 400)
                } else if (res === -1) {
                    // 被关注者不存在
                    ctx.body = response(null, '被关注者不存在!', 400)
                }
            } catch (error) {
                ctx.status = 500
                ctx.body = response(null, '服务器出错了!', 500)
            }

        }
    }
}
```



### 5.取消关注用户 （需要token）

​	根据当前token解析出关注者的id，携带查询参数uid代表需要被关注者的id。需要检验当前用户是否关注了被关注者，若没有提示还没关注该用户的错误，若有记录则删除该记录即可。

#### model

```ts
    /**
     * 在用户关注表中删除一条记录
     * @param uid 
     * @param uidIsFollowed 
     * @returns 
     */
    async deleteByUidAndUidIsFollowedScopedFollow (uid: number, uidIsFollowed: number) {
        try {
            const res = await this.runSql<OkPacket>(`delete from user_follow_user where uid=${ uid } and uid_is_followed=${ uidIsFollowed }`)
            if (res.affectedRows) {
                return Promise.resolve('ok')
            } else {
                await Promise.reject()
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### service

```ts
    /**
     * 取消关注用户
     * @param uid 关注者的id
     * @param uidIsFollowed 被关注者的id
     * @returns -2：自己不能取消关注自己 -1：被关注者不存在 0：还未关注不能取消关注 1：取关成功
     */
    async toCancelFollow (uid: number, uidIsFollowed: number): Promise<-2 | -1 | 0 | 1> {
        if (uid === uidIsFollowed) {
            // 自己不能取消关注自己
            return Promise.resolve(-2)
        }
        try {
            // 1.查询被关注着是否存在
            const resFollowerExist = await user.selectByUid(uidIsFollowed)
            if (!resFollowerExist.length) {
                return Promise.resolve(-1)
            }
            // 2.查询是否已经关注了
            const resExist = await user.selectByUidAndUidIsFollow(uid, uidIsFollowed)
            if (resExist.length) {
                // 已经关注了 则删除该记录
                await user.deleteByUidAndUidIsFollowedScopedFollow(uid, uidIsFollowed)
                return Promise.resolve(1)
            } else {
                // 未关注 则说明没有该记录取消关注失败
                return Promise.resolve(0)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### controller

```ts
/**
 * 取消关注用户
 * @param ctx 
 */
async function cancelFollowUser (ctx: Context) {
    const token = ctx.state.user as Token;

    if (ctx.query.uid === undefined) {
        // 参数未携带
        ctx.status = 400;
        ctx.body = response(null, '参数未携带!', 400)
        return
    }

    // 被关注者的id
    const uidIsFollowed = +ctx.query.uid;
    if (uidIsFollowed === 0 || isNaN(uidIsFollowed)) {
        // 参数非法
        ctx.status = 400;
        ctx.body = response(null, '参数非法!', 400)
        return
    }

    try {
        const res = await userService.toCancelFollow(token.uid, uidIsFollowed)
        switch (res) {
            case 0: { ctx.status = 400; ctx.body = response(null, '取消关注失败,还未关注此用户!', 400); break; }
            case -2: { ctx.status = 400; ctx.body = response(null, '取消关注失败,不能取消关注自己!', 400); break; }
            case 1: { ctx.status = 200; ctx.body = response(null, '取消关注成功!'); break; }
            case -1: { ctx.status = 400; ctx.body = response(null, '取消关注失败,被关注者不存在!', 400); break; }
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }

}
```



### 6.获取关注列表  （分页）

​	在用户关注表中uid为关注者的id，只需要在表中查询有多少该关注者的记录即可查询该用户的关注列表。

​	1.注意分页，在sql查询时使用limit offset关键字实现分页。

​	2.获取到关注用户的id列表后，只需要遍历通过uid_is_followed去用户表查询对应数据，即可获取到关注列表用户的详情数据。

​	3.还需要获取该用户关注列表的总数total

#### model

```ts
    /**
     * 在用户关注表中 通过uid来查询记录关注列表    (分页数据)
     * @param uid 关注者的id
     * @param limit 需要查询多少条记录
     * @param offset 从第几条数据开始查询数据
     * @returns 
     */
    async selectByUidScopedFollowLimit(uid: number, limit: number, offset: number) {
        try {
            const res = await this.runSql<UserFollow[]>(`SELECT * FROM user_follow_user where uid=${uid} limit ${limit} OFFSET ${offset}`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户关注表中 通过uid来获取关注数量
     * @param uid 
     * @returns 
     */
    async selectByUidScopedFollowCount(uid: number) {
        try {
            const res = await this.runSql<CountRes>(`SELECT COUNT(*) as total FROM user_follow_user where uid=${uid};`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }

```

#### service层

```ts
    /**
     * 获取用户的关注列表
     * @param uid 用户id
     * @param limit 多少条数据
     * @param offset 从第几条开始获取数据
     * @returns 
     */
    async getFollowList(uid: number, limit: number, offset: number) {
        try {
            // 获取通过当前uid来获取被关注的用户列表 (分页的数据)
            const resIdList = await user.selectByUidScopedFollowLimit(uid, limit, offset)
            const userList: UserWithout[] = []
            // 遍历获取用户数据
            for (let i = 0; i < resIdList.length; i++) {
                // 通过被关注者的id获取被关注者数据
                const userItem = await user.selectByUid(resIdList[i].uid_is_followed)
                if (userItem.length) {
                    // 若查询到了 保存该数据
                    userList.push(userItem[0])
                }
            }
            // 获取关注数量
            const total = await user.selectByUidScopedFollowCount(uid)
            return Promise.resolve({ list: userList, total: total[0].total, limit, offset })
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### controller

```ts
/**
 * 获取用户关注列表
 * @param ctx 
 * @returns 
 */
async function getUserFollowList(ctx:Context) {
    if (ctx.query.uid === undefined) {
        // 未携带参数
        ctx.status = 400;
        ctx.body=response(null,'未携带参数!',400)
        return
    }
    const uid = +ctx.query.uid;
    // 获取的条数默认20条
    const limit =ctx.query.limit===undefined? 20:+ctx.query.limit;
    // 获取的偏移量默认从0开始
    const offset = ctx.query.offset === undefined ? 0 : +ctx.query.offset;

    if (isNaN(uid) || isNaN(limit) || isNaN(offset)) {
        // 参数非法
        ctx.status = 400;
        ctx.body = response(null, '参数非法!', 400)
        return
    }
    try {
        const res = await userService.getFollowList(uid, limit, offset)
        ctx.body=response(res,'ok')
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}
```



### 7.获取粉丝列表（分页）

​		在用户关注表中uid_is_followed为被关注者的id，只需要在表中查询有多少该被关注者的记录即可查询该用户的粉丝列表。

​	1.注意分页，在sql查询时使用limit offset关键字实现分页。

​	2.获取到粉丝用户的id列表后，只需要遍历通过uid去用户表查询对应数据，即可获取到关注列表用户的详情数据。

​	3.还需要获取该用户粉丝列表的总数total

#### model

```ts
    /**
 * 在用户关注表中 通过uid_is_followed来查询记录粉丝列表    (分页数据)
 * @param uidIsFollowed 被关注者的id
 * @param limit 需要查询多少条记录
 * @param offset 从第几条数据开始查询数据
 * @returns 
 */
    async selectByUidFollowedScopedFollowLimit(uidIsFollowed: number, limit: number, offset: number) {
        try {
            const res = await this.runSql<UserFollow[]>(`SELECT * FROM user_follow_user where uid_is_followed=${uidIsFollowed} limit ${limit} OFFSET ${offset}`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户关注表中 通过uid_is_followed来获取粉丝数量
     * @param uidIsFollowed 被关注者的id
     * @returns 
     */
    async selectByUidFollowedScopedFollowCount(uidIsFollowed: number) {
        try {
            const res = await this.runSql<CountRes>(`SELECT COUNT(*) as total FROM user_follow_user where uid_is_followed=${uidIsFollowed};`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }

```

#### service层

```ts
    /**
     * 获取粉丝列表
     * @param uidIsFollowed 被关注者的id
     * @param limit 多少条数据
     * @param offset 从第几条开始获取数据
     * @returns 
     */
    async getFansList(uidIsFollowed: number, limit: number, offset: number) {
        try {
            // 获取通过当前uid来获取粉丝列表 (分页的数据)
            const resIdList = await user.selectByUidFollowedScopedFollowLimit(uidIsFollowed, limit, offset)
            const userList: UserWithout[] = []
            // 遍历获取用户数据
            for (let i = 0; i < resIdList.length; i++) {
                // 通过关注者的id获取粉丝数据
                const userItem = await user.selectByUid(resIdList[i].uid)
                if (userItem.length) {
                    // 若查询到了 保存该数据
                    userList.push(userItem[0])
                }
            }
            // 获取粉丝数量
            const total = await user.selectByUidFollowedScopedFollowCount(uidIsFollowed)
            return Promise.resolve({ list: userList, total: total[0].total, limit, offset })
        } catch (error) {
            return Promise.reject(error)
        }
    }
}
```

#### controller

```ts
/**
 * 获取用户粉丝列表
 * @param ctx 
 * @returns 
 */
async function getUserFansList(ctx: Context) {
    if (ctx.query.uid === undefined) {
        // 未携带参数
        ctx.status = 400;
        ctx.body = response(null, '未携带参数!', 400)
        return
    }
    const uid = +ctx.query.uid;
    // 获取的条数默认20条
    const limit = ctx.query.limit === undefined ? 20 : +ctx.query.limit;
    // 获取的偏移量默认从0开始
    const offset = ctx.query.offset === undefined ? 0 : +ctx.query.offset;

    if (isNaN(uid) || isNaN(limit) || isNaN(offset)) {
        // 参数非法
        ctx.status = 400;
        ctx.body = response(null, '参数非法!', 400)
        return
    }
    try {
        const res = await userService.getFansList(uid, limit, offset)
        ctx.body = response(res, 'ok')
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}
```



### 8.获取用户信息 （通过query参数访问用户信息）

1.通过查询参数中的uid来获取用户信息

2.通过uid来查询用户的关注、粉丝数量

3.通过uid来查询用户的发帖数量，以及帖子被点赞数量

4.通过uid来查询用户的评论数量，以及评论被点赞数量

5.通过uid来查询用户收藏的帖子数量，展示用户最近10条收藏的帖子基本信息(只有基本的帖子信息)

6.通过uid来查询用户点赞的帖子数量，展示用户最近10条点赞的帖子基本信息(只有基本的帖子信息)



### 9.修改用户信息 （token）

#### model

```ts
    /**
     * 在用户表中 更新用户信息
     * @param uid 用户id
     * @param username 用户名
     * @param avatar 头像
     * @returns 
     */
    async updateInUserTableByUid(uid: number, username: string, avatar: string) {
        try {
            const res = await this.runSql<OkPacket>(`UPDATE user SET username = '${username}', avatar='${avatar}'  WHERE uid = ${uid}`)
            if (res.affectedRows) {
                return Promise.resolve('ok')
            } else {
                await Promise.reject('更新用户信息失败')
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### service

```ts
    /**
     * 修改用户信息(不包括密码)
     * 1.查询要修改的用户是否重复
     * 2.不重复则可以修改用户信息
     * @param uid 用户id
     * @param avatar 头像
     * @param username 用户名称
     * @returns 0:用户名已经存在了 1:修改成功
     */
    async updateUserData(uid: number, avatar: string, username: string): Promise<0 | 1> {
        try {
            const resExist = await user.selectByUsername(username)
            if (resExist.length) {
                // 用户名已经存在了 不能修改
                return Promise.resolve(0)
            } else {
                // 用户名不存在 则可以修改
                await user.updateInUserTableByUid(uid, username, avatar)
                return Promise.resolve(1)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### controller

```ts
/**
 * 修改用户信息 (不包含密码)
 * @param ctx 
 */
async function toUpdateUser(ctx: Context) {
    const token = ctx.state.user as Token
    const body = (ctx.request as any).body as UserUpdateBody
    if (body === undefined || body.avatar === undefined || body.username === undefined) {
        ctx.status = 400;
        return ctx.body = response(null, '有参数未携带!', 400)
    }

    if (!body.username.trim().length) {
        // 用户名长度非法
        ctx.status = 400
        return ctx.body = response(null, '用户名不能为空!', 400)
    }

    try {
        const res = await userService.updateUserData(token.uid, body.avatar, body.username)
        if (res) {
            // 更新成功
            ctx.body = response(null, '修改用户信息成功!')
        } else {
            // 用户名已经存在了
            ctx.body = response(null, '修改用户信息失败,用户名已经存在了!', 400)
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}
```



### 10.修改用户密码 （token）

#### model

```ts
    /**
     * 在用户表中 更新用户密码
     * @param uid 用户名
     * @param password 密码
     * @returns 
     */
    async updateInUserTableByUidWithPassword(uid: number, password: string) {
        try {
            const res = await this.runSql<OkPacket>(`UPDATE user SET password = '${password}' WHERE uid = ${uid}`)
            if (res.affectedRows) {
                return Promise.resolve('ok')
            } else {
                await Promise.reject('更新用户密码失败')
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     *  在用户表中 通过uid查询用户信息
     * @param uid 
     * @returns 
     */
    async selectInUserTableByUid(uid: number) {
        try {
            const res = await this.runSql<User[]>(`select * from user where uid=${uid}`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### service

```ts
    /**
     * 更新用户密码
     * @param uid 用户id
     * @param password 新密码
     * @param oldPassword 旧密码
     * @returns -1:旧密码对不上 0:新旧密码一致 1:修改密码成功
     */
    async updateUserPassword(uid: number, password: string, oldPassword: string): Promise<-1 | 0 | 1> {
        try {
            const [userInfo] = await user.selectInUserTableByUid(uid)
            if (userInfo) {
                // 用户存在
                if (userInfo.password === oldPassword) {
                    // 旧密码匹配成功
                    if (userInfo.password === password) {
                        // 新旧密码一样
                        return Promise.resolve(0)
                    } else {
                        await user.updateInUserTableByUidWithPassword(uid, password)
                        return Promise.resolve(1)
                    }
                } else {
                    // 验证密码失败
                    return Promise.resolve(-1)
                }
            } else {
                // 用户不存在
                return await Promise.reject('用户不存在!')
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### controller

```ts
/**
 * 修改用户密码
 * @param ctx 
 * @returns 
 */
async function toUpdateUserPassword(ctx: Context) {
    const token = ctx.state.user as Token
    const body = (ctx.request as any).body as UserUpdatePasswordBody

    if (body === undefined || body.password === undefined || body.oldPassword === undefined) {
        ctx.status = 400;
        return ctx.body = response(null, '有参数未携带!', 400)
    }

    if (body.password.length < 5 || body.password.length > 14 || body.oldPassword.length < 5 || body.oldPassword.length > 14) {
        // 密码长度非法
        ctx.status = 400;
        return ctx.body = response(null, '密码长度必须为6-14位!', 400)
    }

    try {
        const res = await userService.updateUserPassword(token.uid, body.password, body.oldPassword)
        if (res === 1) {
            ctx.body = response(null, '修改密码成功')
        } else if (res === 0) {
            ctx.status = 400
            ctx.body = response(null, '修改密码失败,新旧密码一致!', 400)
        } else {
            ctx.status = 400
            ctx.body = response(null, '修改密码失败,密码验证失败!', 400)
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }

}
```



###  11.注销 （待定）





## 三、吧模块

### 1.创建吧 (需要token)

​	创建吧对于model层只需要insert方法插入表即可，对于service还需要检查吧名是否存在，存在则创建失败，若不存在则调用model层的insert方法插入记录，对于controller层需要检验字段然后调用service层将结果响应给客户端即可。

#### model层

```ts
// 基础模型
import BaseModel from '../base'
// 类型
import type { Bar, BarCreateBody } from './types'
import type { OkPacket } from 'mysql'
// 工具函数
import { getNowTimeString } from '../../utils/tools/time'

/**
 * 吧模型
 */
class BarModel extends BaseModel {
    /**
     * 插入一条吧的数据
     * @param data 
     */
    async insertBar(data: BarCreateBody) {
        try {
            const res = await this.runSql<OkPacket>(`insert into bar (bname,createTime,uid,bdesc,photo) values ('${data.bname}','${getNowTimeString()}',${data.uid},'${data.bdesc}','${data.photo}')`)
            if (res.affectedRows) {
                return Promise.resolve('ok')
            } else {
                await Promise.reject()
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 通过吧的名称来查询吧
     * @param bname 吧的名称
     * @returns 查询结果
     */
    async selectByBname(bname: string) {
        try {
            const res = await this.runSql<Bar[]>(`select * from bar where bname='${bname}'`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
}

export default BarModel


```

#### service层

```ts
// 吧模型
import BarModel from "../../model/bar";
// 类型
import type { BarBody, BarCreateBody } from "../../model/bar/types";

// 吧模型实例
const bar = new BarModel()

/**
 * 吧的service层
 */
class BarService {
    /**
     * 创建吧
     * @param data 吧的数据
     * @returns 创建的结果 0吧名重复 1创建成功
     */
    async createBar(data: BarCreateBody): Promise<0 | 1> {
        try {
            // 先查询吧是否存在
            const resExist = await bar.selectByBname(data.bname)
            if (resExist.length) {
                // 吧名重复 创建失败
                return Promise.resolve(0)
            } else {
                // 吧名未重复, 则以数据来创建吧
                await bar.insertBar(data)
                return Promise.resolve(1)
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
}

export default BarService

```

#### controller层

```ts
// 吧的模型层
import BarService from "../../service/bar";
// 类型
import type { Context } from "koa";
import type { BarBody } from "../../model/bar/types";
import type { Token } from '../user/types'
// 工具函数
import response from '../../utils/tools/response'

/**
 * bar的service层
 */
const barService = new BarService()

/**
 * 创建吧
 * @param ctx 
 */
async function createBar(ctx: Context) {
    const body = (ctx.request as any).body as BarBody
    console.log(body.photo)
    if (!body.bname || !body.bdesc || !body.photo) {
        ctx.status = 400
        ctx.body = response(null, '有参数未携带', 400)
        return
    }
    try {
        // 把用户token 解析出来uid
        const user = ctx.state.user as Token
        if (user.uid) {
            // 创建吧
            const res = await barService.createBar({ ...body, uid: user.uid })
            if (res) {
                // 创建成功
                ctx.body = response(null, '创建吧成功!', 200)
            } else {
                // 吧名重复
                ctx.body = response(null, '吧名重复!', 400)
            }
        } else {
            // token错误
            await Promise.reject()
        }
    } catch (error) {
        ctx.status = 500
        ctx.body = response(null, '服务器出错了!', 500)
    }
}


export default {
    createBar
}
```

#### router层

```ts
import Router from "koa-router";
import BarController from '../../controller/bar'

// 吧的路由
const barRouter = new Router()

// 统一注册用户路由
const baseRouteURL = '/bar'

// 创建吧 (需要token)
barRouter.post('bar',`${baseRouteURL}/create`,BarController.createBar)

export default barRouter
```

### 2.查询所有的吧

#### model层

```ts
    /**
     * 查询当前所有的吧
     * @returns 
     */
    async selectAllBar() {
        try {
            const res = await this.runSql<Bar[]>('select * from bar')
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### service层

```ts
    /**
     * 获取所有的吧
     * @returns 
     */
    async findAllBar() {
        try {
            const res = await bar.selectAllBar()
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### controller层

```ts
/**
 * 获取所有的吧
 * @param ctx 
 */
async function getAllBar(ctx: Context) {
    try {
        const res = await barService.findAllBar()
        ctx.body = response(res, 'ok')
    } catch (error) {
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }
}
```

### 3.获取吧的详情数据

​	当前用户是否关注了吧的查询逻辑未完成。当前只完成了根据吧的id来获取吧的数据以及创建吧的用户数据。

​	**当前用户对吧的关注状态**

​	该接口需要配置路由白名单，根据请求头中Authorization是否传入token，来判断当前用户是否登录。若未登录则直接设置对吧的关注状态为false，若传入了则需要通过中间件来解析出token数据，token数据中包含用户的uid，通过uid和bid到表中进行查询记录，若有则设置状态为关注，否则设置状态为未关注。最终就把吧的数据响应给客户端。

​	**当前用户对吧主的关注状态**

​	根据token可以获取出用户id，通过用户id和吧主id在用户关注用户的表中查询是否有记录即可，若未登录则直接返回未登录。

#### 单独解析token中的数据的中间件

​	使用jsonwebtoken库来单独解析token数据。jsonwebtoken库可以解析任意以jwt标准市场的token，注意解析时不要传入Bearer+空格字段，会导致解析出错。

​	环境：

<img src="C:\Users\Dell\AppData\Roaming\Typora\typora-user-images\image-20230605223818442.png" alt="image-20230605223818442" style="zoom:50%;" />

```ts
// 单独解析token的中间件(若未携带token则ctx.state.user={} 若token解析成功则ctx.state.user=对应数据)
import type { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'
import { SECRET_KEY } from '../config'
import response from '../utils/tools/response'

export default async function tokenParse(ctx: Context, next: Next) {
    try {
        // 获取用户的token
        const token = ctx.header.authorization
        // 若传入token就进行解析
        if (token) {
            // 把token中多余的bearer去掉 否则解析会出错
            const formatToken = token.split(' ')[1]
            // 获取解析出来的token数据
           const data= await new Promise((resolve, rejected) => {
               jwt.verify(formatToken, SECRET_KEY, function (err, decoded) {
                    if (err) {
                        // token解析失败
                        console.log(err)
                        rejected(err)
                    } else {
                        // token解析成功
                        resolve(decoded)
                    }
                })
           })
            // 将token数据保存在ctx.state.user中
            ctx.state.user=data
        } else {
            //未传入token 交给控制层进行处理

        }
        //  无论是否传入token 只要解析成功都进入控制层逻辑
        await next()
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }
}


```



#### model层

```ts
    /**
     * 根据吧的id查询吧的信息
     * @param bid 
     * @returns 
     */
    async selectByBid(bid: number) {
        try {
            const res = await this.runSql<Bar[]>(`select * from bar where bid=${bid}`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### service层

```ts
  /**
     * 获取吧的详情数据
     * @param bid 吧的id
     * @param uid 当前登录的用户id
     * @returns 获取吧的数据已经用户数据已经当前用户是否
     * 1. (当前登录的用户是否关注吧)
     * 2.(当前登录的用户是否关注吧主)
     */
    async getBarInfo (bid: number, uid: number | undefined) {
        try {
            //  获取吧的信息
            const resBar = await bar.selectByBid(bid)
            if (!resBar.length) {
                // 根据bid获取吧数据失败
                return Promise.resolve(0)
            }
            // 吧的数据
            const barInfo = resBar[ 0 ]
            // 获取到吧主的信息
            const resUser = await user.selectByUid(barInfo.uid)
            if (resUser.length) {
                // 将用户数据和吧的数据响应给客户端
                let res: any = null
                // 通过当前登录的用户id来检验是否关注了吧
                if (uid === undefined) {
                    //  若未登陆
                    res = { ...barInfo, is_follow: false, user: { ...resUser[ 0 ], is_follow: false } }
                } else {
                    //  若登录 
                    // 1.查询用户是否关注了吧
                    const resFollowBar = await bar.selectFollowByUidAndBid(bid, uid)
                    let isFollowBar = false
                    if (resFollowBar.length) {
                        // 关注了吧
                        isFollowBar = true
                    } else {
                        //  未关注吧
                        isFollowBar = false
                    }
                    // 2.查询用户是否关注了吧主
                    const resFollowUser = await user.selectByUidAndUidIsFollow(uid, barInfo.uid)
                    let isFollowUser = false
                    if (resFollowUser.length) {
                        // 关注了吧主
                        isFollowUser = true
                    } else {
                        // 未关注吧主
                        isFollowUser = false
                    }
                    // 响应请求内容
                    res = { ...barInfo, follow_bar: isFollowBar, user: { ...resUser[ 0 ], is_follow: isFollowUser } }
                }

                return Promise.resolve(res)
            } else {
                //  获取用户数据失败
                await Promise.reject()
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### controller层

 ```ts
/**
 * 获取吧的数据 
 * 1.吧关注状态:若用户未登录,吧关注状态为false,若用户token解析合法通过用户id在用户关注吧中查询返回关注状态
 * 2.吧创建者的关注状态::若用户未登录,吧关注状态为false,若用户token解析合法通过用户id在用户关注中查询返回关注状态
 * @param ctx 
 * @returns 返回吧和吧创建者的数据
 */
async function getBarInfo (ctx: Context) {
    const token = ctx.state.user as Token;
    const query = ctx.query
    if (query.bid === undefined) {
        ctx.status = 400
        ctx.body = response(null, '参数未携带', 400)
    } else {
        const bid = + query.bid
        if (isNaN(bid) || bid === 0) {
            // 参数非法
            ctx.status = 400
            ctx.body = response(null, '参数非法', 400)
        } else {
            // 参数合法
            try {
                // 获取吧的数据 (根据是否传入token来查询当前用户是否关注了吧)
                const res = await barService.getBarInfo(bid, ctx.header.authorization ? token.uid : undefined)
                if (res === 0) {
                    ctx.body=response(null,'获取吧数据失败,该吧不存在!',400)
                } else {
                    ctx.body = response(res, 'ok')
                }
            } catch (error) {
                console.log(error)
                ctx.status = 500;
                ctx.body = response(null, '服务器出错了!', 500)
            }
        }
    }

}
 ```

### 4.用户关注吧 (需要token)

​	根据当前token解析出关注者的id，携带查询参数bid代表需要被吧的id。需要检验当前用户是否关注了吧，若没有则增加记录，若有记录则提示已经关注了的错误。

#### model层

```ts
    /**
     * 关注吧 (操作吧关注表)
     * @param bid 吧的id
     * @param uid 用户的id
     * @returns 
     */
    async insertFollow(bid: number, uid: number) {
        try {
            const res = await this.runSql<OkPacket>(`INSERT INTO user_follow_bar (uid, bid, createTime) VALUES (${uid}, ${bid}, '${getNowTimeString()}')`)
            if (res.affectedRows) {
                return Promise.resolve()
            } else {
                await Promise.reject()
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 查询用户是否关注了当前吧 (查询吧关注表)
     * @param bid 吧的id
     * @param uid 用户的id
     */
    async selectFollowByUidAndBid(bid: number, uid: number) {
        try {
            const res = await this.runSql<UserFollowBarItem[]>(`select * from user_follow_bar where bid=${bid} and uid=${uid}`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### service层

```ts
    /**
     * 用户关注吧
     * @param bid 吧的id
     * @param uid 用户的id
     * @returns 0已经关注了 1关注成功
     */
    async followBar(bid: number, uid: number): Promise<0 | 1> {
        try {
            // 先检查用户是否关注吧
            const resExist = await bar.selectFollowByUidAndBid(bid, uid)
            if (resExist.length) {
                // 用户已经关注了该吧了!
                return Promise.resolve(0)
            }
            // 关注吧
            await bar.insertFollow(bid, uid)
            return Promise.resolve(1)
        } catch (error) {
            return Promise.reject()
        }
    }
}
```

#### controller层

```ts
/**
 * 关注吧
 * @param ctx 
 */
async function followBar (ctx: Context) {
    // 查询参数检验
    if (!ctx.query.bid) {
        ctx.status = 400
        return ctx.body = response(null, '参数未携带', 400)
    }
    const bid = +ctx.query.bid
    if (isNaN(bid) || bid === 0) {
        // 参数非法
        ctx.status = 400
        return ctx.body = response(null, '参数非法', 400)
    } else {
        // 解析出token数据
        const user = ctx.state.user as Token
        try {
            if (user.uid) {
                // token解析成功
                const res = await barService.toFollowBar(bid, user.uid)
                if (res) {
                    return ctx.body = response(null, '关注成功!')
                } else {
                    return ctx.body = response(null, '关注吧失败,已经关注了!', 400)
                }
            } else {
                // token解析失败
                await Promise.reject()
            }
        } catch (error) {
            console.log(error)
            ctx.status = 500;
            ctx.body = response(null, '服务器出错了!', 500)
        }
    }
}
```

### 5.用户取消关注吧 （需要token）

​	根据当前token解析出关注者的id，携带查询参数bid代表需要被吧的id。需要检验当前用户是否关注了吧，若没有则提示还没关注的错误，若有记录则删除记录即可。

#### model

```ts
    /**
     * 在用户关注吧表中删除关注吧记录
     * @param bid 
     * @param uid 
     * @returns 
     */
    async deleteFollowByUidAndBid (bid: number, uid: number) {
        try {
            const res = await this.runSql<OkPacket>(`DELETE FROM user_follow_bar WHERE uid = ${ uid } AND bid = ${ bid }`)
            if (res.affectedRows) {
                return Promise.resolve()
            } else {
                await Promise.reject()
            }
        } catch (error) {
            return Promise.reject(error)
        }    
    }
```

#### service

```ts
  /**
     * 取消关注吧
     * @param bid 吧id 
     * @param uid 用户id
     * @returns 0:未关注不能取消关注吧 1：关注了则取消关注吧
     */
    async toCancelFollowBar (bid: number, uid: number):Promise<0|1> {
        try {
            // 1.当前用户是否关注过吧
            const resExist = await bar.selectFollowByUidAndBid(bid, uid)
            if (!resExist.length) {
                // 未关注不能取消关注
                return Promise.resolve(0)
            }
            // 2.删除关注记录
            await bar.deleteFollowByUidAndBid(bid, uid)
            return Promise.resolve(1)
        } catch (error) {
            return Promise.reject(error) 
        }
    }
```

#### controller

```ts

/**
 * 取消关注吧
 * @param ctx 
 */
async function canceFollowBar (ctx: Context) {
    // 查询参数检验
    if (!ctx.query.bid) {
        ctx.status = 400
        return ctx.body = response(null, '参数未携带', 400)
    }
    const bid = +ctx.query.bid
    if (isNaN(bid) || bid === 0) {
        // 参数非法
        ctx.status = 400
        return ctx.body = response(null, '参数非法', 400)
    }
    // 解析出token数据
    const token = ctx.state.user as Token
    try {
        const res = await barService.toCancelFollowBar(bid, token.uid)
        if (res) {
            // 取消关注成功
            ctx.body=response(null,'取消关注成功!')
        } else {
            // 当前未关注吧 不能取消关注
            ctx.body=response(null,'取消关注吧失败,当前未关注该吧!',400)
        }
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }

}
```

### 6.获取吧关注者的信息列表 (分页)

​	在用户关注吧表中，通过吧bid来查询关注该吧的用户uid列表，通过遍历uid列表查询用户详情数据，并且还需要通过当前登录的用户状态来查询当前用户对这些用户的关注状态。

​	

#### model层

```ts
    /**
     * 在用户关注吧表中 通过吧bid查询有多少个用户关注了该吧
     * @param bid 吧id
     * @returns 
     */
    async selectFollowByBidCount(bid: number) {
        try {
            const res = await this.runSql<CountRes>(`SELECT count(*) as total FROM user_follow_bar where bid=${bid} `)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户关注吧表中 通过bid来查询有多少个用户关注了该吧 (分页限制)
     * @param bid 吧di
     * @param limit 查询多少条数据?
     * @param offset 偏移量多少开始查询数据
     * @returns 
     */
    async selectFollowByBidLimit(bid: number, limit: number, offset: number) {
        try {
            const res = await this.runSql<UserFollowBarItem[]>(`SELECT * FROM user_follow_bar where bid=${bid}  limit ${limit} offset ${offset}`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### service层

```ts
    /**
     * 获取关注该吧的用户
     * @param bid 吧id
     * @param uid 当前登录的用户id
     * @param limit 响应多少条数据
     * @param offset 从多少偏移量开始获取数据
     * @returns 
     */
    async getBarFollowUser(bid: number, uid: number | undefined, limit: number, offset: number) {
        try {
            // 1.获取关注该吧的用户数量
            const resCount = await bar.selectFollowByBidCount(bid)
            if (!resCount.length) {
                // 查询出错
                await Promise.reject()
            }
            // 2.获取关注该吧的所有用户id列表
            const resUid = await bar.selectFollowByBidLimit(bid, limit, offset)

            // 3.通过用户id来获取用户详情数据
            const userList: UserWithout[] = []
            for (let i = 0; i < resUid.length; i++) {
                const userInfo = await user.selectByUid(resUid[i].uid)
                if (userInfo.length) {
                    // 有记录就保存用户数据
                    userList.push(userInfo[0])
                }
            }

            // 用户详情信息列表
            const userInfoList: UserInfo[] = []
            // 4.若当前登录了用户还需要查询当前用户是否关注了这些用户
            if (uid !== undefined) {
                // 登录了 需要使用查询当前用户对这些用户的关注状态
                for (let i = 0; i < userList.length; i++) {
                    // 通过当前用户id和列表用户id来查询是否有关注状态
                    const resFollow = await user.selectByUidAndUidIsFollow(uid, userList[i].uid)
                    if (resFollow.length) {
                        // 有记录 说明关注了
                        userInfoList.push({ ...userList[i], is_follow: true })
                    } else {
                        // 无记录 说明未关注
                        userInfoList.push({ ...userList[i], is_follow: false })
                    }
                }
            } else {
                // 未登录 则对这些用户的关注状态为未关注
                userList.map(ele => {
                    return { ...ele, is_follow: false }
                }).forEach(ele => {
                    userInfoList.push(ele)
                })
            }
            return Promise.resolve({
                list: userInfoList,
                limit,
                offset,
                total: resCount[0].total
            })
        } catch (error) {
            return Promise.reject(error)
        }
    }
}

```



### 7.获取当前用户关注的吧  (分页)

​	具体的业务逻辑

​	1.通过查询参数的uid查询该用户关注的吧id列表，并查询出该用户关注吧的总数量

​	2.通过遍历吧id列表来查询对应吧的详情数据

​	3.通过吧的详情数据列表的uid来查询对应吧主的详情信息

​	4.通过用户登录的状态来查询对于每个吧的关注状态

​	5.通过用户登录的状态来查询对于每个吧主的关注状态

#### model

```ts
    /**
     * 在用户关注吧表中 通过用户uid 获取用户关注吧的总数
     * @param uid 
     * @returns 
     */
    async selectFollowByUidCount (uid: number) {
        try {
            const res = await this.runSql<CountRes>(`SELECT count(*) as total FROM user_follow_bar where uid=${ uid } `)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
     * 在用户关注吧表中 通过用户uid 获取该用户关注的吧id列表 (分页限制)
     * @param uid 用户id
     * @param limit 查询多少条数据?
     * @param offset 偏移量多少开始查询数据
     * @returns 
     */
    async selectFollowByUidLimit (uid: number, limit: number, offset: number) {
        try {
            const res = await this.runSql<UserFollowBarItem[]>(`SELECT * FROM user_follow_bar where uid=${ uid }  limit ${ limit } offset ${ offset }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### service

```ts
    /**
     * 获取用户关注的吧
     * 1.通过uid查询当前用户关注的吧id列表，同时也需要获取该用户关注吧的总数total
     * 2.通过吧id列表来查询每个吧的详情信息
     * 3.通过吧主的id来获取每个吧的吧主信息
     * 4.通过当前登录的用户currentUid来查询当前用户对这些吧的关注状态
     * 5.通过当前登录的用户currentUid来查询当前用户对这些吧主的关注状态
     * @param uid 要查询的用户id
     * @param currentUid 当前登录的用户id
     * @param limit 响应多少条数据
     * @param offset 从多少偏移量开始获取数据
     */
    async getUserFollowBar (uid: number, currentUid: number | undefined, limit: number, offset: number) {
        try {
            // 1. 获取该用户关注吧的总数量
            const resTotal = await bar.selectFollowByUidCount(uid)
            if (!resTotal.length) {
                // 查询失败
                await Promise.reject()
            }

            // 2. 获取该用户关注的吧id列表
            const resBidList = await bar.selectFollowByUidLimit(uid, limit, offset)

            // 3. 通过bid列表获取吧的详情数据
            const barInfoList: Bar[] = []
            // 遍历吧id列表来查询吧的详情数据
            for (let i = 0; i < resBidList.length; i++) {
                const barInfo = await bar.selectByBid(resBidList[ i ].bid)
                if (barInfo.length) {
                    barInfoList.push(barInfo[ 0 ])
                }
            }

            // 4.通过当前登录的用户来获取对每个吧的关注状态
            const barInfoFollowList: BarInfoWithFollow[] = []
            if (currentUid === undefined) {
                // 未登录 则对吧的关注状态都为 false 未关注
                barInfoList.map(ele => {
                    return { ...ele, is_followed: false }
                }).forEach(item => {
                    barInfoFollowList.push(item)
                })
            } else {
                // 登录 则需要通过吧的详情数据列表进行查询每个吧的关注状态
                for (let i = 0; i < barInfoList.length; i++) {
                    const resFollowBar = await bar.selectFollowByUidAndBid(barInfoList[ i ].bid, currentUid)
                    if (resFollowBar.length) {
                        // 有记录说明当前用户关注了吧
                        barInfoFollowList.push({ ...barInfoList[ i ], is_followed: true })
                    } else {
                        // 没记录说明没有关注吧
                        barInfoFollowList.push({ ...barInfoList[ i ], is_followed: false })
                    }
                }
                
            }

            // 5.通过吧详情数据来获取每个吧的吧主信息以及对吧主的关注状态
            const barInformationList: BarInfo[] = [];
            for (let i = 0; i < barInfoFollowList.length; i++) {
                const userInfo = await user.selectByUid(barInfoFollowList[ i ].uid)
                if (userInfo.length) {
                    // 查询吧主信息成功 并查询对吧主关注状态
                    if (currentUid === undefined) {
                        // 若未登录则关注状态为未关注
                        barInformationList.push({ ...barInfoFollowList[ i ], user: { ...userInfo[ 0 ], is_followed: false } })
                    } else {
                        // 登录了 需要查询是否关注了用户
                        const resFollow = await user.selectByUidAndUidIsFollow(currentUid, barInfoFollowList[ i ].uid)
                        if (resFollow.length) {
                            // 关注了
                            barInformationList.push({ ...barInfoFollowList[ i ], user: { ...userInfo[ 0 ], is_followed: true } })
                        } else {
                            // 未关注
                            barInformationList.push({ ...barInfoFollowList[ i ], user: { ...userInfo[ 0 ], is_followed: false } })
                        }
                    }
                }
            }

            return Promise.resolve({
                list: barInformationList,
                limit,
                offset,
                total: resTotal[ 0 ].total
            })

        } catch (error) {
            return Promise.reject(error)
        }
    }
```

#### controller

```ts
/**
 * 获取用户关注吧的列表
 * @param ctx 
 * @returns 
 */
async function getUserFollowBarList (ctx: Context) {

    // 1.检查是否携带token来获取当前登录用户的id
    let currentUid: undefined | null | number = null;
    if (ctx.header.authorization) {
        // 若携带了token且被解析成功 则获取token中的uid数据
        currentUid = (ctx.state.user as Token).uid
    } else {
        // 未携带token
        currentUid = undefined
    }

    //  2.检验查询参数是否合法
    if (ctx.query.uid === undefined) {
        ctx.status = 400
        ctx.body = response(null, '有参数未携带!', 400)
        return
    }

    const uid = +ctx.query.uid;
    const limit = ctx.query.limit ? +ctx.query.limit : 20;
    const offset = ctx.query.offset ? +ctx.query.offset : 0;

    if (isNaN(uid) || isNaN(limit) || isNaN(offset)) {
        ctx.status = 400
        ctx.body = response(null, '参数不合法!', 400)
        return
    }

    // 3. 调用service层获取数据
    try {
        const res = await barService.getUserFollowBar(uid, currentUid, limit, offset)
        ctx.body = response(res, 'ok')
    } catch (error) {
        console.log(error)
        ctx.status = 500;
        ctx.body = response(null, '服务器出错了!', 500)
    }

}
```



### 8.获取全部吧 (分页)



### 9.删除吧 （待定）



## 四、帖子模块

### 1.获取帖子详情数据

​	具体的业务逻辑

​	1.通过查询参数aid获取帖子详情数据

​	2.通过帖子详情数据的uid查询帖子创建者详情数据，以及当前登录用户对帖子创建者的关注状态

​	3.通过帖子详情数据的bid查询帖子所属吧的详情数据，以及当前登录用户对吧的关注状态

​	4.通过aid来查询帖子点赞数量，以及当前登录用户对帖子的点赞状态

​	5.通过aid来查询帖子的收藏数量，以及当前登录用户对帖子的收藏状态

#### model

```ts
  /**
   * 在帖子表中 通过aid来获取对应记录
   * @param aid 帖子id
   * @returns 对应帖子的数据
   */
  async selectInArticleTableByAid(aid: number) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`select * from article where aid=${aid}`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### service

```ts
  /**
   * 获取文章详情数据
   1.通过查询参数aid获取帖子详情数据
    2.通过帖子详情数据的uid查询帖子创建者详情数据，以及当前登录用户对帖子创建者的关注状态
    3.通过帖子详情数据的bid查询帖子所属吧的详情数据，以及当前登录用户对吧的关注状态
    4.通过aid来查询帖子点赞数量，以及当前登录用户对帖子的点赞状态
    5.通过aid来查询帖子的收藏数量，以及当前登录用户对帖子的收藏状态
   * @param aid 
   * @returns 
   */
  async getArticleInfo(aid: number, uid: number | undefined) {
    try {
      // 1.查询文章是否存在
      const [articleInfo] = await article.selectInArticleTableByAid(aid)
      if (articleInfo) {
        // 文章存在

        // 2.查询该文章的创建者 以及当前登录的用户对创建者的关注状态
        const [resUserCreateArticle] = await user.selectByUid(articleInfo.uid)
        const userInfo: UserInfo = {
          ...resUserCreateArticle,
          is_followed: uid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, resUserCreateArticle.uid)).length > 0
        }

        // 3.查询该帖子所属的吧详情信息 以及当前登录用户对吧的关注状态 以及吧主的详情信息以及吧主的关注状态
        const [resBar] = await bar.selectByBid(articleInfo.bid)
        const [resUserCreateBar] = await user.selectByUid(resBar.uid)
        const barInfo: BarInfo = {
          ...resBar,
          // 对当前吧的关注状态
          is_followed: uid === undefined ? false : (await bar.selectFollowByUidAndBid(resBar.bid, uid)).length > 0,
          user: {
            ...resUserCreateBar,
            // 对当前吧主的关注状态
            is_followed: uid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, resUserCreateBar.uid)).length > 0
          }
        }

        // 4.查询该帖子的点赞数量 以及当前用户点赞的状态
        const [resLikeCount] = await article.countInLikeArticleTableByAid(aid)
        const isLiked = uid === undefined ? false : (await article.selectInLikeArticleTableByAidAndUid(uid, aid)).length > 0

        // 5.查询该帖子的收藏数量 以及当前用户收藏的状态
        const [resStarCount] = await article.countInStarArticleTableByAid(aid)
        const isStar = uid === undefined ? false : (await article.selectInStarArticleTableByUidAndAid(uid, aid)).length > 0

        // 6.处理帖子配图问题
        const photo: string[] = []
        if (articleInfo.photo !== null) {
          // 若帖子有配图 则需要转换成数组
          articleInfo.photo.split(',').forEach(ele => photo.push(ele))
        }

        return Promise.resolve({
          aid: articleInfo.aid,
          title: articleInfo.title,
          content: articleInfo.content,
          bid: articleInfo.bid,
          uid: articleInfo.uid,
          photo: articleInfo.photo === null ? null : photo,
          createTime: articleInfo.createTime,
          like_count: resLikeCount.total,
          is_liked: isLiked,
          star_count: resStarCount.total,
          is_star: isStar,
          user: userInfo,
          bar: barInfo
        })

      } else {
        // 文章不存在
        return Promise.resolve(0)
      }

    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### controller

```ts
/**
 * 创建帖子
 * @param ctx 
 */
async function toCreateArticle(ctx: Context) {
  const token = ctx.state.user as Token;
  const body = (ctx.request as any).body as CreateArticleBody
  if (isNaN(body.bid) || body.content === undefined || body.title === undefined) {
    ctx.status = 400;
    ctx.body = response(null, '参数非法!', 400)
    return
  }
  const insertBody: InsertArticleBody = {
    uid: token.uid,
    content: body.content,
    bid: body.bid,
    title: body.title
  }

  if (body.photo && body.photo instanceof Array) {
    // 若携带了帖子配图且为数组 
    // 需要检验配图携带的上限
    if (body.photo.length > 3) {
      ctx.status = 400;
      return ctx.body = response(null, '发帖失败,帖子配图上限为三张')
    } else {
      insertBody.photo = body.photo.join(',')
    }
  } else if (typeof body.photo === 'string') {
    // 若是字符串(单个图片)
    insertBody.photo = body.photo
  }

  try {
    const res = await articleService.createArticle(insertBody)
    if (res) {
      ctx.body = response(null, '发帖成功!')
    } else {
      ctx.status = 400;
      ctx.body = response(null, '发帖失败,所在的吧不存在!', 500)
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }
}
```



### 2.创建帖子 (需要token)

​	具体逻辑：需要检验传入的请求体的bid是否存在，需要先查询确认在哪个吧下面创建的帖子。其他的参数只需要非法检验即可。

#### model

```ts
  /**
   * 在帖子表中插入一条记录
   * @param data 
   * @returns 
   */
  async insertInArticleTable(data: InsertArticleBody) {
    try {
      const sqlString = data.photo ?
        `INSERT INTO acrticle(content, createTime, bid, uid, title,photo) VALUES ('${data.content}', '${getNowTimeString()}', ${data.bid}, ${data.uid}, '${data.title}','${data.photo}')` :
        `INSERT INTO acrticle(content, createTime, bid, uid, title) VALUES ('${data.content}', '${getNowTimeString()}', ${data.bid}, ${data.uid}, '${data.title}')`
      const res = await this.runSql<OkPacket>(sqlString)
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject('插入数据失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### service

```ts
  /**
   * 创建帖子
   * @param data 
   * @returns 0所在吧不存在 1发帖成功
   */
  async createArticle(data: InsertArticleBody): Promise<1 | 0> {
    try {
      // 1.需要先查询发帖所在的吧是否存在
      const res = await bar.selectByBid(data.bid)
      if (res.length) {
        // 吧存在 就创建对应的帖子
        await article.insertInArticleTable(data)
        return Promise.resolve(1)
      } else {
        // 吧不存在
        return Promise.resolve(0)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### controller

```ts
/**
 * 创建帖子
 * @param ctx 
 */
async function toCreateArticle(ctx: Context) {
  const token = ctx.state.user as Token;
  const body = (ctx.request as any).body as CreateArticleBody
  if (isNaN(body.bid) || body.content === undefined || body.title === undefined) {
    ctx.status = 400;
    ctx.body = response(null, '参数非法!', 400)
    return
  }
  try {
    const res = await acrticleService.createArticle({ ...body, uid: token.uid })
    if (res) {
      ctx.body = response(null, '发帖成功!')
    } else {
      ctx.status = 400;
      ctx.body = response(null, '发帖失败,所在的吧不存在!', 500)
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }
}
```



### 3.收藏帖子 （需要token）

​	主要的业务逻辑是：

​	1.通过传入的查询参数aid，来查询需要收藏的帖子是否存在

​	2.若帖子存在，通过aid和uid来查询当前是否已经收藏了该帖子

​	3.若被收藏了则不能重复收藏，若未被收藏则可以收藏，在数据库表中插入记录即可。

#### model

```ts
  /**
   * 在收藏帖子表中 通过uid和aid插入一条记录
   * @param uid 用户id
   * @param aid 帖子id
   * @returns 
   */
  async insertInStarArticleTable (uid: number, aid: number) {
    try {
      const res = await this.runSql<OkPacket>(`INSERT INTO user_star_article(uid, aid, createTime) VALUES (${ uid }, ${ aid }, '${ getNowTimeString() }')`)
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject('插入收藏帖子记录失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子表中 通过uid和aid来查询用户收藏该帖子的记录
   * @param uid 帖子id
   * @param aid 用户id
   * @returns 
   */
  async selectInStarArticleTableByUidAndAid (uid: number, aid: number) {
    try {
      const res = await this.runSql<ArticleStarBaseItem[]>(`select * from user_star_article where uid=${ uid } and aid=${ aid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### service

```ts
  /**
   * 收藏帖子
   * 1.通过aid查询帖子是否存在
   * 2.通过aid和uid查询帖子是否已经收藏了
   * 3.通过验证即可插入记录收藏帖子
   * @param uid 用户id
   * @param aid 帖子id
   * @returns -1：帖子不存在 0：重复收藏 1：收藏成功
   */
  async starArticle(uid: number, aid: number): Promise<-1 | 0 | 1> {
    try {
      // 1.通过aid查询帖子是否存在
      const resExist = await article.selectInArticleTableByAid(aid)
      if (!resExist.length) {
        // 收藏的帖子不存在
        return Promise.resolve(-1)
      }
      // 2.通过aid和uid查询是否收藏了帖子
      const resIsStar = await article.selectInStarArticleTableByUidAndAid(uid, aid)
      if (resIsStar.length) {
        // 已经收藏了 则不能重复收藏
        return Promise.resolve(0)
      } else {
        // 未收藏 则插入记录
        await article.insertInStarArticleTable(uid, aid)
        return Promise.resolve(1)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### controller

```ts
/**
 * 收藏帖子
 * @param ctx 
 */
async function toStarArticle(ctx: Context) {
  const token = ctx.state.user as Token;

  // 验证帖子aid参数
  if (ctx.query.aid === undefined) {
    ctx.status = 400;
    return ctx.body = response(null, '参数未携带!', 400)
  }

  const aid = +ctx.query.aid

  if (isNaN(aid)) {
    ctx.status = 400;
    return ctx.body = response(null, '参数非法!', 400)
  }

  try {
    const res = await acrticleService.starArticle(token.uid, aid);
    if (res === -1) {
      ctx.status = 400;
      ctx.body = response(null, '收藏帖子失败,帖子不存在!', 400)
    } else if (res === 0) {
      ctx.status = 400;
      ctx.body = response(null, '收藏帖子失败,请勿重复收藏帖子!', 400)
    } else {
      ctx.body = response(null, '收藏帖子成功!')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}
```



### 4.取消收藏帖子 （token）

​	主要的业务逻辑是：

​	1.通过传入的查询参数aid，来查询取消收藏的帖子是否存在。

​	2.若存在，则通过aid和uid来查询用户是否收藏过该帖子

​	3.若收藏了则删除记录即可，若未收藏则不可用删除记录。

#### model

```ts
 /**
   * 在收藏帖子中 通过uid和aid来删除用户收藏帖子的记录
   * @param aid 帖子id
   * @param uid 用户id
   * @returns 
   */
  async deleteInStarArticleTableByAidAndUid (aid: number, uid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from user_star_article where uid=${ uid } and aid=${ aid }`)
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject('删除收藏帖子的记录失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### service

```ts
  /**
   * 取消收藏帖子
   * 1.通过aid查询帖子是否存在
   * 2.通过aid和uid查询用户是否收藏过帖子
   * 3.若收藏过则取消收藏
   * @param uid 用户id
   * @param aid 帖子id
   * @returns -1:帖子不存咋 0:未收藏过 1:取消收藏成功
   */
  async cancelStarArticle(uid: number, aid: number): Promise<-1 | 0 | 1> {
    try {
      // 1.通过uid来查询该帖子是否存在
      const resExist = await article.selectInArticleTableByAid(aid)
      if (!resExist.length) {
        // 若帖子不存在 则不能收藏
        return Promise.resolve(-1)
      }
      // 2.通过uid和aid来查询用户是否收藏过帖子
      const resIsStar = await article.selectInStarArticleTableByUidAndAid(uid, aid)
      console.log(resIsStar)
      if (resIsStar.length) {
        // 若存在记录说明用户收藏过帖子 则可以取消收藏
        await article.deleteInStarArticleTableByAidAndUid(aid, uid)
        return Promise.resolve(1)
      } else {
        // 不存在记录 说明用户没有收藏过帖子 不能取消收藏
        return Promise.resolve(0)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### controller

```ts

/**
 * 取消收藏帖子
 * @param ctx 
 */
async function toCancelStarArticle(ctx: Context) {
  const token = ctx.state.user as Token;

  // 验证帖子aid参数
  if (ctx.query.aid === undefined) {
    ctx.status = 400;
    return ctx.body = response(null, '参数未携带!', 400)
  }

  const aid = +ctx.query.aid

  if (isNaN(aid)) {
    ctx.status = 400;
    return ctx.body = response(null, '参数非法!', 400)
  }

  try {
    const res = await acrticleService.cancelStarArticle(token.uid, aid);
    if (res === -1) {
      ctx.status = 400;
      ctx.body = response(null, '取消收藏帖子失败,帖子不存在!', 400)
    } else if (res === 0) {
      ctx.status = 400;
      ctx.body = response(null, '取消收藏帖子失败,未收藏帖子!', 400)
    } else {
      ctx.body = response(null, '取消收藏帖子成功!')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}
```



### 5.点赞帖子 （token）

​	主要的业务逻辑是：

​	1.通过传入的查询参数aid，来查询需要点赞的帖子是否存在

​	2.若帖子存在，通过aid和uid来查询当前是否已经点过赞了该帖子

​	3.若被点赞则不能重复点赞，若未被点赞则可以点赞。

#### model

```ts
 /**
   * 在点赞帖子表中 插入一条记录
   * @param uid 
   * @param aid 
   * @returns 
   */
  async insertInLikeArticleTable (uid: number, aid: number) {
    try {
      const res = await this.runSql<OkPacket>(`INSERT INTO user_like_article(aid, uid, createTime) VALUES (${ aid }, ${ uid }, '${ getNowTimeString() }')`)
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject('插入数据失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 通过aid和uid查询该用户是否点赞该帖子
   * @param uid 
   * @param aid 
   * @returns 
   */
  async selectInLikeArticleTableByAidAndUid (uid: number, aid: number) {
    try {
      const res = await this.runSql<ArticleLikeBaseItem[]>(`select * from user_like_article where uid=${ uid } and aid=${ aid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### service

```ts
  /**
   * 用户点赞帖子 
   * 1.查询对应文章是否存在
   * 2.若文章存在即查询是否有对应的点赞记录了
   * 3.有就不能点赞 没有则插入记录
   * @param uid 用户id
   * @param aid 帖子id
   * @returns -1：文章不存在 0：已经点赞了 1：点赞成功
   */
  async likeArticle (uid: number, aid: number): Promise<-1 | 0 | 1> {
    try {
      // 1.查询文章是否存在
      const resExist = await article.selectInArticleTableByAid(aid)
      if (!resExist.length) {
        // 文章不存在
        return Promise.resolve(-1)
      }
      // 2.查询用户是否已经点赞了
      const resIsLike = await article.selectInLikeArticleTableByAidAndUid(uid, aid)
      if (resIsLike.length) {
        // 已经点赞了不能重复点赞
        return Promise.resolve(0)
      } else {
        // 未点赞 即可插入记录
        await article.insertInLikeArticleTable(uid, aid)
        return Promise.resolve(1)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### controller层

```ts
/**
 * 点赞帖子
 * @param ctx 
 * @returns 
 */
async function toLikeArticle (ctx: Context) {
  const token = ctx.state.user as Token

  // 验证帖子aid参数
  if (ctx.query.aid === undefined) {
    // 未携带参数
    ctx.status = 400;
    ctx.body = response(null, '参数未携带!', 400)
    return
  }

  const aid = +ctx.query.aid
  // 帖子aid参数非法
  if (isNaN(aid)) {
    ctx.status = 400;
    ctx.body = response(null, '参数非法!', 400)
    return
  }

  try {
    const res = await acrticleService.likeArticle(token.uid, aid)
    if (res === -1) {
      ctx.status = 400;
      ctx.body = response(null, '点赞帖子失败,帖子不存在!', 400)
    } else if (res === 0) {
      ctx.status = 400;
      ctx.body = response(null, '点赞帖子失败,请勿重复点赞!', 400)
    } else if (res === 1) {
      ctx.body = response(null, '点赞帖子成功!')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}
```



### 6.取消点赞帖子 （token）

​	主要的逻辑是：

​	1.通过传入的查询参数aid，先查询取消点赞的帖子是否存在，不存在则返回错误信息

​	2.若存在，则通过uid和aid来查询用户是否点赞过该帖子

​	3.若点赞过则删除记录即可，若未点赞则返回错误信息，未点赞的帖子不能取消点赞

#### model

```ts
  /**
   * 在点赞帖子表中 通过uid和aid删除用户点赞帖子的记录
   * @param uid 用户id
   * @param aid 帖子id
   * @returns 
   */
  async deleteInLikeArticleTableByAidAndUid (uid: number, aid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from user_like_article where uid=${ uid } and aid=${ aid }`)
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject('删除点赞帖子的记录失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### service

```ts
  /**
   * 用户取消点赞帖子
   * 1.查询帖子是否存在
   * 2.查询帖子是否被点赞过
   * 3.若被点赞过则删除记录
   * @param uid 用户id
   * @param aid 帖子id
   * @returns -1：文章不存在 0：没有点赞记录 1：取消点赞成功
   */
  async cancelLikeArticle (uid: number, aid: number): Promise<-1 | 0 | 1> {
    try {
      // 1.查询文章是否存在
      const resExist = await article.selectInArticleTableByAid(aid)
      if (!resExist.length) {
        // 文章不存在
        return Promise.resolve(-1)
      }
      // 2.查询用户是否已经点赞了
      const resIsLike = await article.selectInLikeArticleTableByAidAndUid(uid, aid)
      if (resIsLike.length) {
        // 已经点赞了 则删除记录
        await article.deleteInLikeArticleTableByAidAndUid(uid, aid)
        return Promise.resolve(1)
      } else {
        // 未点赞 则不能删除记录
        return Promise.resolve(0)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### controller

```ts
/**
 * 取消点赞帖子
 * @param ctx 
 * @returns 
 */
async function toCancelLikeArticle (ctx: Context) {
  const token = ctx.state.user as Token

  // 验证帖子aid参数
  if (ctx.query.aid === undefined) {
    // 未携带参数
    ctx.status = 400;
    ctx.body = response(null, '参数未携带!', 400)
    return
  }

  const aid = +ctx.query.aid
  // 帖子aid参数非法
  if (isNaN(aid)) {
    ctx.status = 400;
    ctx.body = response(null, '参数非法!', 400)
    return
  }

  try {
    const res = await acrticleService.cancelLikeArticle(token.uid, aid)
    if (res === -1) {
      ctx.status = 400;
      ctx.body = response(null, '取消点赞帖子失败,帖子不存在!', 400)
    } else if (res === 0) {
      ctx.status = 400;
      ctx.body = response(null, '取消点赞帖子失败,还未对该帖子点赞!', 400)
    } else if (res === 1) {
      ctx.body = response(null, '取消点赞帖子成功!')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}

```



### 7.评论 （需要token）

​	主要的业务逻辑：

​	1.通过post请求将评论的数据发送给服务器，先对请求体参数进行验证

​	2.验证评论对应的帖子aid是否存在

​	3.存在即可在对应帖子下发送评论。

#### model

```ts
  /**
   * 在评论表中 插入一条记录
   * @param data 评论的请求体
   * @returns 
   */
  async insertInCommentTable(data: InserCommentBody) {
    const sqlString = data.photo ?
      `INSERT INTO comment(content, createTime, aid, uid, photo) VALUES ('${data.content}', '${getNowTimeString()}', ${data.aid}, ${data.uid},'${data.photo}')`
      :
      `INSERT INTO comment(content, createTime, aid, uid) VALUES ('${data.content}', '${getNowTimeString()}', ${data.aid}, ${data.uid})`
    try {
      const res = await this.runSql<OkPacket>(sqlString)
      if (res.affectedRows) {
        // 插入记录成功
        return Promise.resolve()
      } else {
        // 插入记录失败
        await Promise.reject('插入评论失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### service

```ts
  /**
   * 创建评论
   * 1.通过aid查询对应的帖子是否存在
   * 2.在评论表中插入记录
   * @param data 
   * @returns 0:帖子不存在 1:发送评论成功
   */
  async createComment(data: InserCommentBody): Promise<0 | 1> {
    try {
      const resExist = await article.selectInArticleTableByAid(data.aid)
      if (!resExist.length) {
        // 帖子不存在
        return Promise.resolve(0)
      } else {
        // 帖子存在
        await article.insertInCommentTable(data)
        return Promise.resolve(1)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### controller

```ts
/**
 * 发送评论
 * @param ctx 
 * @returns 
 */
async function toCreateComment(ctx: Context) {
  const token = ctx.state.user as Token;
  // 检验参数是否携带
  const body = (ctx.request as any).body as CreateCommentBody
  if (body.aid === undefined || body.content === undefined) {
    // 必要参数未携带
    ctx.status = 400
    return ctx.body = response(null, '有参数未携带', 400)
  }
  // 校验参数是否合法
  if (isNaN(body.aid)) {
    // 帖子参数非法
    ctx.status = 400
    return ctx.body = response(null, '参数非法', 400)
  }
  const inertBody: InserCommentBody = {
    uid: token.uid,
    content: body.content,
    aid: body.aid
  }
  // 是否携带了photo字段?
  if (body.photo) {
    // 携带了photo字段
    if (body.photo instanceof Array) {
      // 若传入的是数组 则需要转换为字符串
      inertBody.photo = body.photo.join(',')
    } else {
      // 传入的是字符串
      inertBody.photo = body.photo
    }
  }

  try {
    const res = await articleService.createComment(inertBody)
    if (res) {
      // 发送评论成功
      ctx.body = response(null, '发送评论成功!')
    } else {
      // 发送评论失败 帖子不存在
      ctx.status = 400;
      ctx.body = response(null, '发送评论失败,帖子不存在', 400)
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }
}
```



### 8.删除评论 （token）

1.传入cid，对其非法校验

2.通过cid来查询该评论是否存在

2.由于删除评论是删除自己创建的评论，需要检查该评论的创建者是否为当前登录的用户

3.楼主也可以删除该帖子下的所有评论，需要通过aid来查询帖子的创建者id，若当前用户的id为创建者的id也可以删除评论

3.是则删除评论即可。

#### model

```ts
  /**
   * 在评论表中 通过cid来删除一条评论
   * @param cid 评论的id
   * @returns 
   */
  async deleteInCommentTableByCid(cid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from comment where cid=${cid}`)
      if (res.affectedRows) {
        // 删除成功
        return Promise.resolve()
      } else {
        await Promise.reject('删除评论失败')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过cid来查询评论记录
   * @param cid 
   * @returns 
   */
  async selectInCommentTableByCid(cid: number) {
    try {
      const res = await this.runSql<CommentBaseItem[]>(`select * from comment where cid=${cid}`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### service

```ts
  /**
   * 删除评论
   * 1.通过cid查询帖子是否存在
   * 2.评论创建者可以删除评论,若评论创建者是当前用户则可以删除评论
   * 3.楼主也可以删除评论,若当前用户的id===当前评论所属的帖子的创建者id则可以删除评论
   * @param cid 
   * @param uid 
   * @returns -1:评论不存在 0:不是评论创建者和楼主 1:评论创建者删除评论 2:楼主删除评论
   */
  async deleteComment(cid: number, uid: number) {
    try {

      // 1.查询评论是否存在
      const [comment] = await article.selectInCommentTableByCid(cid)
      if (comment === undefined) {
        // 评论不存在
        return Promise.resolve(-1)
      }

      // 2.检验是否可以删除评论
      if (comment.uid === uid) {
        // 2.1若该评论的创建者是当前登录的用户则可以删除记录
        await article.deleteInCommentTableByCid(cid)
        return Promise.resolve(1)
      } else {
        // 2.2不是评论的创建者 需要检查当前登录的用户是否为帖子的楼主
        const [articleInfo] = await article.selectInArticleTableByAid(comment.aid)

        if (articleInfo.uid === uid) {
          //2.2.1 若删除评论的用户为该帖子的创建者则可以删除记录
          await article.deleteInCommentTableByCid(cid)
          return Promise.resolve(2)
        } else {
          // 2.2.2既不是评论创建者也不是楼主则不能删除评论
          return Promise.resolve(0)
        }
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### controller

```ts
/**
 * 删除评论
 * @param ctx 
 */
async function toDeleteComment(ctx: Context) {
  const token = ctx.state.user as Token;

  // 检验评论id参数
  if (ctx.query.cid === undefined) { ctx.status = 400; return ctx.body = response(null, '参数未携带!', 400) }

  const cid = + ctx.query.cid
  if (isNaN(cid)) { ctx.status = 400; return ctx.body = response(null, '参数非法!', 400) }

  try {
    const res = await articleService.deleteComment(cid, token.uid)
    if (res === -1) {
      ctx.status = 400
      ctx.body = response(null, '删除评论失败,评论不存在', 400)
    } else if (res === 0) {
      ctx.status = 400
      ctx.body = response(null, '删除评论失败,不是评论创建者或楼主', 400)
    } else if (res === 1) {
      ctx.body = response(null, '删除评论成功,评论创建者删除评论')
    } else if (res === 2) {
      ctx.body = response(null, '删除评论成功,楼主删除评论')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}
```



### 9.点赞评论 （token）

   1.通过cid查询评论是否存在

  2.通过cid和uid查询用户是否点赞过评论

  3.未点赞则插入记录 点赞过则不能重复点赞

#### model

```ts
  /**
   * 在点赞评论表中 插入一条记录
   * @param cid 评论id
   * @param uid 用户id
   * @returns 
   */
  async insertInLikeCommentTable(cid: number, uid: number) {
    try {
      const res = await this.runSql<OkPacket>(`INSERT INTO user_like_comment(cid, uid, createTime) VALUES (${cid}, ${uid}, '${getNowTimeString()}')`)
      if (res.affectedRows) {
        // 插入记录成功
        return Promise.resolve()
      } else {
        // 插入记录失败
        await Promise.reject('插入点赞评论记录失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞评论表中 通过cid和uid删除评论记录
   * @param cid 评论的id
   * @param uid 用户的id
   */
  async deleteInLikeCommentTableByCidAndUid(cid: number, uid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from user_like_comment where cid=${cid} and uid=${uid}`)
      if (res.affectedRows) {
        // 删除记录成功
        return Promise.resolve()
      } else {
        // 删除记录失败
        await Promise.reject('删除点赞评论失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞评论表中 通过cid和uid查询点赞评论记录
   * @param cid 评论id
   * @param uid 用户id
   */
  async selectInLikeCommentTableByCidAndUid(cid: number, uid: number) {
    try {
      const res = await this.runSql<LikeCommentBaseItem[]>(`select * from user_like_comment where cid=${cid} and uid=${uid}`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### service

```ts
  /**
   * 点赞评论
   * 1.通过cid查询评论是否存在
   * 2.通过cid和uid查询用户是否点赞过评论
   * 3.未点赞则插入记录 点赞过则不能重复点赞
   * @param cid 
   * @param uid 
   * @returns -1:评论不存在 0:已经点赞过了 1:点赞成功
   */
  async likeComment(cid: number, uid: number) {
    try {
      // 1.通过cid来查询评论是否存在
      const [comment] = await article.selectInCommentTableByCid(cid)
      if (comment === undefined) {
        // 评论不存在
        return Promise.resolve(-1)
      } else {
        // 评论存在
        // 2.查询用户是否点赞过评论
        const resExist = await article.selectInLikeCommentTableByCidAndUid(cid, uid)
        if (resExist.length) {
          // 点赞过了 不能重复点赞
          return Promise.resolve(0)
        } else {
          // 未点赞 插入记录
          await article.insertInLikeCommentTable(cid, uid)
          return Promise.resolve(1)
        }
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
```

#### controller

```ts
/**
 * 点赞评论
 * @param ctx 
 * @returns 
 */
async function toLikeComment(ctx: Context) {
  const token = ctx.state.user as Token;

  // 检验评论id参数
  if (ctx.query.cid === undefined) { ctx.status = 400; return ctx.body = response(null, '参数未携带!', 400) }

  const cid = + ctx.query.cid
  if (isNaN(cid)) { ctx.status = 400; return ctx.body = response(null, '参数非法!', 400) }

  try {
    const res = await articleService.likeComment(cid, token.uid)
    if (res === -1) {
      ctx.status = 400
      ctx.body = response(null, '点赞评论失败,评论不存在', 400)
    } else if (res === 0) {
      ctx.status = 400
      ctx.body = response(null, '点赞评论失败,请勿重复点赞', 400)
    } else {
      ctx.body = response(null, '点赞评论成功!')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}
```



### 10.取消点赞评论 （token）

   1.通过cid查询评论是否存在

  2.通过cid和uid查询用户是否点赞过评论

  3.未点赞则不能取消点赞评论 点赞过删除点赞评论的记录

#### model

同上

#### service

```ts
  /**
 * 取消点赞评论
 * 1.通过cid查询评论是否存在
 * 2.通过cid和uid查询用户是否点赞过评论
 * 3.未点赞则不能取消点赞评论 点赞过则删除记录
 * @param cid 
 * @param uid 
 * @returns -1:评论不存在 0:未点赞过评论 1:取消点赞成功
 */
  async cancelLikeComment(cid: number, uid: number) {
    try {
      // 1.通过cid来查询评论是否存在
      const [comment] = await article.selectInCommentTableByCid(cid)
      if (comment === undefined) {
        // 评论不存在
        return Promise.resolve(-1)
      } else {
        // 评论存在
        // 2.查询用户是否点赞过评论
        const resExist = await article.selectInLikeCommentTableByCidAndUid(cid, uid)
        if (resExist.length) {
          // 点赞过 则删除点赞记录
          await article.deleteInLikeCommentTableByCidAndUid(cid, uid)
          return Promise.resolve(1)
        } else {
          // 未点赞过 则不能取消点赞
          return Promise.resolve(0)
        }
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

```

#### controller

```ts
/**
 * 取消点赞评论
 * @param ctx 
 * @returns 
 */
async function toCancelLikeComment(ctx: Context) {
  const token = ctx.state.user as Token;

  // 检验评论id参数
  if (ctx.query.cid === undefined) { ctx.status = 400; return ctx.body = response(null, '参数未携带!', 400) }

  const cid = + ctx.query.cid
  if (isNaN(cid)) { ctx.status = 400; return ctx.body = response(null, '参数非法!', 400) }

  try {
    const res = await articleService.cancelLikeComment(cid, token.uid)
    if (res === -1) {
      ctx.status = 400
      ctx.body = response(null, '取消点赞评论失败,评论不存在!', 400)
    } else if (res === 0) {
      ctx.status = 400
      ctx.body = response(null, '取消点赞评论失败,还未点赞过评论!', 400)
    } else {
      ctx.body = response(null, '取消点赞评论成功!')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}
```



### 11.删除帖子 （token）



### 12.浏览帖子的评论

1.传入帖子的aid，先对aid进行非法校验

2.通过aid查询帖子是否存在

3.查询出该帖子的评论总数

4.通过offset和limit查询出分页的评论数据列表

5.遍历评论数据列表需要查询：

​	1.每个评论的创建者

​	2.当前用户对评论创建者的关注状态

​	3.当前评论的点赞总数

​	4.当前用户对该评论的点赞状态

#### model

已声明

#### service

```ts
  /**
   * 查询某个帖子的评论数据 (分页)
   * 1.查询帖子是否存在
   * 2.查询该帖子的评论总数
   * 3.查询某一页的评论列表
   * 4.遍历评论列表 ,获取评论的创建者信息关注状态以及评论点赞的状态以及评论点赞的总数
   * @param aid 
   * @param uid 
   * @param limit 
   * @param offset 
   */
  async getArticleCommentList(aid: number, uid: number | undefined, limit: number, offset: number) {
    try {
      // 1.查询帖子是否存在
      const resExist = await article.selectInArticleTableByAid(aid)
      if (!resExist.length) {
        // 不存在
        return Promise.resolve(0)
      }
      // 2.存在则通过aid查询该帖子的评论总数
      const [count] = await article.countInCommentTableByAid(aid)
      // 3.查询当前页的评论列表
      const commentList = await article.selectInCommentTableByAidLimit(aid, limit, offset)
      // 4.遍历评论列表,查询相关数据
      const resList: CommentItem[] = []
      for (let i = 0; i < commentList.length; i++) {
        // 4.1 查询用户数据
        const [userInfo] = await user.selectByUid(commentList[i].uid)
        // 4.2查询当前登录的用户对该评论创建者的关注状态
        const isFollowed = uid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, commentList[i].uid)).length ? true : false
        // 4.3查询当前登录的用户对该评论的点赞状态
        const isLiked = uid === undefined ? false : (await article.selectInLikeCommentTableByCidAndUid(commentList[i].cid, uid)).length ? true : false
        // 4.4查询当前评论的点赞总数
        const [count] = await article.countInLikeCommentTabeByCid(commentList[i].cid)
        resList.push({
          ...commentList[i],
          user: { ...userInfo, is_followed: isFollowed },
          is_liked: isLiked,
          like_count: count.total
        })
      }

      return Promise.resolve({
        list: resList,
        total: count.total,
        offset,
        limit,
        has_more: count.total > limit * offset + limit
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
```

#### controller层

```ts

/**
 * 获取帖子的评论 分页数据
 * @param ctx 
 */
async function getArticleCommentList(ctx: Context) {

  // 根据是否携带token来获取当前登录的用户id
  const uid = ctx.header.authorization ? (ctx.state.user as Token).uid : undefined

  // 检验查询参数
  if (ctx.query.aid === undefined) { ctx.status = 400; return ctx.body = response(null, '参数未携带!', 400) }
  const aid = + ctx.query.aid
  const offset = ctx.query.offset === undefined ? 0 : +ctx.query.offset;
  const limit = ctx.query.limit === undefined ? 20 : +ctx.query.limit;
  if (isNaN(aid) || isNaN(offset) || isNaN(limit)) {
    ctx.status = 400;
    return ctx.body = response(null, '参数非法!', 400)
  }

  try {
    const res = await articleService.getArticleCommentList(aid, uid, limit, offset)
    if (res === 0) {
      ctx.status = 400;
      ctx.body = response(null, '获取评论失败,帖子不存在!', 400)
    } else {
      ctx.body = response(res, 'ok')
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    ctx.body = response(null, '服务器出错了!', 500)
  }

}
```



### 13.浏览帖子列表



## 四、公共接口

### 1.文件上传 （需要token）

​	文件上传通过公共的路由来进行上传，上传后直接将图片直接挂载到本地，通过koa-staic将静态资源挂载到服务器上，服务器响应图片资源的url地址给客户端即可。

#### controller层

```ts
// 类型
import type { Context } from "koa"
// 工具函数
import response from "../../utils/tools/response"

/**
 * 上传图片 form-data中对应图片的值image
 * @param ctx 
 */
async function imageLoad(ctx: Context) {
    const file = ctx.request.files
    console.log(file)
    if (file) {
        ctx.body = response(ctx.origin + '/img/' + (file.image as any).newFilename, '文件上传成功!', 200)
    } else {
        ctx.status = 400;
        ctx.body = response(null, '文件未携带!', 400)
    }
}

export default {
    imageLoad
}
```

#### router层

```ts
import Router from "koa-router";
import koaBody from "koa-body";
import FileController from '../../controller/file'

// 文件上传路由
const fileRouter = new Router()
// 文件上传的根路径
const baseRouterURL = '/file'

// 文件上传的全局中间件 koaBody解析文件上传
fileRouter.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: 'static/img', // 设置文件上传目录
        keepExtensions: true,    // 保持文件的后缀
        maxFieldsSize: 10 * 1024 * 1024, // 文件上传大小 为 10MB
    }
}))

// 图片上传的路由
fileRouter.post('file', `${baseRouterURL}/image`, FileController.imageLoad)


export default fileRouter
```

项目结构

![image-20230530145817780](C:\Users\Dell\AppData\Roaming\Typora\typora-user-images\image-20230530145817780.png)





## 五、路由白名单

​	不需要token验证的路由：

​	1.查询用户：/user/query

​	2.注册用户：/user/register

​	3.用户登录：/user/login

​	4.所有的吧: /bar/all

​	5.获取吧数据:/bar/info （隐式解析token）

​	6.获取用户关注的吧（隐式解析token）

​	7.获取关注该吧的人（隐式解析token）

​	 8.帖子详情数据（隐式解析token）



## 六、中间件

### 1.全局解析token的中间件

```ts
import type { Next, Context } from "koa";
import jwt from 'jsonwebtoken'
import { SECRET_KEY, NO_AUTH } from '../../config'
import response from '../../utils/tools/response'

/**
 * 检验token的中间件
 * @param ctx 
 * @param next 
 */
export default async function authorizationCatcher (ctx: Context, next: Next) {
    // No_Auth为路由白名单数组
    if (NO_AUTH.includes(ctx.path)) {
        // 路由白名单
        await next()
    } else {
        // 需要检验token的
        try {
            if (!ctx.header.authorization) {
                // 未携带token
                ctx.status = 401;
                ctx.body = response(null, '未携带 token', 400)
            } else {
                // 携带了token需要进行验证 (需要先格式化token，把Bearer 截取掉)
                const tokenFormat = ctx.header.authorization.split(' ')[ 1 ]
                // 解析token中的数据
                const data = await new Promise((resolve, rejected) => {
                    jwt.verify(tokenFormat, SECRET_KEY, function (err, decoded) {
                        if (err) {
                            console.log(JSON.stringify(err))
                            // token解析失败
                            if (err.message === "invalid signature") {
                                // 无效的token
                                rejected(2)
                            } else if (err.message === "jwt expired") {
                                // token过期
                                rejected(1)
                            }
                        } else {
                            // token解析成功
                            resolve(decoded)
                        }
                    })
                })
                // 解析成功 （保存在上下文中）
                ctx.state.user = data
                await next()
            }
        } catch (err) {
            
            if (err === 1) {
                // token过期
                ctx.status = 401;
                ctx.body = response(null, 'token过期,请重新登陆', 400)
            } else if (err === 2) {
                // 无效的token
                ctx.status = 401;
                ctx.body = response(null, '无效的token', 400)
            } else {
                ctx.status = 500;
                ctx.body = response(null, '其他错误', 500)
            }
        }

    }
}

```



## 七、quest

### 1.分页逻辑优化（待定）

	1.	分页逻辑需要考虑用户请求的页数超过了记录的数量？
 	2.	分页接口还需要返回has_more字段来提示前端是否还需要继续请求数据，很简单，若offset>=total-1,offset从0开始，则返回说明没有更多了

### 2.帖子配图和评论配图

​	帖子和评论的配图为photo字段，最开始设计的是只能上传一张图片。

​	我觉得可以这样：

​	1.若上传帖子或评论时为多张图片，前端传入图片资源的字符串数组，后端只需要把数组转为字符串保存在数据库里面。当前端访问帖子或评论接口时只需要把字符串转为数组即可。

​	2.若上传帖子或评论时为一张图片，前端传入对应资源地址的字符串，后端直接保存该字符串即可。

​	3.若上传帖子或评论时无图片，则保存null。

​	4.但是这样需要注意了，在上传图片的时候，文件名称不能出现逗号，否则解析时会出现意外的解析方式

### 3.吧等级制度

​	包含签到和等级制度（吧自定义等级制度）

#### 1.签到(包含两个触发器和一个事件)

​	用户只要关注吧，就需要在签到表中插入用户签到吧的记录状态（uid，bid，is_checked,score），当用户取消关注吧的时候需要级联删除或手动删除或者使用触发器删除掉该记录，每天凌晨重置所有用户的签到状态，每签到一次，score+5。

##### 	关注和取消关注时，用触发器级联删除签到表中的对应记录

​	对于用户关注吧时，在签到表中插入记录我使用触发器(触发器要稳妥得多，而且可以少些很多代码)来进行插入记录，取消关注时，同样也是通过触发器来删除对应记录。

​	由于我们是在关注吧的时候需要在签到表中插入用户签到吧的记录，所以选择触发器after后执行对应的sql操作，其中new为更新或插入时的元组，old为删除时的对应元组。在取消关注时通过使用触发器在签到表中删除对应用户与吧的签到信息记录。

<img src="data:image/png;base64,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">

##### 	凌晨重置签到状态

​	凌晨时，重置is_checked=1的用户，使用mysql事件来实现。

```shell
mysql> CREATE EVENT `tie_bar_lower`.`reset_user_checked_bar`
ON SCHEDULE
EVERY '1' MINUTE STARTS '2023-07-01 00:00:00'  // 每分钟重置签到状态为未签到
DO update user_check_bar set is_checked=0 where is_checked=1;
```



#### 2.吧等级制度（两个触发器）

​	吧等级制度，吧等级制度需要创建一张表来保存，（bid,rank_JSON)，rank_JSON用来保存吧各个等级的数据，以json字符串的方式来存储，吧主只能设置每个吧等级的label。吧等级制度的默认值为以下：

```json
[
  {
    "label": "初出茅庐",
    "level": 1,
    "score": 0
  },
  {
    "label": "初级粉丝",
    "level": 2,
    "score": 15
  },
  {
    "label": "中级粉丝",
    "level": 3,
    "score": 40
  },
  {
    "label": "高级粉丝",
    "level": 4,
    "score": 100
  },
  {
    "label": "活跃吧友",
    "level": 5,
    "score": 200
  },
  {
    "label": "核心吧友",
    "level": 6,
    "score": 400
  },
  {
    "label": "铁杆吧友",
    "level": 7,
    "score": 600
  },
  {
    "label": "知名人士",
    "level": 8,
    "score": 1000
  },
  {
    "label": "人气楷模",
    "level": 9,
    "score": 1500
  },
  {
    "label": "黄牌指导",
    "level": 10,
    "score": 2000
  },
  {
    "label": "意见领袖",
    "level": 11,
    "score": 3000
  },
  {
    "label": "意见领袖",
    "level": 12,
    "score": 6000
  },
  {
    "label": "意见领袖",
    "level": 13,
    "score": 10000
  },
  {
    "label": "意见领袖",
    "level": 14,
    "score": 14000
  },
  {
    "label": "意见领袖",
    "level": 15,
    "score": 20000
  }
]
```

​	在帖子详情中，评论项中，回复项中需要显示用户在对应吧中的等级，可以先查询用户在这个吧的签到分数，然后再获取这个吧的等级制度json，解析后获取对应制度约束，来计算出用户当前的等级，若用户未关注此吧，则返回0级，头衔昵称为绿牌页友。

​	**相关被修改的接口：**帖子详情、文章的评论列表（热评和时间两个service层）、回复列表、搜索评论、发现热门评论接口

  吧表也需要一个触发器，当创建吧时，自动向吧等级制度表中插入默认的吧等级制度，删除吧的时候也需要自动级联删除掉对应吧记录

  1.增加吧的触发器

​	在吧等级中增加表记录即可

```sql
BEGIN
	INSERT into bar_rank values (new.bid,'[{"label":"初出茅庐","level":1,"score":0},{"label":"初级粉丝","level":2,"score":15},{"label":"中级粉丝","level":3,"score":40},{"label":"高级粉丝","level":4,"score":100},{"label":"活跃吧友","level":5,"score":200},{"label":"核心吧友","level":6,"score":400},{"label":"铁杆吧友","level":7,"score":600},{"label":"知名人士","level":8,"score":1000},{"label":"人气楷模","level":9,"score":1500},{"label":"黄牌指导","level":10,"score":2000},{"label":"意见领袖","level":11,"score":3000},{"label":"意见领袖","level":12,"score":6000},{"label":"意见领袖","level":13,"score":10000},{"label":"意见领袖","level":14,"score":14000},{"label":"意见领袖","level":15,"score":20000}]');
end
```

2.删除吧的触发器

​	对应删除吧等级即可

```sql
BEGIN
	DELETE from user_check_bar where bid=old.bid;
END
```

<img src="data:image/png;base64,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">

## 零、time

### 1、5.30

​	是5.29号写的

![image-20230530222216442](C:\Users\Dell\AppData\Roaming\Typora\typora-user-images\image-20230530222216442.png)