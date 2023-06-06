// 基础模型
import BaseModel from "../base"
// 类型
import type { User, UserBody, UserFollow, UserWithout } from "./types"
import type { OkPacket } from 'mysql'
// 工具函数
import { getNowTimeString } from '../../utils/tools/time'

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
                await Promise.reject()
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
}


export default UserModel

