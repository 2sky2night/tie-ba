// 类型
import type { Context } from "koa"
// 工具函数
import response from "../../utils/tools/response"

/**
 * 上传图片 form-data中对应图片的值image
 * @param ctx 
 */
async function toImageLoad (ctx: Context) {
    const file = (ctx.request as any).files
    if (file && file.image) {
        // ctx.body = response(ctx.origin + '/img/' + (file.image as any).newFilename, '文件上传成功!', 200)
        ctx.body = response('/img/' + (file.image as any).newFilename, '文件上传成功!', 200)
    } else {
        ctx.status = 400;
        ctx.body = response(null, '文件未携带!', 400)
    }
}

export default {
    toImageLoad
}