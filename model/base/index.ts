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
    async runSql<T = any>(sqlString: string): Promise<T> {
        // 创建连接
        this.createConnection()
        // 连接数据库
        await this.connect()
        // 查询
        // 打印sql语句
        console.log(sqlString)
        return new Promise((resolve, reject) => {
            this.pool.query(sqlString, (err, res) => {
                if (err) {
                    reject('查询失败')
                    console.log(err)
                } else {
                    // 打印sql查询结果
                    // console.log(res)
                    resolve(res)
                }
                //  查询无论成功与否都关闭数据库的连接 节约服务器资源
                this.end()
            })
        })
    }
}


export default BaseModel