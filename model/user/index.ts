// 基础模型
import BaseModel from "../base"
// 类型
import type { User, UserBody } from "./types"
import type { OkPacket } from 'mysql'
// 工具函数
import { getNowTimeString } from '../../utils/tools/time'

/**
 * 用户模型
 */
class UserModel extends BaseModel {
    /**
     * 根据用户名查询全匹配 (返回用户所有的信息 测试用)
     * @param username 用户名称
     */
    async selectByUsername(username: string) {
        try {
            const res = await this.runSql<User[]>(`select * from user where username='${username}';`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
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
    /**
     * 在表中插入一条记录
     * @param data 
     * @returns 
     */
    async insertUser(data: UserBody) {
        try {
            const res = await this.runSql<OkPacket>(`INSERT INTO user (username, password, createTime) VALUES ('${data.username}', '${data.password}', '${getNowTimeString()}');`)
            if (res.affectedRows) {
                return Promise.resolve('ok')
            }
            await Promise.reject()
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 通过用户名查询出用户数据 (不包含密码和状态信息)
     */
    async selectDataByUsername(username: string) {
        try {
            const res = await this.runSql<User[]>(`select uid,username,createTime,avatar from user where username='${username}';`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
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
}


export default UserModel

