/**
 * 当前时间的字符串 YYYY:MM:DD HH:MM:SS
 * @returns 
 */
export function getNowTimeString() {
    return new Date().toLocaleString().replace('/', '-').replace('/', '-')
}