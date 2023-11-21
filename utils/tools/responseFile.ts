import { createReadStream, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Context } from "koa";
import Response from "./response";

/**
 * 响应文件(根据请求上下文的path属性来从根路径中获取文件)
 * @param ctx 上下文
 * @param rootPath 根路径
 */
export function responseFile(ctx: Context, rootPath: string) {
  // 解码url，生成真实请求路径
  const path = decodeURI(ctx.path);
  const filePath = resolve(rootPath, `.${path}`);
  if (existsSync(filePath)) {
    // 静态资源缓存10天
    ctx.set("cache-control", "max-age=864000");
    if (path.includes(".css")) {
      ctx.set("Content-Type", "text/css");
    } else if (path.includes(".js")) {
      ctx.set("Content-Type", "text/javascript");
    } else if (path.includes(".jpg")) {
      ctx.set("Content-Type", "image/jpeg");
    } else if (path.includes(".png")) {
      ctx.set("Content-Type", "image/png");
    } else if (path.includes(".ico")) {
      ctx.set("Content-Type", "image/x-icon");
    } else if (path.includes(".svg")) {
      ctx.set("Content-Type", "image/svg+xml");
    }
    ctx.body = createReadStream(filePath);
  } else {
    ctx.status = 404;
    ctx.body = Response(null, "没有找到该文件!", 404);
  }
}
