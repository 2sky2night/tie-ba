import { existsSync, createReadStream } from "node:fs";
import { resolve } from "node:path";
import Response from "../../utils/tools/response";
import { responseFile } from "../../utils/tools/responseFile";
import type { Context, Next } from "koa";

/**
 * 前端资源中间件
 * @param ctx 上下文
 * @param next 放行
 */
export async function ClientMiddleware(ctx: Context, next: Next) {
  if (ctx.path.startsWith("/api")) {
    await next();
  } else {
    const rootPath = resolve(__dirname, "../../client");
    if (existsSync(rootPath)) {
      if (ctx.path === "/favicon.ico" || ctx.path.startsWith("/assets")) {
        // 访问其他资源
        responseFile(ctx, rootPath);
      } else {
        // 访问页面
        const indexPath = resolve(rootPath, "./index.html");
        if (existsSync(indexPath)) {
          ctx.set("Content-Type", "text/html;charset=utf-8");
          ctx.body = createReadStream(indexPath);
        } else {
          ctx.status = 500;
          ctx.body = Response(null, "服务器内部错误!", 500);
          console.log(
            `time:${Date.now()}---path:${
              ctx.path
            }---message:未找到静态文件index.html!`
          );
        }
      }
    } else {
      ctx.status = 500;
      ctx.body = Response(null, "服务器内部错误!", 500);
      console.log(
        `time:${Date.now()}---path:${
          ctx.path
        }---message:未找到静态文件夹client!`
      );
    }
  }
}
