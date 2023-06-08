/**
 * 帖子的基础数据
 */
export interface ArticleBaseItem {
  /**
   * 帖子id
   */
  aid: number;
  /**
   * 帖子内容
   */
  content: number;
  /**
   * 帖子创建时间
   */
  createTime: string;
  /**
   * 帖子所属吧的id
   */
  bid: number;
  /**
   * 帖子创建者
   */
  uid: number;
  /**
   * 帖子的配图
   */
  photo: string;
  /**
   * 帖子标题
   */
  title: string;
}

/**
 * 创建帖子的数据 请求体
 */
export interface CreateArticleBody {
  /**
   * 帖子id
   */
  aid: number;
  /**
   * 帖子内容
   */
  content: number;
  /**
   * 帖子所属吧的id
   */
  bid: number;
  /**
   * 帖子创建者
   */
  uid: number;
  /**
   * 帖子的配图
   */
  photo?: string;
  /**
   * 帖子标题
   */
  title: string;
}