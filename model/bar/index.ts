// 基础模型
import BaseModel from '../base'
// 类型
import type { Bar, BarCreateBody, UserFollowBarItem,UserCheckBar,BarRank } from './types'
import type { OkPacket } from 'mysql'
import type { CountRes } from '../../types/index'
// 工具函数
import { getDaysBeforeTimeString, getNowTimeString, getTimeString } from '../../utils/tools/time'


/**
 * 在某个表用 in
 * 查询某个字段用 by
 */


/**
 * 吧模型
 */
class BarModel extends BaseModel {
    /**
     * 在吧表中插入一条吧的数据
     * @param data 
     */
    async insertBar (data: BarCreateBody) {
        try {
            const res = await this.runSql<OkPacket>(`insert into bar (bname,createTime,uid,bdesc,photo) values ('${ data.bname }','${ getNowTimeString() }',${ data.uid },'${ data.bdesc }','${ data.photo }')`)
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
     * 在吧表中 通过uid来查询用户创建的吧数量
     * @param uid 用户id
     * @returns 
     */
    async countInBarTableByUid (uid: number) {
        try {
            const res = await this.runSql<CountRes>(`select count(*) as total from bar where uid=${ uid }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在吧表中通过吧的名称来查询吧
     * @param bname 吧的名称
     * @returns 查询结果
     */
    async selectByBname (bname: string) {
        try {
            const res = await this.runSql<Bar[]>(`select * from bar where bname='${ bname }'`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在吧表中查询当前所有的吧
     * @returns 
     */
    async selectAllBar () {
        try {
            const res = await this.runSql<Bar[]>('select * from bar')
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在吧表中根据吧的id查询吧的信息
     * @param bid 
     * @returns 
     */
    async selectByBid (bid: number) {
        try {
            const res = await this.runSql<Bar[]>(`select * from bar where bid=${ bid }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在吧表中 查询用户创建的吧 （分页限制）
     * @param uid 用户id
     * @param limit 返回多少条数据
     * @param offset 从多少偏移量开始
     * @param desc 根据创建时间倒序或升序排序
     * @returns 
     */
    async selectInBarTableByUidLimit (uid: number, limit: number, offset: number, desc: boolean) {
        try {
            const res = await this.runSql<Bar[]>(`select * from bar where uid=${ uid } order by createTime ${ desc ? 'desc' : 'asc' } limit ${ limit } offset ${ offset }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在吧表中 查询当前吧的总数
     * @returns 
     */
    async countInBarTable () {
        try {
            const res = await this.runSql<CountRes>('select count(*) as total from bar')
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在吧表中 浏览所有吧 （分页限制）
     * @param limit 返回多少条数据
     * @param offset 从多少偏移量开始
     * @param desc 根据创建时间倒序或升序排序
     * @returns 
     */
    async selectInBarTableLimit (limit: number, offset: number, desc: boolean) {
        try {
            const res = await this.runSql<Bar[]>(`select * from bar order by createTime ${ desc ? 'desc' : 'asc' } limit ${ limit } offset ${ offset }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在吧表中 查询热门的吧 根据最近x天发帖数量进行排序
     * @param day 天数
     * @param limit 返回多少条数据
     * @param offset 偏移量
     * @returns 
     */
    async findHotBar (day: number, limit: number, offset: number) {
        try {
            const sqlString = `select bar.* from bar,(select count(*) as total,bid from article where createTime BETWEEN '${ getDaysBeforeTimeString(day) }' and '${ getTimeString(new Date()) }' GROUP BY bid ) as temp where bar.bid=temp.bid ORDER BY total desc limit ${ limit } offset ${ offset }`
            const res = await this.runSql<Bar[]>(sqlString)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在吧表中 查询热门的吧,根据最近x天发帖数量进行排序，获取列表总数
     * @param day 天数
     * @returns 
     */
    async countFindHotBar (day: number) {
        try {
            const sqlString = `select count(*) as total from bar,(select count(*) as total,bid from article where createTime BETWEEN '${ getDaysBeforeTimeString(day) }' and '${ getTimeString(new Date()) }' GROUP BY bid ) as temp where bar.bid=temp.bid`
            const res = await this.runSql<CountRes>(sqlString)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在吧表中 通过吧名模糊搜索吧
     * @param keywords 关键词
     * @param limit 返回多少条数据
     * @param offset 从多少偏移量开始
     * @param desc 根据创建时间倒序或升序排序
     * @returns 
     */
    async searchInBarTableByBname (keywords: string, limit: number, offset: number, desc: boolean) {
        try {
            const res = await this.runSql<Bar[]>(`select * from bar where bname like '%${ keywords }%' order by createTime ${ desc ? 'desc' : 'asc' } limit ${ limit } offset ${ offset }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在吧表中 通过吧名来模糊搜索匹配的所有吧数量
     * @param keywords 关键词
     * @returns 
     */
    async countSearchInBarTableByBname (keywords: string) {
        try {
            const res = await this.runSql<CountRes>(`select count(*) as total from bar where bname like '%${ keywords }%'`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户关注吧表中插入一条记录
     * @param bid 吧的id
     * @param uid 用户的id
     * @returns 
     */
    async insertFollow (bid: number, uid: number) {
        try {
            const res = await this.runSql<OkPacket>(`INSERT INTO user_follow_bar (uid, bid, createTime) VALUES (${ uid }, ${ bid }, '${ getNowTimeString() }')`)
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
     * 在用户关注吧表中查询用户是否关注了当前吧
     * @param bid 吧的id
     * @param uid 用户的id
     */
    async selectFollowByUidAndBid (bid: number, uid: number) {
        try {
            const res = await this.runSql<UserFollowBarItem[]>(`select * from user_follow_bar where bid=${ bid } and uid=${ uid }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }

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
    /**
     * 在用户关注吧表中 通过吧bid查询有多少个用户关注了该吧
     * @param bid 吧id
     * @returns 
     */
    async selectFollowByBidCount (bid: number) {
        try {
            const res = await this.runSql<CountRes>(`SELECT count(*) as total FROM user_follow_bar where bid=${ bid } `)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户关注吧表中 通过bid来查询关注该吧的列表
     * @param bid 吧id
     * @param limit 查询多少条数据?
     * @param offset 偏移量多少开始查询数据
     * @param desc 倒序还是升序
     * @returns 
     */
    async selectFollowByBidLimit (bid: number, limit: number, offset: number, desc: boolean) {
        try {
            const res = await this.runSql<UserFollowBarItem[]>(`SELECT * FROM user_follow_bar where bid=${ bid } order by createTime ${ desc ? 'desc' : 'asc' } limit ${ limit } offset ${ offset }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
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
     * @param desc 降序或升序
     * @returns 
     */
    async selectFollowByUidLimit (uid: number, limit: number, offset: number, desc: boolean) {
        try {
            const res = await this.runSql<UserFollowBarItem[]>(`SELECT * FROM user_follow_bar where uid=${ uid } order by createTime ${ desc ? 'desc' : 'asc' } limit ${ limit } offset ${ offset }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 查询用户关注的吧 分页
     * @param uid 用户id
     * @param limit 查询多少条数据?
     * @param offset 偏移量多少开始查询数据
     * @param desc 降序或升序
     */
    async findUserFollowBarLimit (uid: number, limit: number, offset: number, desc: boolean) {
        try {
            const res = await this.runSql<Bar[]>(`select * from bar where bid in (select bid from user_follow_bar where uid=${ uid }) order by createTime ${desc?'desc':'asc'} limit ${limit} offset ${offset}`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    /**
     * 在用户签到表中 查询用户签到吧的信息
     * @param uid 用户id
     * @param bid 吧id
     */
    async selectInUserCheckBarTableByUidAndBid (uid:number,bid:number) {
        try {
            const res = await this.runSql<UserCheckBar[]>(`select * from user_check_bar where uid=${ uid } and bid=${ bid }`)
            return Promise.resolve(res)
        } catch (error) {
            return Promise.reject(error)
        }
    }
    async updateUserCheckBarTable (uid: number, bid: number, score: number) {
        
    }
    /**
     * 在吧等级制度表中 通过bid查询对应吧的等级制度信息
     * @param bid 
     */
    async selectInBarRankTableByBid (bid: number) {
     try {
         const res = await this.runSql<BarRank[]>(`select * from bar_rank where bid=${ bid }`)
         return Promise.resolve(res)
     } catch (error) {
        return Promise.reject(error)
     }   
    }
}

export default BarModel

