import mysql from 'mysql2';
import DBconfig from '../../config/DBconfig';

/**
 * 公共模型
 */
class BaseModel {
    pool: mysql.Pool;

    constructor () {
        this.createPool();
    }

    /**
     * 创建连接池
     */
    createPool () {
        this.pool = mysql.createPool(DBconfig);
    }

    /**
     * 通过sql字符串直接查询
     * @param sqlString 
     */
    runSql<T = any> (sqlString: string): Promise<T>;
    /**
     * 通过sql占位符查询
     * @param sqlString 
     * @param placeholder 
     */
    runSql<T = any> (sqlString: string, placeholder: (string | number)[]): Promise<T>;
    /**
     * 封装公共的 SQL 方法
     */
    async runSql<T = any> (sqlString: string, placeholder?: (string | number)[]) {
        if (typeof placeholder === 'undefined') {
            // 直接通过sql字符串查询
            return new Promise<T>((resolve, reject) => {
                this.pool.query(sqlString, (err, res) => {
                    if (err) {
                        reject('查询失败!');
                        console.log(err);
                    } else {
                        // 打印 SQL 查询结果
                        console.log(`${ sqlString }:${ JSON.stringify(res) }`);
                        resolve(res as T);
                    }
                });
            });
        } else {
            // 占位符查询
            return new Promise<T>((resolve, reject) => {
                this.pool.query(sqlString, placeholder, (error, result) => {
                    if (error) {
                        reject('查询失败!')
                        console.log(error);
                    } else {
                        // 查询成功
                        console.log(`sql:${ sqlString }----占位符:${ JSON.stringify(placeholder) }----结果:${ JSON.stringify(result) }`);
                        resolve(result as T);
                    }
                })
            })
        }
    }

}
export default BaseModel;