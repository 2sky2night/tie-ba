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

​	实体有吧（bid、bname、createTime、photo、bdesc）、用户（uid、username、password、createTime）、帖子（pid、content、createTime、images？）、评论（cid、content、createTime）

​	关系：

​	1.一个用户可以创建多个吧（人--拥有-吧 1对n）

​	2.一个吧可以有多个帖子（吧--拥有--帖子	1对n）

​	3.一个帖子可以有多个评论（帖子--拥有-评论	1对n）

​	4.一个用户可以创建多个帖子（用户--拥有-帖子	1对n）

​	5.一个用户可以创建多个评论 （用户--拥有-评论	1对n）

​	6.一个用户可以点赞多个评论、一个评论也可以被多个用户点赞（用户--点赞--评论	n对n）

​	7.一个用户可以点赞多个帖子、一个帖子也可以被多个用户点赞	（用户--点赞--帖子	n对n）

​	8.一个用户可以关注多个用户，一个用户也可以被多个用户关注 （用户--关注--用户 n对n）

​	数据库ER图如下：

![image-20230605213403951](C:\Users\Dell\AppData\Roaming\Typora\typora-user-images\image-20230605213403951.png)

1.用户表：uid、username、password、createTime

2.评论表：cid、content、createTime、pid、uid

3.评论点赞表：cid、pid、createTime

4.帖子表：pid、content、images？、createTime、bid、pid

5.帖子点赞表：pid、uid、createTime

6.吧表：bid、bname、createTime、uid

7.关注吧：bid、pid、createTime

8.用户关注表: uid_is_followed（被关注的用户）、uid（关注用户的用户）、createTime

测试

INSERT INTO `tie_bar_lower`.`user`(`username`, `password`, `createTime`) VALUES ('admin', '123456', '2023-05-29 15:28:10')



### 3.项目初始化

​	项目依赖：koa、koa-router（方便写路由和模块化路由）、koa-static（挂载静态资源）、koa-body（解析请求体）、mysql（连接数据库池）

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

### 3.获取用户详情信息（需要验证token）通过id来查找用户

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

### 3.获取吧的详情数据(未完成)

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

### 6.获取吧关注者的列表 (分页)



### 7.获取当前用户关注的吧  (分页)





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

​	5.获取吧数据:/bar/info



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



## 零、time

### 1、5.30

​	是5.29号写的

![image-20230530222216442](C:\Users\Dell\AppData\Roaming\Typora\typora-user-images\image-20230530222216442.png)