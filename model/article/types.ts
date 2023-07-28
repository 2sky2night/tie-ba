import { ReplyItem } from 'service/article/types';
import { User, UserInfo } from "../user/types";

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
  content: string;
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
  photo: string | null;
  /**
   * 帖子标题
   */
  title: string;
}

/**
 * 点赞文章表中的一条记录
 */
export interface ArticleLikeBaseItem {
  uid: number;
  aid: number;
  createTime: string;
}

/**
 * 收藏文章表中的一条记录
 */
export interface ArticleStarBaseItem {
  uid: number;
  aid: number;
  createTime: string;
}

/**
 * 创建帖子的数据 请求体
 */
export interface CreateArticleBody {
  /**
   * 帖子内容
   */
  content: string;
  /**
   * 帖子所属吧的id
   */
  bid: number;
  /**
   * 帖子的配图
   */
  photo?: string | string[];
  /**
   * 帖子标题
   */
  title: string;
}

/**
 * 创建帖子的数据 操作数据库时的请求体
 */
export interface InsertArticleBody {
  /**
   * 帖子内容
   */
  content: string;
  /**
   * 帖子所属吧的id
   */
  bid: number;
  /**
   * 帖子创建者的id
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

/**
 * 创建评论的数据 发送请求时的请求体
 */
export interface CreateCommentBody {
  /**
   * 评论内容
   */
  content: string;
  /**
   * 帖子id
   */
  aid: number;
  /**
   * 配图
   */
  photo?: string | string[];
}

/**
 * 创建评论的数据 操作数据库时的请求体
 */
export interface InserCommentBody {
  /**
   * 评论内容
   */
  content: string;
  /**
   * 帖子id
   */
  aid: number;
  /**
   * 用户id
   */
  uid: number;
  /**
   * 配图
   */
  photo?: string;
}

/**
 * 评论数据的基础数据
 */
export interface CommentBaseItem {
  cid: number;
  content: string;
  createTime: string;
  aid: number;
  uid: number;
  photo: string | null;
}

/**
 * 点赞评论的基础数据
 */
export interface LikeCommentBaseItem {
  cid: number;
  uid: number;
  createTime: string;
}


/**
 * 回复的基础数据
 */
export interface ReplyBaseItem {
  rid: number;
  content: string;
  createTime: string;
  uid: number;
  /**
   * 回复对象的id
   */
  id: number;
  /**
   * 回复的类型 1回复评论 2对回复进行回复
   */
  type: 1 | 2;
  /**
   * 评论所属的id
   */
  cid: number;
}


/**
 * 用户点赞回复表
 */
export interface UserLikeReplyItem {
  rid: number;
  uid: number;
  createTime: string;
}