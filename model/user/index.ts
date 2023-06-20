// 基础模型
import BaseModel from "../base"
// 类型
import type { User, UserBody, UserFollow, UserWithout } from "./types"
import type { OkPacket } from 'mysql'
import type { Count, CountRes } from "../../types"
// 工具函数
import { getDaysBeforeTimeString, getNowTimeString, getTimeString } from '../../utils/tools/time'

/**
 * 在某个表用 in
 * 查询某个字段用 by
 */


/**
 * 用户模型
 */
class UserModel extends BaseModel {
    /**
     * 在用户表中根据用户名查询全匹配 (返回用户所有的信息 测试用)
     * @param username 用户名称
     */
    async selectByUsername (username: string): Promise<User[]> {
        try {
            const res = await this.runSql<User[]>(`select * from user where username='${ username }';`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户表中通过用户名和密码检查用户是否匹配成功
     * @param username  用户名
     * @param password 密码
     * @returns 
     */
    async selectByUsernameAndPassword (username: string, password: string): Promise<User[]> {
        try {
            const res = await this.runSql<User[]>(`select * from user where username='${ username }' and password='${ password }';`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户表中 通过用户名模糊匹配搜索用户
     * @param keywords 关键字
     * @param limit 返回多少条数据
     * @param offset 从多少偏移量获取数据
     * @param desc 根据创建时间升序或降序
     * @returns 
     */
    async searchInUserTableByUsername (keywords: string, limit: number, offset: number, desc: boolean) {
        try {
            const res = await this.runSql<UserWithout[]>(`SELECT uid,username,createTime,avatar FROM user where username like '%${ keywords }%' ORDER BY createTime ${ desc ? 'desc' : 'asc' } LIMIT ${ limit } OFFSET ${ offset }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户表中 通过用户名模糊匹配搜索用户总数
     * @param keywords 
     * @returns 
     */
    async countSearchInUserTableByUsername (keywords: string) {
        try {
            const res = await this.runSql<CountRes>(`select count(*) as total from user where  username like '%${ keywords }%'`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户表中 通过帖子表查询最近发帖的关注用户
     * @param uid 当前用户
     * @param day 多少天前
     * @returns 
     */
    async discoverUser (uid:number,day:number) {
        try {
            const sqlString = `select user.uid,user.username,user.createTime,user.avatar from user,(select uid_is_followed from user_follow_user where uid = ${uid} and uid_is_followed in (select DISTINCT uid from article where  createTime BETWEEN '${getDaysBeforeTimeString(day)}' and '${getTimeString(new Date())}' ORDER BY uid)) as temp where user.uid=temp.uid_is_followed`
            const res = await this.runSql<UserWithout[]>(sqlString)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户表中插入一条记录
     * @param data 
     * @returns 
     */
    async insertUser (data: UserBody) {
        try {
            const res = await this.runSql<OkPacket>(`INSERT INTO user (username, password, createTime) VALUES ('${ data.username }', '${ data.password }', '${ getNowTimeString() }');`)
            if (res.affectedRows) {
                return Promise.resolve('ok')
            } else {
                await Promise.reject('创建用户失败')
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户表中通过用户名查询出用户数据 (不包含密码和状态信息)
     */
    async selectDataByUsername (username: string): Promise<UserWithout[]> {
        try {
            const res = await this.runSql<UserWithout[]>(`select uid,username,createTime,avatar from user where username='${ username }';`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户表中通过用户id来查找用户数据
     * @param uid 用户的id
     * @returns 
     */
    async selectByUid (uid: number): Promise<UserWithout[]> {
        try {
            const res = await this.runSql<UserWithout[]>(`select uid,username,createTime,avatar from user where uid=${ uid }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
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
                await Promise.reject('插入用户关注记录失败')
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
                await Promise.reject('删除用户关注记录失败')
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户关注表中 通过uid来查询记录关注列表    (分页数据)
     * @param uid 关注者的id
     * @param limit 需要查询多少条记录
     * @param offset 从第几条数据开始查询数据
     * @param desc 是否按照关注时间降序排序
     * @returns 
     */
    async selectByUidScopedFollowLimit (uid: number, limit: number, offset: number, desc: boolean) {
        try {
            const res = await this.runSql<UserFollow[]>(`SELECT * FROM user_follow_user where uid=${ uid } ORDER BY createTime ${ desc ? 'desc' : 'asc' } limit ${ limit } OFFSET ${ offset }`)
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
    async selectByUidScopedFollowCount (uid: number) {
        try {
            const res = await this.runSql<CountRes>(`SELECT COUNT(*) as total FROM user_follow_user where uid=${ uid };`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }

    /**
    * 在用户关注表中 通过uid_is_followed来查询记录粉丝列表    (分页数据)
 * @param uidIsFollowed 被关注者的id
 * @param limit 需要查询多少条记录
 * @param offset 从第几条数据开始查询数据
 * @param desc 是否按照关注的时间降序或升序
 * @returns 
 */
    async selectByUidFollowedScopedFollowLimit (uidIsFollowed: number, limit: number, offset: number, desc: boolean) {
        try {
            const res = await this.runSql<UserFollow[]>(`SELECT * FROM user_follow_user where uid_is_followed=${ uidIsFollowed } ORDER BY createTime ${ desc ? 'desc' : 'asc' } limit ${ limit } OFFSET ${ offset }`)
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
    async selectByUidFollowedScopedFollowCount (uidIsFollowed: number) {
        try {
            const res = await this.runSql<CountRes>(`SELECT COUNT(*) as total FROM user_follow_user where uid_is_followed=${ uidIsFollowed };`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户表中 更新用户信息
     * @param uid 用户id
     * @param username 用户名
     * @param avatar 头像
     * @returns 
     */
    async updateInUserTableByUid (uid: number, username: string, avatar: string) {
        try {
            const res = await this.runSql<OkPacket>(`UPDATE user SET username = '${ username }', avatar='${ avatar }'  WHERE uid = ${ uid }`)
            if (res.affectedRows) {
                return Promise.resolve('ok')
            } else {
                await Promise.reject('更新用户信息失败')
            }
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户表中 更新用户密码
     * @param uid 用户名
     * @param password 密码
     * @returns 
     */
    async updateInUserTableByUidWithPassword (uid: number, password: string) {
        try {
            const res = await this.runSql<OkPacket>(`UPDATE user SET password = '${ password }' WHERE uid = ${ uid }`)
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
    async selectInUserTableByUid (uid: number) {
        try {
            const res = await this.runSql<User[]>(`select * from user where uid=${ uid }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户表和用户关注表中 通过uid和keywords搜索用户的关注列表,通过username进行模糊匹配 (分页限制)
     * @param uid 用户id
     * @param keywords 用户名的关键字
     * @param limit 多少条数据
     * @param offset 从多少偏移量开始
     */
    async searchUserFollowByUsername (uid: number, keywords: string, limit: number, offset: number) {
        try {
            const res = await this.runSql<User[]>(`select * from user where uid in (select uid_is_followed from user_follow_user where uid=${ uid }) and username like '%${ keywords }%' limit ${ limit } OFFSET ${ offset }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户表和用户关注表中 通过uid和keywords搜索用户的关注列表总数 (搜索依据以username进行模糊匹配)
     * @param uid 用户id
     * @param keywords 关键字
     * @returns 
     */
    async countSearchUserFollowByUsername (uid: number, keywords: string) {
        try {
            const res = await this.runSql<CountRes>(`select count(*) as total from user where uid in (select uid_is_followed from user_follow_user where uid=${ uid }) and username like '%${ keywords }%' `)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户表和用户关注表中 通过uid和keywords 搜索用户粉丝列表 搜索依据为用户的名称进行模糊匹配 (分页限制)
     * @param uid 用户id
     * @param keywords 用户名的关键字
     * @param limit  多少条数据
     * @param offset 从多少偏移量开始
     * @returns 
     */
    async searchUserFansByUsername (uid: number, keywords: string, limit: number, offset: number) {
        try {
            const res = await this.runSql<User[]>(`select * from user where uid in (select uid from user_follow_user where uid_is_followed=${ uid }) and username like '%${ keywords }%' limit ${ limit } OFFSET ${ offset }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     *  在用户表和用户关注表中 通过uid和keywords 搜索用户粉丝列表总数 (搜索依据以username进行模糊匹配)
     * @param uid 用户id
     * @param keywords 关键词
     * @returns 
     */
    async countSearchUserFansByUsername (uid: number, keywords: string) {
        try {
            const res = await this.runSql<CountRes>(`select count(*) as total from user where uid in (select uid from user_follow_user where  uid_is_followed=${ uid }) and username like '%${ keywords }%' `)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
}


export default UserModel

