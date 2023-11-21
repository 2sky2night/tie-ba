import { existsSync } from "node:fs";
import { resolve } from "node:path";
import Response from "../../utils/tools/response";
import { responseFile } from "../../utils/tools/responseFile";
import type { Context, Next } from "koa";

/**
 * 静态图片中间件
 * @param ctx 请求上下文
 * @param next 放行
 */
export async function StaticMiddleware(ctx: Context, next: Next) {
  if (ctx.path.startsWith("/img")) {
    if (ctx.path !== "/img") {
      const rootPath = resolve(__dirname, "../../static");
      if (existsSync(rootPath)) {
        responseFile(ctx, rootPath);
      } else {
        ctx.status = 500;
        ctx.body = Response(null, "服务器内部错误!", 500);
        console.log(
          `time:${Date.now()}---path:${ctx.path}---message:static文件夹找到!`
        );
      }
    } else {
      ctx.status = 404;
      ctx.body = Response(null, "没有找到该文件!", 404);
    }
  } else {
    await next();
  }
}
