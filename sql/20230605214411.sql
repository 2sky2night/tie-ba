/*
MySQL Backup
Database: tie_bar_lower
Backup Time: 2023-06-05 21:44:11
*/

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `tie_bar_lower`.`acrticle`;
DROP TABLE IF EXISTS `tie_bar_lower`.`bar`;
DROP TABLE IF EXISTS `tie_bar_lower`.`comment`;
DROP TABLE IF EXISTS `tie_bar_lower`.`user`;
DROP TABLE IF EXISTS `tie_bar_lower`.`user_follow_bar`;
DROP TABLE IF EXISTS `tie_bar_lower`.`user_follow_user`;
DROP TABLE IF EXISTS `tie_bar_lower`.`user_like_article`;
DROP TABLE IF EXISTS `tie_bar_lower`.`user_like_comment`;
CREATE TABLE `acrticle` (
  `aid` int NOT NULL AUTO_INCREMENT COMMENT '帖子的id',
  `content` varchar(9999) DEFAULT NULL COMMENT '帖子的内容',
  `createTime` datetime DEFAULT NULL COMMENT '发帖的时间',
  `bid` int DEFAULT NULL COMMENT '吧的id',
  `uid` int DEFAULT NULL COMMENT '用户的id',
  PRIMARY KEY (`aid`),
  KEY `uid_acrticle` (`uid`),
  KEY `bid_acrticle` (`bid`),
  CONSTRAINT `bid_acrticle` FOREIGN KEY (`bid`) REFERENCES `bar` (`bid`),
  CONSTRAINT `uid_acrticle` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `bar` (
  `bid` int NOT NULL AUTO_INCREMENT COMMENT '吧的id',
  `bname` varchar(255) DEFAULT NULL COMMENT '吧的名称',
  `createTime` datetime DEFAULT NULL COMMENT '吧创建的时间',
  `uid` int DEFAULT NULL COMMENT '用户的id',
  `bdesc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '' COMMENT '吧的描述',
  `photo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '吧的头像',
  PRIMARY KEY (`bid`),
  KEY `uid_bar` (`uid`),
  CONSTRAINT `uid_bar` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `comment` (
  `cid` int NOT NULL AUTO_INCREMENT COMMENT '评论的id',
  `content` varchar(9999) DEFAULT NULL COMMENT '评论的内容',
  `createTime` datetime DEFAULT NULL COMMENT '评论的时间',
  `aid` int DEFAULT NULL COMMENT '帖子的id',
  `uid` int DEFAULT NULL COMMENT '用户的id',
  PRIMARY KEY (`cid`),
  KEY `uid_comment` (`uid`),
  KEY `aid_comment` (`aid`),
  CONSTRAINT `aid_comment` FOREIGN KEY (`aid`) REFERENCES `acrticle` (`aid`),
  CONSTRAINT `uid_comment` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `user` (
  `uid` int NOT NULL AUTO_INCREMENT COMMENT '用户的id',
  `username` varchar(20) DEFAULT NULL COMMENT '用户的名称',
  `password` varchar(20) DEFAULT NULL COMMENT '用户的密码',
  `createTime` datetime DEFAULT NULL COMMENT '创建时间',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png' COMMENT '头像地址',
  `state` tinyint DEFAULT '1' COMMENT '用户的状态 0注销 1正常用户',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `creatTime` datetime DEFAULT NULL COMMENT '点赞帖子的时间',
  PRIMARY KEY (`aid`),
  KEY `uid_like_article` (`uid`),
  CONSTRAINT `aid_like_article` FOREIGN KEY (`aid`) REFERENCES `acrticle` (`aid`),
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
BEGIN;
LOCK TABLES `tie_bar_lower`.`acrticle` WRITE;
DELETE FROM `tie_bar_lower`.`acrticle`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`bar` WRITE;
DELETE FROM `tie_bar_lower`.`bar`;
INSERT INTO `tie_bar_lower`.`bar` (`bid`,`bname`,`createTime`,`uid`,`bdesc`,`photo`) VALUES (1, '重庆', '2023-05-30 11:08:43', 1, '行千里致广大', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(2, '北京', '2023-05-30 13:39:24', 1, '我爱北京!', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(3, '软件测试', '2023-05-30 13:44:18', 1, '软件测试交流吧！', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(4, 'react', '2023-05-30 13:45:04', 1, '探讨react的交流，工作、求职等等知识', 'https://www.runoob.com/wp-content/uploads/2017/01/vue.png'),(5, '我的世界', '2023-05-30 15:07:35', 1, '欢迎来到我的世界吧!', 'http://127.0.0.1:3000/img/d69b93c7fb69bf4a6847c2500.png'),(6, '英雄联盟', '2023-05-30 15:07:35', 1, '欢迎来到英雄联盟吧!', 'http://127.0.0.1:3000/img/d69b93c7fb69bf4a6847c2500.png'),(7, '赛马娘', '2023-05-30 15:13:34', 1, '欢迎来到赛马娘吧!', 'http://127.0.0.1:3000/img/d69b93c7fb69bf4a6847c2500.png');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`comment` WRITE;
DELETE FROM `tie_bar_lower`.`comment`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user` WRITE;
DELETE FROM `tie_bar_lower`.`user`;
INSERT INTO `tie_bar_lower`.`user` (`uid`,`username`,`password`,`createTime`,`avatar`,`state`) VALUES (1, 'admin', '123456', '2023-05-29 15:28:10', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1),(2, '郭军', '123456', '2023-05-29 20:24:37', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1),(3, '张军', '123456', '2023-05-29 20:55:34', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 0),(4, '七喜128', '123456', '2023-05-29 21:17:24', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1),(5, 'Mark', '123456', '2023-05-30 11:14:02', 'https://www.logolynx.com/images/logolynx/83/83926e17372ac03d71e799e3d1812f73.png', 1);
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_follow_bar` WRITE;
DELETE FROM `tie_bar_lower`.`user_follow_bar`;
INSERT INTO `tie_bar_lower`.`user_follow_bar` (`uid`,`bid`,`createTime`) VALUES (1, 3, '2023-05-30 21:43:36'),(1, 1, '2023-05-30 22:07:41');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_follow_user` WRITE;
DELETE FROM `tie_bar_lower`.`user_follow_user`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_like_article` WRITE;
DELETE FROM `tie_bar_lower`.`user_like_article`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `tie_bar_lower`.`user_like_comment` WRITE;
DELETE FROM `tie_bar_lower`.`user_like_comment`;
UNLOCK TABLES;
COMMIT;
