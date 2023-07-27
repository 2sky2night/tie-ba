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

#### 1.签到

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



#### 2.吧等级制度

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

​	在帖子详情中，评论项中，回复项中需要显示用户在对应吧中的等级，可以先查询用户在这个吧的签到分数，然后再获取这个吧的等级制度json，解析后获取对应制度约束，来计算出用户当前的等级。
  吧表也需要一个触发器，当创建吧时，自动向吧等级制度表中插入默认的吧等级制度。

  <img src="data:image/png;base64,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">


## 零、time

### 1、5.30

​	是5.29号写的

![image-20230530222216442](C:\Users\Dell\AppData\Roaming\Typora\typora-user-images\image-20230530222216442.png)