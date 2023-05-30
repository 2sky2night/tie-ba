import type { ConnectionConfig } from 'mysql'

/**
 * 连接数据库的配置项
 */
const databaseConfig: ConnectionConfig = {
    database: 'tie_bar_lower',
    user: 'root',
    password: '1234',
    port: 3306,
    host: '127.0.0.1'
}

export default databaseConfig