export default {
  insertFailed: (name: string = '') => `插入${ name }记录失败!`,
  updateFailed: (name: string = '') => `更新${ name }记录失败!`,
  deleteFailed: (name: string = '') => `删除${ name }记录失败!`
}