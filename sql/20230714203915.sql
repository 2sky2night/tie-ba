/*
MySQL Backup
Database: tie_bar_lower
Backup Time: 2023-07-14 20:39:15
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
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '帖子的内容',
  `createTime` datetime DEFAULT NULL COMMENT '发帖的时间',
  `bid` int DEFAULT NULL COMMENT '吧的id',
  `uid` int DEFAULT NULL COMMENT '用户的id',
  `title` varchar(255) DEFAULT NULL COMMENT '帖子的标题',
  `photo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '帖子的配图',
  PRIMARY KEY (`aid`),
  KEY `bid_acrticle` (`bid`),
  KEY `uid_acrticle` (`uid`),
  CONSTRAINT `bid_acrticle` FOREIGN KEY (`bid`) REFERENCES `bar` (`bid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_acrticle` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `bar` (
  `bid` int NOT NULL AUTO_INCREMENT COMMENT '吧的id',
  `bname` varchar(255) DEFAULT NULL COMMENT '吧的名称',
  `createTime` datetime DEFAULT NULL COMMENT '吧创建的时间',
  `uid` int DEFAULT NULL COMMENT '用户的id',
  `bdesc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '吧的描述',
  `photo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '吧的头像',
  PRIMARY KEY (`bid`),
  KEY `uid_bar` (`uid`),
  CONSTRAINT `uid_bar` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `comment` (
  `cid` int NOT NULL AUTO_INCREMENT COMMENT '评论的id',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '评论的内容',
  `createTime` datetime DEFAULT NULL COMMENT '评论的时间',
  `aid` int DEFAULT NULL COMMENT '帖子的id',
  `uid` int DEFAULT NULL COMMENT '用户的id',
  `photo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`cid`),
  KEY `aid_comment` (`aid`),
  KEY `uid_comment` (`uid`),
  CONSTRAINT `aid_comment` FOREIGN KEY (`aid`) REFERENCES `article` (`aid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_comment` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `user` (
  `uid` int NOT NULL AUTO_INCREMENT COMMENT '用户的id',
  `username` varchar(20) DEFAULT NULL COMMENT '用户的名称',
  `password` varchar(20) DEFAULT NULL COMMENT '用户的密码',
  `createTime` datetime DEFAULT NULL COMMENT '创建时间',
  `avatar` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '头像地址',
  `state` tinyint DEFAULT '1' COMMENT '用户的状态 0注销 1正常用户',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `user_follow_bar` (
  `uid` int DEFAULT NULL,
  `bid` int DEFAULT NULL,
  `createTime` datetime DEFAULT NULL,
  KEY `bid_follow` (`bid`),
  KEY `uid_follow` (`uid`),
  CONSTRAINT `bid_follow` FOREIGN KEY (`bid`) REFERENCES `bar` (`bid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_follow` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `user_follow_user` (
  `uid` int DEFAULT NULL COMMENT '关注用户的用户id',
  `uid_is_followed` int DEFAULT NULL COMMENT '被关注的用户id',
  `createTime` datetime DEFAULT NULL,
  KEY `uid_follow_user` (`uid`),
  KEY `uid_is_followed_follow_user` (`uid_is_followed`),
  CONSTRAINT `uid_follow_user` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_is_followed_follow_user` FOREIGN KEY (`uid_is_followed`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `user_like_article` (
  `aid` int NOT NULL COMMENT '文章的id',
  `uid` int DEFAULT NULL COMMENT '用户的id',
  `createTime` datetime DEFAULT NULL COMMENT '点赞帖子的时间',
  KEY `aid_like_article` (`aid`),
  KEY `uid_like_article` (`uid`),
  CONSTRAINT `aid_like_article` FOREIGN KEY (`aid`) REFERENCES `article` (`aid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_like_article` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `user_like_comment` (
  `cid` int DEFAULT NULL COMMENT '评论的id',
  `uid` int DEFAULT NULL COMMENT '用户的id',
  `createTime` datetime DEFAULT NULL COMMENT '点赞评论的时间',
  KEY `cid_like_comment` (`cid`),
  KEY `uid_like_comment` (`uid`),
  CONSTRAINT `cid_like_comment` FOREIGN KEY (`cid`) REFERENCES `comment` (`cid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_like_comment` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `user_star_article` (
  `uid` int NOT NULL COMMENT '用户id',
  `aid` int NOT NULL COMMENT '帖子id',
  `createTime` datetime DEFAULT NULL COMMENT '创建时间',
  KEY `aid_star` (`aid`),
  KEY `uid_star` (`uid`),
  CONSTRAINT `aid_star` FOREIGN KEY (`aid`) REFERENCES `article` (`aid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_star` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
BEGIN;
LOCK TABLES `tie_bar_lower`.`article` WRITE;
DELETE FROM `tie_bar_lower`.`article`;
INSERT INTO `tie_bar_lower`.`article` (`aid`,`content`,`createTime`,`bid`,`uid`,`title`,`photo`) VALUES (1, '测试帖子', '2023-06-08 21:33:31', 1, 1, '·测试标题', NULL),(2, '你好测试帖子', '2023-06-08 21:56:18', 1, 1, '测试帖子01', 'http://127.0.0.1:3000/img/_1688781362118_7904116ac6c3f4ed9fc9aff00.png'),(4, '你好测试帖子', '2023-06-08 21:58:48', 1, 2, '测试帖子02', NULL),(5, '测试帖子', '2023-06-11 17:22:13', 1, 1, '测试帖子03', 'http://127.0.0.1:3000/img/_1688781362118_7904116ac6c3f4ed9fc9aff00.png'),(6, 'laboris enim officia labore reprehenderit', '2023-06-11 17:36:14', 1, 1, '公林多回', 'http://dummyimage.com/400x400'),(7, 'voluptate Lorem adipisicing do fugiat', '2023-06-11 17:36:55', 1, 1, '法程人她', 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(8, 'voluptate Lorem adipisicing do fugiat', '2023-06-18 10:31:47', 1, 1, '法程人她', 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(9, 'voluptate Lorem adipisicing do fugiat', '2023-06-18 10:31:48', 1, 1, '法程人她', 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(11, 'dolore culpa eiusmod non irure', '2023-06-18 10:32:02', 1, 1, '写斯记', 'http://127.0.0.1:3000/img/_1688781362118_7904116ac6c3f4ed9fc9aff00.png'),(12, 'voluptate Lorem adipisicing do fugiat', '2023-06-18 12:10:51', 2, 2, '法程人她', 'http://dummyimage.com/400x400,http://dummyimage.com/400x400,http://dummyimage.com/400x400'),(13, '呃呃呃呃呃呃呃', '2023-07-14 20:34:31', 7, 1, '我是帖子', 'http://127.0.0.1:3000/img/_1689338009796_013867edc426d0a52d0086f00.png,http://127.0.0.1:3000/img/~)HW6P$4Y5K`MES1}]VVAW2_1689338011352_013867edc426d0a52d0086f01.png,http://127.0.0.1:3000/img/0_1689338065952_013867edc426d0a52d0086f02.jpg');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`bar` WRITE;
DELETE FROM `tie_bar_lower`.`bar`;
INSERT INTO `tie_bar_lower`.`bar` (`bid`,`bname`,`createTime`,`uid`,`bdesc`,`photo`) VALUES (1, '重庆', '2023-05-30 11:08:43', 1, '行千里致广大', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(2, '北京', '2023-05-30 13:39:24', 1, '我爱北京!', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(3, '软件测试', '2023-05-30 13:44:18', 1, '软件测试交流吧！', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(4, 'react', '2023-05-30 13:45:04', 1, '探讨react的交流，工作、求职等等知识', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(5, '我的世界', '2023-05-30 15:07:35', 1, '欢迎来到我的世界吧!', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(6, '英雄联盟', '2023-05-30 15:07:35', 1, '欢迎来到英雄联盟吧!', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(7, '赛马娘', '2023-05-30 15:13:34', 1, '欢迎来到赛马娘吧!', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(8, '天宫心吧', '2023-07-14 20:36:35', 1, '天宫心，是一名唱歌非常好听的vtuber', 'http://127.0.0.1:3000/img/ammy_1689338149445_013867edc426d0a52d0086f04.png');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`comment` WRITE;
DELETE FROM `tie_bar_lower`.`comment`;
INSERT INTO `tie_bar_lower`.`comment` (`cid`,`content`,`createTime`,`aid`,`uid`,`photo`) VALUES (1, '测试评论', '2023-06-11 09:34:00', 1, 1, NULL),(3, 'magna dolor anim fugiat mollit', '2023-06-11 10:32:51', 1, 1, 'http://127.0.0.1:3000/img/_1688781362118_7904116ac6c3f4ed9fc9aff00.png'),(4, 'magna dolor anim fugiat mollit', '2023-06-11 10:33:05', 4, 2, NULL),(8, 'sadsad', '2023-07-07 22:08:05', 11, 1, 'http://127.0.0.1:3000/img/_1688781362118_7904116ac6c3f4ed9fc9aff00.png'),(9, 'sss', '2023-07-07 22:47:38', 11, 1, 'http://127.0.0.1:3000/img/_1688781362118_7904116ac6c3f4ed9fc9aff00.png'),(10, 'sdfasd', '2023-07-08 10:10:50', 12, 1, 'http://127.0.0.1:3000/img/98263639_p0_1688782206251_ac8f818ab0ec2167939870006.png'),(11, 'ddd', '2023-07-08 10:12:09', 12, 1, NULL),(12, '1111', '2023-07-09 12:12:46', 12, 1, NULL),(13, '1111', '2023-07-09 12:13:22', 12, 1, 'http://127.0.0.1:3000/img/_1688875978428_88077d0128023c648884f7d04.png,http://127.0.0.1:3000/img/~)HW6P$4Y5K`MES1}]VVAW2_1688875980134_88077d0128023c648884f7d05.png,http://127.0.0.1:3000/img/123_1688875985319_88077d0128023c648884f7d06.png,http://127.0.0.1:3000/img/-6b4ea9fdfa92c8e8_1688876000452_88077d0128023c648884f7d07.jpg'),(14, 'ass we can', '2023-07-09 17:26:32', 11, 1, 'http://127.0.0.1:3000/img/QQ图片20230511203639_1688894787571_48d7be77f232304356023410f.jpg'),(15, 'asdsad', '2023-07-09 17:57:21', 12, 1, NULL),(16, 'sadasd', '2023-07-09 17:59:59', 12, 1, NULL),(17, '18点00分', '2023-07-09 18:00:07', 12, 1, NULL),(18, '时间名', '2023-07-09 18:00:33', 12, 1, NULL),(19, 'yes we can', '2023-07-09 18:00:47', 11, 1, NULL),(20, 'dsfsdf', '2023-07-09 18:06:54', 11, 1, NULL),(21, 'sadsa', '2023-07-09 18:18:13', 12, 1, NULL),(22, 'asdsad', '2023-07-09 18:18:19', 12, 1, 'http://127.0.0.1:3000/img/_1688897897283_48d7be77f2323043560234110.png'),(23, 'dsfdsf        ', '2023-07-09 18:28:22', 11, 1, NULL),(24, '呃呃呃', '2023-07-14 20:34:43', 13, 1, 'http://127.0.0.1:3000/img/_1689338079949_013867edc426d0a52d0086f03.png');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user` WRITE;
DELETE FROM `tie_bar_lower`.`user`;
INSERT INTO `tie_bar_lower`.`user` (`uid`,`username`,`password`,`createTime`,`avatar`,`state`) VALUES (1, 'admin', '123456', '2023-05-29 15:28:10', 'http://127.0.0.1:3000/img/_1688781362118_7904116ac6c3f4ed9fc9aff00.png', 1),(2, '傅丽', '111111', '2023-05-29 20:24:37', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1),(3, '张军', '123456', '2023-05-29 20:55:34', 'http://127.0.0.1:3000/img/_1688781362118_7904116ac6c3f4ed9fc9aff00.png', 0),(4, '七喜128', '123456', '2023-05-29 21:17:24', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1),(5, 'CeCe123', '123456', '2023-05-30 11:14:02', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f74.png', 1),(6, '张三', '1111111', '2023-06-23 17:06:40', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1),(7, '李四', '111111', '2023-06-23 17:07:56', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1),(8, '王老二', '123456', '2023-07-02 12:10:17', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1);
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_follow_bar` WRITE;
DELETE FROM `tie_bar_lower`.`user_follow_bar`;
INSERT INTO `tie_bar_lower`.`user_follow_bar` (`uid`,`bid`,`createTime`) VALUES (2, 1, '2023-06-07 21:38:49'),(4, 1, '2023-06-07 21:39:02'),(1, 3, '2023-07-01 19:48:45'),(1, 4, '2023-07-02 12:31:29'),(1, 7, '2023-07-08 10:23:39'),(1, 1, '2023-07-10 20:48:58');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_follow_user` WRITE;
DELETE FROM `tie_bar_lower`.`user_follow_user`;
INSERT INTO `tie_bar_lower`.`user_follow_user` (`uid`,`uid_is_followed`,`createTime`) VALUES (2, 1, '2023-06-06 21:51:18'),(6, 1, '2023-06-23 23:13:48'),(1, 4, '2023-07-01 16:51:59'),(3, 1, '2023-07-02 11:56:44'),(3, 2, '2023-07-02 11:57:07'),(7, 1, '2023-07-02 11:59:27'),(1, 6, '2023-07-02 15:29:01'),(1, 7, '2023-07-11 20:38:58');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_like_article` WRITE;
DELETE FROM `tie_bar_lower`.`user_like_article`;
INSERT INTO `tie_bar_lower`.`user_like_article` (`aid`,`uid`,`createTime`) VALUES (1, 1, '2023-06-08 22:00:31'),(1, 2, '2023-06-11 18:19:09'),(2, 2, '2023-06-11 18:19:20'),(4, 1, '2023-06-11 18:19:25'),(5, 2, '2023-06-11 18:19:26'),(6, 2, '2023-06-11 18:19:30'),(9, 1, '2023-06-18 10:33:42'),(1, 4, '2023-06-18 17:39:55'),(5, 1, '2023-07-01 19:46:41'),(11, 1, '2023-07-09 20:08:45'),(12, 1, '2023-07-11 20:39:47');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_like_comment` WRITE;
DELETE FROM `tie_bar_lower`.`user_like_comment`;
INSERT INTO `tie_bar_lower`.`user_like_comment` (`cid`,`uid`,`createTime`) VALUES (1, 1, '2023-06-11 12:13:05'),(3, 1, '2023-06-11 15:46:00'),(3, 2, '2023-06-11 15:46:39'),(8, 1, '2023-07-09 16:24:08'),(9, 1, '2023-07-09 16:24:10'),(23, 1, '2023-07-09 20:15:06'),(10, 1, '2023-07-10 20:49:23');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_star_article` WRITE;
DELETE FROM `tie_bar_lower`.`user_star_article`;
INSERT INTO `tie_bar_lower`.`user_star_article` (`uid`,`aid`,`createTime`) VALUES (1, 2, '2023-06-11 16:14:30'),(2, 2, '2023-06-11 18:19:36'),(2, 1, '2023-06-11 18:19:40'),(2, 5, '2023-06-11 18:19:42'),(4, 1, '2023-06-18 17:39:19'),(1, 4, '2023-07-01 09:56:15'),(1, 9, '2023-07-01 10:20:06'),(1, 5, '2023-07-01 11:28:50'),(1, 11, '2023-07-09 20:11:18');
UNLOCK TABLES;
COMMIT;
