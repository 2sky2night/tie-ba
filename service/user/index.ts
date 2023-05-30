// model层
import UserModel from '../../model/user'
// 类型
import type { User, UserBody } from '../../model/user/types'

// 用户模型
const user = new UserModel()

/**
 * 用户service层
 */
class UserService {
    /**
     * 通过用户名查询用户
     * @param username 
     * @returns 用户信息
     */
    async findUserByUsername(username: string) {
        try {
            const res = await user.selectDataByUsername(username)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 创建用户
     * @param data 
     * @returns 0注册失败 1注册成功
     */
    async createUser(data: UserBody): Promise<0 | 1> {
        try {
            // 查询当前需要注册的用户名称是否存在
            const resExist = await user.selectByUsername(data.username)
            if (resExist.length) {
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

    /**
     * 
     * 登录业务
     * @param data 
     * @returns 0:用户名不存在 1:密码错误 用户信息:登录成功
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

export default UserService