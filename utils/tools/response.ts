/**
 * 响应内容
 * @param data 
 * @param message 
 * @param code 
 * @returns 
 */
export default function (data: any, message: string, code: number = 200) {
    return {
        data,
        message,
        code
    }
}