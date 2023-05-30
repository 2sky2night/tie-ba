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
            const res = await this.runSql<OkPacket>(`insert into bar (bname,createTime,uid) values ('${data.bname}','${getNowTimeString()}',${data.uid})`)
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

