/*
MySQL Backup
Database: tie_bar_lower
Backup Time: 2023-07-18 18:22:16
*/

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `tie_bar_lower`.`article`;
DROP TABLE IF EXISTS `tie_bar_lower`.`bar`;
DROP TABLE IF EXISTS `tie_bar_lower`.`comment`;
DROP TABLE IF EXISTS `tie_bar_lower`.`user`;
DROP TABLE IF EXISTS `tie_bar_lower`.`user_follow_bar`;
DROP TABLE IF EXISTS `tie_bar_lower`.`user_follow_user`;
DROP TABLE IF EXISTS `tie_bar_lower`.`user_like_article`;
DROP TABLE IF EXISTS `tie_bar_lower`.`user_like_comment`;
DROP TABLE IF EXISTS `tie_bar_lower`.`user_star_article`;
CREATE TABLE `article` (
  `aid` int NOT NULL AUTO_INCREMENT COMMENT '帖子的id',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '帖子的标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '帖子的内容',
  `createTime` datetime DEFAULT NULL COMMENT '发帖的时间',
  `bid` int DEFAULT NULL COMMENT '吧的id',
  `uid` int DEFAULT NULL COMMENT '用户的id',
  `photo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '帖子的配图',
  PRIMARY KEY (`aid`),
  KEY `uid_acrticle` (`uid`),
  KEY `bid_acrticle` (`bid`),
  CONSTRAINT `bid_acrticle` FOREIGN KEY (`bid`) REFERENCES `bar` (`bid`),
  CONSTRAINT `uid_acrticle` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `bar` (
  `bid` int NOT NULL AUTO_INCREMENT COMMENT '吧的id',
  `bname` varchar(255) DEFAULT NULL COMMENT '吧的名称',
  `createTime` datetime DEFAULT NULL COMMENT '吧创建的时间',
  `uid` int DEFAULT NULL COMMENT '用户的id',
  `bdesc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '' COMMENT '吧的描述',
  `photo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '吧的头像',
  PRIMARY KEY (`bid`),
  KEY `uid_bar` (`uid`),
  CONSTRAINT `uid_bar` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `comment` (
  `cid` int NOT NULL AUTO_INCREMENT COMMENT '评论的id',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '评论的内容',
  `createTime` datetime DEFAULT NULL COMMENT '评论的时间',
  `aid` int DEFAULT NULL COMMENT '帖子的id',
  `uid` int DEFAULT NULL COMMENT '用户的id',
  `photo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`cid`),
  KEY `uid_comment` (`uid`),
  KEY `aid_comment` (`aid`),
  CONSTRAINT `aid_comment` FOREIGN KEY (`aid`) REFERENCES `article` (`aid`),
  CONSTRAINT `uid_comment` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `user` (
  `uid` int NOT NULL AUTO_INCREMENT COMMENT '用户的id',
  `username` varchar(20) DEFAULT NULL COMMENT '用户的名称',
  `password` varchar(20) DEFAULT NULL COMMENT '用户的密码',
  `createTime` datetime DEFAULT NULL COMMENT '创建时间',
  `avatar` varchar(999) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'http://127.0.0.1:3000/img/default_avatar.png' COMMENT '头像地址',
  `state` tinyint DEFAULT '1' COMMENT '用户的状态 0注销 1正常用户',
  `udesc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '这个人很懒，简介都不写呢~' COMMENT '用户简介',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `user_follow_bar` (
  `uid` int DEFAULT NULL,
  `bid` int DEFAULT NULL,
  `createTime` datetime DEFAULT NULL,
  KEY `uid_follow` (`uid`),
  KEY `bid_follow` (`bid`),
  CONSTRAINT `bid_follow` FOREIGN KEY (`bid`) REFERENCES `bar` (`bid`),
  CONSTRAINT `uid_follow` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `user_follow_user` (
  `uid` int DEFAULT NULL COMMENT '关注用户的用户id',
  `uid_is_followed` int DEFAULT NULL COMMENT '被关注的用户id',
  `createTime` datetime DEFAULT NULL,
  KEY `uid_follow_user` (`uid`),
  KEY `uid_is_followed_follow_user` (`uid_is_followed`),
  CONSTRAINT `uid_follow_user` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`),
  CONSTRAINT `uid_is_followed_follow_user` FOREIGN KEY (`uid_is_followed`) REFERENCES `user` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `user_like_article` (
  `aid` int NOT NULL COMMENT '文章的id',
  `uid` int DEFAULT NULL COMMENT '用户的id',
  `createTime` datetime DEFAULT NULL COMMENT '点赞帖子的时间',
  KEY `uid_like_article` (`uid`),
  KEY `aid_like_article` (`aid`),
  CONSTRAINT `aid_like_article` FOREIGN KEY (`aid`) REFERENCES `article` (`aid`),
  CONSTRAINT `uid_like_article` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `user_like_comment` (
  `cid` int DEFAULT NULL COMMENT '评论的id',
  `uid` int DEFAULT NULL COMMENT '用户的id',
  `createTime` datetime DEFAULT NULL COMMENT '点赞评论的时间',
  KEY `cid_like_comment` (`cid`),
  KEY `uid_like_comment` (`uid`),
  CONSTRAINT `cid_like_comment` FOREIGN KEY (`cid`) REFERENCES `comment` (`cid`),
  CONSTRAINT `uid_like_comment` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `user_star_article` (
  `uid` int NOT NULL,
  `aid` int NOT NULL,
  `createTime` datetime NOT NULL,
  KEY `aid_star` (`aid`),
  KEY `uid_star` (`uid`),
  CONSTRAINT `aid_star` FOREIGN KEY (`aid`) REFERENCES `article` (`aid`),
  CONSTRAINT `uid_star` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
BEGIN;
LOCK TABLES `tie_bar_lower`.`article` WRITE;
DELETE FROM `tie_bar_lower`.`article`;
INSERT INTO `tie_bar_lower`.`article` (`aid`,`title`,`content`,`createTime`,`bid`,`uid`,`photo`) VALUES (1, '测试', '测试帖子的👌', '2023-06-08 18:12:18', 1, 1, NULL),(2, '测试帖子01', '测试帖子', '2023-06-09 09:57:26', 1, 3, 'http://dummyimage.com/400x400'),(3, '测试帖子02', '测试帖子', '2023-06-09 10:17:29', 1, 1, 'http://dummyimage.com/400x400'),(4, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-06-12 10:33:43', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(5, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-06-13 15:58:20', 1, 2, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(6, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-06-16 18:43:15', 1, 3, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(7, '参低满状素文', 'anim', '2023-06-20 11:04:23', 4, 4, 'dolore culpa magna dolor,adipisicing quis,non dolor exercitation'),(8, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:52', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(9, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:53', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(10, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:53', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(11, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:54', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(12, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:54', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(13, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:55', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(14, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:55', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(15, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:56', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(16, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:56', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(17, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:57', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(18, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:57', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(19, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:58', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(20, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:58', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(21, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:59', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(22, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:59', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(23, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:00', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(24, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:02', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(25, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:03', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(26, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:03', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(27, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:04', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(28, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:04', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(29, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:06', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(30, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:07', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(31, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:08', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(32, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:09', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(33, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-07 11:09:58', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(34, '养示按连使', 'laboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud sunt', '2023-07-07 14:24:32', 2, 1, NULL),(35, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-13 16:09:35', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(36, '法程人她111', 'voluptate Lorem adipisicing do fugiat', '2023-07-13 16:09:50', 1, 1, 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(37, '法程人她222', 'voluptate Lorem adipisicing do fugiat', '2023-07-13 16:13:03', 1, 1, NULL),(38, '法程人她111', 'voluptate Lorem adipisicing do fugiat', '2023-07-13 16:15:08', 1, 1, NULL),(39, 'asdsa', '花花', '2023-07-14 10:52:52', 8, 1, 'http://127.0.0.1:3000/img/image-20230620172706891_1689303162906_05870bad9153db4b14937ed22.png'),(40, 'sd', 'sada', '2023-07-14 11:03:53', 19, 1, 'http://127.0.0.1:3000/img/image-20230620172706891_1689303830249_05870bad9153db4b14937ed28.png'),(41, 'saddddddddd', 'sadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsaddddddddd', '2023-07-14 11:06:07', 18, 1, 'http://127.0.0.1:3000/img/image-20230620172706891_1689303854658_05870bad9153db4b14937ed29.png,http://127.0.0.1:3000/img/截图_2023-06-23_09-41-06_1689303855847_05870bad9153db4b14937ed2a.png,http://127.0.0.1:3000/img/image-20230620172137194_1689303857216_05870bad9153db4b14937ed2b.png'),(42, 'asdsadsad', 'asdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadads', '2023-07-14 11:08:14', 17, 1, 'http://127.0.0.1:3000/img/截图_2023-07-01_16-11-30_1689304086777_c8bd7eadfe8233ca3b6ecb800.png'),(44, 'sadasd', 'asdasdasdasd', '2023-07-14 16:49:19', 22, 1, 'http://127.0.0.1:3000/img/微信图片_20230621173731_1689324551747_669a21d4d5acd76a9a9f3a907.png,http://127.0.0.1:3000/img/image-20230620172137194_1689324548317_669a21d4d5acd76a9a9f3a906.png,http://127.0.0.1:3000/img/截图_2023-07-01_16-10-42_1689324556915_669a21d4d5acd76a9a9f3a909.png'),(45, 'ddddddddddddddd', 'ddddddddddddddd', '2023-07-14 16:51:13', 2, 1, 'http://127.0.0.1:3000/img/image-20230620172137194_1689324649355_669a21d4d5acd76a9a9f3a90a.png,http://127.0.0.1:3000/img/image-20230620172706891_1689324650942_669a21d4d5acd76a9a9f3a90b.png,http://127.0.0.1:3000/img/image-20230620172137194_1689324652690_669a21d4d5acd76a9a9f3a90c.png'),(46, 'd😋', 'd😋d😋d😋d😋d😋d😋d😋d😋d😋', '2023-07-14 16:56:10', 24, 1, 'http://127.0.0.1:3000/img/image-20230620172137194_1689324969064_669a21d4d5acd76a9a9f3a913.png'),(47, '测', '嘎嘎嘎', '2023-07-14 17:07:33', 19, 1, NULL),(48, '阿斯顿', '测', '2023-07-14 17:07:42', 24, 1, NULL),(49, '试', 'sadasd', '2023-07-14 18:05:23', 24, 1, NULL),(50, 'sad', 'sadasd', '2023-07-17 11:09:52', 24, 8, 'http://127.0.0.1:3000/img/截图_2023-06-23_10-51-55_1689563388117_30e27d68dc1f6eab8f4b31b00.png'),(51, 'sdasd', 'dasdasd', '2023-07-17 16:14:58', 21, 1, 'http://127.0.0.1:3000/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png,http://127.0.0.1:3000/img/image-20230620172137194_1689581687930_f59da882e88cb27c706bfe301.png'),(52, 'czxc', 'xzcxzc', '2023-07-18 15:37:05', 24, 1, 'http://127.0.0.1:3000/img/截图_2023-06-23_11-12-58_1689665815114_1479c9f054eefa1ede9750a01.png,http://127.0.0.1:3000/img/image-20230620172706891_1689665798443_1479c9f054eefa1ede9750a00.png,http://127.0.0.1:3000/img/image-20230620172706891_1689665816978_1479c9f054eefa1ede9750a02.png');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`bar` WRITE;
DELETE FROM `tie_bar_lower`.`bar`;
INSERT INTO `tie_bar_lower`.`bar` (`bid`,`bname`,`createTime`,`uid`,`bdesc`,`photo`) VALUES (1, '重庆', '2023-05-30 11:08:43', 1, '行千里致广大', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(2, '北京', '2023-05-30 13:39:24', 1, '我爱北京!', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(3, '软件测试', '2023-05-30 13:44:18', 1, '软件测试交流吧！', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(4, 'react', '2023-05-30 13:45:04', 1, '探讨react的交流，工作、求职等等知识', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(5, '我的世界', '2023-05-30 15:07:35', 1, '欢迎来到我的世界吧!', 'http://127.0.0.1:3000/img/d69b93c7fb69bf4a6847c2500.png'),(6, '英雄联盟', '2023-05-30 15:07:35', 1, '欢迎来到英雄联盟吧!', 'http://127.0.0.1:3000/img/d69b93c7fb69bf4a6847c2500.png'),(7, '赛马娘', '2023-05-30 15:13:34', 1, '欢迎来到赛马娘吧!', 'http://127.0.0.1:3000/img/d69b93c7fb69bf4a6847c2500.png'),(8, '流家家段任难', '2023-06-06 14:41:39', 2, 'ut nostrud Lorem elit', 'http://dummyimage.com/400x400'),(9, '办斯和较', '2023-07-13 17:20:44', 1, 'exercitation ad dolor voluptate', 'http://dummyimage.com/400x400'),(10, '文通需决', '2023-07-13 17:20:45', 1, 'ullamco', 'http://dummyimage.com/400x400'),(11, '重广二拉该', '2023-07-13 17:20:47', 1, 'nisi do aliqua', 'http://dummyimage.com/400x400'),(12, '二车完离任最或', '2023-07-13 17:20:48', 1, 'eiusmod mollit et occaecat', 'http://dummyimage.com/400x400'),(13, '特成得要没', '2023-07-13 17:20:50', 1, 'commodo', 'http://dummyimage.com/400x400'),(14, '群记了报社', '2023-07-13 17:20:52', 1, 'incididunt do dolore reprehenderit', 'http://dummyimage.com/400x400'),(15, '里中者白王平', '2023-07-13 17:20:54', 1, 'sunt ea eu nulla enim', 'http://dummyimage.com/400x400'),(16, '中百别消华程', '2023-07-13 17:20:55', 1, 'elit aliquip enim', 'http://dummyimage.com/400x400'),(17, '农党识科根各', '2023-07-13 17:20:57', 1, 'irure dolore mollit', 'http://dummyimage.com/400x400'),(18, '从求还金治他', '2023-07-13 17:20:58', 1, 'proident do', 'http://dummyimage.com/400x400'),(19, '题决小适品育', '2023-07-13 17:21:00', 1, 'culpa laboris exercitation sint veniam', 'http://dummyimage.com/400x400'),(20, '热较要段会阶', '2023-07-13 17:21:02', 1, 'dolore labore adipisicing velit laborum', 'http://dummyimage.com/400x400'),(21, '们京着除史口', '2023-07-13 17:21:04', 1, 'ipsum nulla', 'http://dummyimage.com/400x400'),(22, 'sad', '2023-07-14 16:43:09', 1, 'ddd', 'http://127.0.0.1:3000/img/image-20230620172137194_1689324181643_669a21d4d5acd76a9a9f3a901.png'),(23, 'adasd', '2023-07-14 16:47:29', 1, 'sadasd', 'http://127.0.0.1:3000/img/微信图片_20230621173731_1689324436110_669a21d4d5acd76a9a9f3a902.png'),(24, '😋😋😋', '2023-07-14 16:55:37', 1, '😋😋😋😋😋😋😋😋😋😋😋😋😋😋😋😋', 'http://127.0.0.1:3000/img/image-20230620172137194_1689324925603_669a21d4d5acd76a9a9f3a911.png');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`comment` WRITE;
DELETE FROM `tie_bar_lower`.`comment`;
INSERT INTO `tie_bar_lower`.`comment` (`cid`,`content`,`createTime`,`aid`,`uid`,`photo`) VALUES (1, 'ea Duis', '2023-06-12 09:46:55', 1, 2, 'anim'),(2, 'culpa', '2023-06-12 09:47:20', 1, 2, 'veniam consequat in laboris officia,consequat'),(3, '你好啊', '2023-06-19 16:51:53', 1, 1, 'veniam consequat in laboris officia,consequat'),(4, 'fugiat minim officia non cillum', '2023-06-19 16:52:55', 2, 1, NULL),(5, '大瓜法国', '2023-06-19 16:53:21', 3, 1, 'tempor consectetur occaecat eu ad,sunt in enim sit amet,non pariatur,et consectetur,Lorem reprehenderit ex aute magna'),(6, 'culpa', '2023-06-20 10:03:18', 4, 1, 'veniam consequat in laboris officia,consequat'),(7, 'culpa', '2023-06-20 10:03:20', 4, 1, 'veniam consequat in laboris officia,consequat'),(8, 'culpa', '2023-06-20 10:03:20', 4, 1, 'veniam consequat in laboris officia,consequat'),(9, 'culpa', '2023-06-20 10:03:21', 4, 1, 'veniam consequat in laboris officia,consequat'),(10, 'culpa', '2023-06-20 10:20:29', 5, 1, 'veniam consequat in laboris officia,consequat'),(11, 'culpa', '2023-06-20 11:30:18', 7, 1, 'veniam consequat in laboris officia,consequat'),(12, '你好啊', '2023-07-07 17:09:19', 34, 1, NULL),(13, '黑暗时代杀毒后', '2023-07-07 17:10:47', 34, 1, NULL),(14, '你太搞笑了', '2023-07-07 17:10:59', 34, 1, NULL),(15, 'asdasd', '2023-07-07 17:12:14', 34, 1, NULL),(16, 'asdasdasdasd', '2023-07-07 17:12:30', 34, 1, NULL),(17, 'asdasd', '2023-07-07 17:45:41', 34, 1, NULL),(18, 'asdsad', '2023-07-07 18:44:32', 33, 1, 'http://127.0.0.1:3000/img/ff.png_1688726630323_56326d1da372e1a3732311818.png,http://127.0.0.1:3000/img/ff.png_1688726633012_56326d1da372e1a3732311819.png'),(19, '哈哈哈哈', '2023-07-10 11:52:51', 33, 1, 'http://127.0.0.1:3000/img/ff_1688961158440_94dda9aef2859835ee3bc8c00.png,http://127.0.0.1:3000/img/mm_1688961160270_94dda9aef2859835ee3bc8c01.png'),(20, '大师傅士大夫', '2023-07-10 14:23:18', 33, 1, NULL),(21, 'adsad', '2023-07-10 14:23:34', 33, 1, NULL),(22, 'dddd', '2023-07-10 14:26:04', 33, 1, 'http://127.0.0.1:3000/img/微信图片_20230601134844_1688970358891_94dda9aef2859835ee3bc8c02.png'),(23, '哈哈哈哈的😫😫😫', '2023-07-10 14:58:05', 1, 1, NULL),(24, '哈哈哈', '2023-07-10 15:58:18', 32, 1, NULL),(25, '十大', '2023-07-11 09:23:24', 34, 1, NULL),(26, 'asdsad', '2023-07-11 17:11:23', 34, 1, NULL),(27, 'asdasd', '2023-07-14 11:28:36', 39, 1, NULL),(28, 'jjjjjjj', '2023-07-14 14:23:06', 42, 1, NULL),(29, 'dddd', '2023-07-14 16:51:26', 45, 1, NULL),(30, 'dddd', '2023-07-14 16:51:32', 45, 1, 'http://127.0.0.1:3000/img/截图_2023-06-23_10-46-41_1689324690665_669a21d4d5acd76a9a9f3a90d.png'),(31, 'dddd', '2023-07-14 16:51:56', 45, 1, 'http://127.0.0.1:3000/img/image-20230620172137194_1689324700243_669a21d4d5acd76a9a9f3a90e.png,http://127.0.0.1:3000/img/微信图片_20230621173731_1689324707498_669a21d4d5acd76a9a9f3a90f.png,http://127.0.0.1:3000/img/截图_2023-06-23_10-36-43_1689324708812_669a21d4d5acd76a9a9f3a910.png'),(32, 'ss1', '2023-07-17 14:29:40', 48, 1, NULL),(33, 'asd', '2023-07-17 14:30:12', 50, 1, NULL),(34, 'asd1', '2023-07-18 10:18:17', 51, 1, NULL);
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user` WRITE;
DELETE FROM `tie_bar_lower`.`user`;
INSERT INTO `tie_bar_lower`.`user` (`uid`,`username`,`password`,`createTime`,`avatar`,`state`,`udesc`) VALUES (1, 'admin', '123456', '2023-05-29 15:28:10', 'http://127.0.0.1:3000/img/截图_2023-06-23_09-41-06_1689154146894_b79be67b1d0135485b6c6a500.png', 1, '这个人很懒，简介都不写呢~'),(2, '郭军', '123456', '2023-05-29 20:24:37', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1, '这个人很懒，简介都不写呢~'),(3, '张军', '123456', '2023-05-29 20:55:34', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 0, '这个人很懒，简介都不写呢~'),(4, '七喜128', '123456', '2023-05-29 21:17:24', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1, '这个人很懒，简介都不写呢~'),(5, 'Mark', '123456', '2023-05-30 11:14:02', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1, '这个人很懒，简介都不写呢~'),(6, 'Mark1', '123456', '2023-06-21 17:33:07', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1, '这个人很懒，简介都不写呢~'),(7, 'Mark11', '12456', '2023-06-21 17:34:01', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1, '这个人很懒，简介都不写呢~'),(8, 'wocao', '123456', '2023-07-10 16:19:06', 'http://127.0.0.1:3000/img/image-20230620172137194_1689652047859_055c654dfbc81b97a1bde9701.png', 1, '这个人很懒，简介都不写呢~'),(9, 'kk', '111111', '2023-07-11 10:31:43', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1, '这个人很懒，简介都不写呢~'),(12, 'kk888', '111111', '2023-07-18 18:09:26', 'http://127.0.0.1:3000/img/default_avatar.png', 1, '这个人很懒，简介都不写呢~'),(13, 'kk899', '111111', '2023-07-18 18:17:38', 'http://127.0.0.1:3000/img/default_avatar.png', 1, '这个人很懒，简介都不写呢~');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_follow_bar` WRITE;
DELETE FROM `tie_bar_lower`.`user_follow_bar`;
INSERT INTO `tie_bar_lower`.`user_follow_bar` (`uid`,`bid`,`createTime`) VALUES (1, 3, '2023-05-30 21:43:36'),(2, 1, '2023-06-12 10:34:32'),(2, 2, '2023-06-12 11:08:34'),(3, 1, '2023-07-11 17:29:40'),(4, 1, '2023-07-11 17:29:51'),(5, 1, '2023-07-11 17:29:51'),(6, 1, '2023-07-11 17:29:51'),(7, 1, '2023-07-11 17:29:51'),(8, 1, '2023-07-11 17:29:51'),(9, 1, '2023-07-11 17:29:51'),(1, 1, '2023-07-11 18:04:50'),(1, 8, '2023-07-17 18:30:42'),(1, 24, '2023-07-18 15:28:24'),(1, 22, '2023-07-18 15:28:25'),(1, 20, '2023-07-18 15:28:26'),(1, 18, '2023-07-18 15:28:27'),(1, 16, '2023-07-18 15:28:27'),(1, 15, '2023-07-18 15:28:28'),(1, 17, '2023-07-18 15:28:28'),(1, 19, '2023-07-18 15:28:29'),(1, 21, '2023-07-18 15:28:29'),(1, 23, '2023-07-18 15:28:30');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_follow_user` WRITE;
DELETE FROM `tie_bar_lower`.`user_follow_user`;
INSERT INTO `tie_bar_lower`.`user_follow_user` (`uid`,`uid_is_followed`,`createTime`) VALUES (1, 5, '2023-06-06 14:37:40'),(2, 3, '2023-06-12 10:35:18'),(2, 1, '2023-06-12 10:35:20'),(2, 4, '2023-06-12 10:35:22'),(3, 1, '2023-06-25 10:13:19'),(1, 8, '2023-07-10 17:07:13'),(9, 1, '2023-07-11 10:40:14'),(1, 9, '2023-07-11 16:22:21'),(1, 2, '2023-07-18 10:32:19'),(1, 3, '2023-07-18 11:03:06'),(1, 4, '2023-07-18 11:03:13'),(1, 6, '2023-07-18 11:03:24'),(1, 7, '2023-07-18 11:03:37'),(8, 1, '2023-07-18 11:48:42');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_like_article` WRITE;
DELETE FROM `tie_bar_lower`.`user_like_article`;
INSERT INTO `tie_bar_lower`.`user_like_article` (`aid`,`uid`,`createTime`) VALUES (2, 1, '2023-06-09 11:02:10'),(1, 2, '2023-06-12 10:28:10'),(4, 1, '2023-06-12 10:36:52'),(2, 2, '2023-06-12 11:16:53'),(3, 2, '2023-06-12 11:16:55'),(4, 2, '2023-06-12 11:16:58'),(3, 1, '2023-07-05 14:57:46'),(7, 1, '2023-07-06 15:14:31'),(33, 1, '2023-07-10 14:22:05'),(34, 8, '2023-07-10 16:19:31'),(1, 9, '2023-07-11 10:40:22'),(1, 1, '2023-07-11 17:19:22'),(38, 1, '2023-07-13 18:15:44'),(41, 1, '2023-07-14 11:07:05'),(45, 1, '2023-07-14 16:51:20'),(49, 1, '2023-07-14 18:06:16'),(48, 1, '2023-07-14 18:07:30'),(50, 1, '2023-07-17 14:29:33'),(34, 1, '2023-07-17 17:25:26'),(52, 1, '2023-07-18 16:13:16');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_like_comment` WRITE;
DELETE FROM `tie_bar_lower`.`user_like_comment`;
INSERT INTO `tie_bar_lower`.`user_like_comment` (`cid`,`uid`,`createTime`) VALUES (1, 2, '2023-06-13 17:14:50'),(2, 2, '2023-06-13 17:14:54'),(5, 1, '2023-06-19 17:32:18'),(7, 1, '2023-06-20 14:05:35'),(2, 3, '2023-06-20 14:05:40'),(4, 1, '2023-06-20 14:05:48'),(6, 4, '2023-06-20 14:05:54'),(8, 1, '2023-06-20 14:06:01'),(9, 1, '2023-06-20 14:06:04'),(10, 1, '2023-06-20 14:06:07'),(11, 1, '2023-06-20 14:06:10'),(7, 5, '2023-06-20 14:08:15'),(1, 5, '2023-06-20 14:08:17'),(2, 4, '2023-06-20 14:08:19'),(3, 5, '2023-06-20 14:08:21'),(4, 5, '2023-06-20 14:08:22'),(5, 5, '2023-06-20 14:08:24'),(6, 5, '2023-06-20 14:08:26'),(8, 5, '2023-06-20 14:08:30'),(9, 5, '2023-06-20 14:08:33'),(10, 5, '2023-06-20 14:08:37'),(1, 4, '2023-06-20 14:17:18'),(5, 4, '2023-06-20 14:20:56'),(12, 1, '2023-07-10 09:49:24'),(13, 1, '2023-07-10 09:49:25'),(22, 1, '2023-07-10 14:26:14'),(20, 1, '2023-07-10 15:47:19'),(24, 1, '2023-07-10 15:58:23'),(16, 1, '2023-07-10 16:18:43'),(15, 1, '2023-07-10 16:18:46'),(14, 1, '2023-07-10 16:18:47'),(17, 1, '2023-07-10 16:18:49'),(12, 8, '2023-07-10 16:19:37'),(1, 1, '2023-07-18 10:05:18');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_star_article` WRITE;
DELETE FROM `tie_bar_lower`.`user_star_article`;
INSERT INTO `tie_bar_lower`.`user_star_article` (`uid`,`aid`,`createTime`) VALUES (1, 2, '2023-06-09 11:29:23'),(1, 3, '2023-06-09 18:48:45'),(2, 2, '2023-06-12 10:28:17'),(2, 4, '2023-06-12 10:43:12'),(2, 3, '2023-06-12 11:16:25'),(2, 1, '2023-06-12 11:16:32'),(2, 5, '2023-06-13 15:58:31'),(1, 7, '2023-07-06 15:14:35'),(1, 32, '2023-07-06 17:50:13'),(1, 33, '2023-07-07 11:31:38'),(1, 22, '2023-07-10 15:55:10'),(1, 34, '2023-07-10 15:55:53'),(8, 34, '2023-07-10 16:19:30'),(1, 1, '2023-07-11 17:19:25'),(1, 42, '2023-07-14 14:23:16');
UNLOCK TABLES;
COMMIT;
