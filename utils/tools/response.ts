/**
 * 响应内容
 * @param data 
 * @param message 
 * @param code 
 * @returns 
 */
export default function response (data: any, message: string, code: number = 200) {
    return {
        data,
        message,
        code
    }
}

/**
 * 参数未携带错误
 * @param data 结果
 * @param message 响应消息
 */
export function paramNotCarry (data: any = null, message: string = '参数未携带!') {
    return response(data, message, 400)
}

/**
 * 参数错误
 */
export function paramError (data: any = null, message: string = '参数错误!') {
    return response(data, message, 400)
}