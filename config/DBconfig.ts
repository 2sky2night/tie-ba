import type { PoolOptions } from 'mysql2'

/**
 * 连接数据库的配置项
 */
const databaseConfig: PoolOptions = {
    database: 'tie_ba',
    user: 'root',
    password: '1234',
    port: 3306,
    host: '127.0.0.1'
}

export default databaseConfig