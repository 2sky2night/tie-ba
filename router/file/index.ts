import Router from "koa-router";
import koaBody from "koa-body";
import FileController from '../../controller/file'

// 文件上传路由
const fileRouter = new Router()
// 文件上传的根路径
const baseRouterURL = '/file'

// 文件上传的全局中间件 koaBody解析文件上传
fileRouter.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: 'static/img', // 设置文件上传目录
        keepExtensions: true,    // 保持文件的后缀
        maxFieldsSize: 10 * 1024 * 1024, // 文件上传大小 为 10MB
        onFileBegin(name, file) {
            if (file.originalFilename && file.originalFilename.includes(',')) {
                // 若源文件名称包含英文逗号 需要将英文逗号全部删除 避免影响解析数据
                for (; ;) {
                    if (file.originalFilename.includes(',')) {
                        file.originalFilename = file.originalFilename.replace(',', '')
                    } else {
                        break;
                    }
                }
            }
            const temp = file.originalFilename.split('.')
            temp.pop()
            const newName = `${temp.join('.')}_${Date.now()}_${file.newFilename}`
            file.filepath = file.filepath.replace(file.newFilename, newName)
            file.newFilename = newName
        },
    }
}))

// 图片上传的路由
fileRouter.post('file', `${baseRouterURL}/image`, FileController.toImageLoad)


export default fileRouter