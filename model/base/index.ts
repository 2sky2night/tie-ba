import mysql from 'mysql2';
import DBconfig from '../../config/DBconfig';

/**
 * 公共模型
 */
class BaseModel {
    pool: mysql.Pool;

    constructor() {
        this.createPool();
    }

    /**
     * 创建连接池
     */
    createPool() {
        this.pool = mysql.createPool(DBconfig);
    }

    /**
     * 连接数据库
     */
    // connect() {
    //     return new Promise((resolve, reject) => {
    //         this.pool.getConnection((err, connection) => {
    //             if (err) {
    //                 // 连接数据库失败
    //                 reject('连接数据库失败');
    //                 console.log(err);
    //             } else {
    //                 resolve('ok');
    //                 // Release the connection back to the pool after completing the query
    //                 connection.release();
    //             }
    //         });
    //     });
    // }

    /**
     * 封装公共的 SQL 方法
     */
    async runSql<T = any>(sqlString: string): Promise<T> {
        // 连接数据库
        // await this.connect();

        // 查询
        return new Promise((resolve, reject) => {
            this.pool.query(sqlString, (err, res:any) => {
                if (err) {
                    reject('查询失败');
                    console.log(err);
                } else {
                    // 打印 SQL 查询结果
                    console.log(`${sqlString}:${JSON.stringify(res)}`);
                    resolve(res);
                }
            });
        });
    }
}

export default BaseModel;