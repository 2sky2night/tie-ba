/**
 * 当前时间的字符串 YYYY:MM:DD HH:MM:SS
 * @returns 
 */
export function getNowTimeString () {
    return new Date().toLocaleString().replace('/', '-').replace('/', '-')
}

/**
 * 根据当前时间返回x天前的日期字符串 YYYY:MM:DD
 */
export function getDaysBeforeTimeString (day: number) {
    // 当前时间的时间戳
    const time = Date.now()
    // 计算出x天前的时间戳
    return getTimeString(new Date(time - day * 24 * 60 * 60 * 1000))
}

/**
 * 获取传入时间转换成的字符串 YYYY:MM:DD
 * @param date 时间
 * @returns 
 */
export function getTimeString (date: Date) {
    // 由于日期型的特殊性质 2022-06-20>>2022-06-21 才算六月二十日这一天 所以需要给当前时间+1天
    const time = new Date(date.getTime() + 24 * 60 * 60 * 1000)
    return time.toLocaleString().split(' ')[ 0 ].replace('/', '-').replace('/', '-')
}