/*
 Navicat MySQL Data Transfer

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Server Version : 80033
 Source Host           : localhost:3306
 Source Schema         : tie_bar_lower

 Target Server Type    : MySQL
 Target Server Version : 80033
 File Encoding         : 65001

 Date: 28/07/2023 16:05:48
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_like_comment
-- ----------------------------
DROP TABLE IF EXISTS `user_like_comment`;
CREATE TABLE `user_like_comment`  (
  `cid` int(0) NULL DEFAULT NULL COMMENT '评论的id',
  `uid` int(0) NULL DEFAULT NULL COMMENT '用户的id',
  `createTime` datetime(0) NULL DEFAULT NULL COMMENT '点赞评论的时间',
  INDEX `cid_like_comment`(`cid`) USING BTREE,
  INDEX `uid_like_comment`(`uid`) USING BTREE,
  CONSTRAINT `cid_like_comment` FOREIGN KEY (`cid`) REFERENCES `comment` (`cid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_like_comment` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_like_comment
-- ----------------------------
INSERT INTO `user_like_comment` VALUES (1, 2, '2023-06-13 17:14:50');
INSERT INTO `user_like_comment` VALUES (2, 2, '2023-06-13 17:14:54');
INSERT INTO `user_like_comment` VALUES (5, 1, '2023-06-19 17:32:18');
INSERT INTO `user_like_comment` VALUES (7, 1, '2023-06-20 14:05:35');
INSERT INTO `user_like_comment` VALUES (2, 3, '2023-06-20 14:05:40');
INSERT INTO `user_like_comment` VALUES (4, 1, '2023-06-20 14:05:48');
INSERT INTO `user_like_comment` VALUES (6, 4, '2023-06-20 14:05:54');
INSERT INTO `user_like_comment` VALUES (8, 1, '2023-06-20 14:06:01');
INSERT INTO `user_like_comment` VALUES (9, 1, '2023-06-20 14:06:04');
INSERT INTO `user_like_comment` VALUES (10, 1, '2023-06-20 14:06:07');
INSERT INTO `user_like_comment` VALUES (11, 1, '2023-06-20 14:06:10');
INSERT INTO `user_like_comment` VALUES (7, 5, '2023-06-20 14:08:15');
INSERT INTO `user_like_comment` VALUES (1, 5, '2023-06-20 14:08:17');
INSERT INTO `user_like_comment` VALUES (2, 4, '2023-06-20 14:08:19');
INSERT INTO `user_like_comment` VALUES (3, 5, '2023-06-20 14:08:21');
INSERT INTO `user_like_comment` VALUES (4, 5, '2023-06-20 14:08:22');
INSERT INTO `user_like_comment` VALUES (5, 5, '2023-06-20 14:08:24');
INSERT INTO `user_like_comment` VALUES (6, 5, '2023-06-20 14:08:26');
INSERT INTO `user_like_comment` VALUES (8, 5, '2023-06-20 14:08:30');
INSERT INTO `user_like_comment` VALUES (9, 5, '2023-06-20 14:08:33');
INSERT INTO `user_like_comment` VALUES (10, 5, '2023-06-20 14:08:37');
INSERT INTO `user_like_comment` VALUES (1, 4, '2023-06-20 14:17:18');
INSERT INTO `user_like_comment` VALUES (5, 4, '2023-06-20 14:20:56');
INSERT INTO `user_like_comment` VALUES (12, 1, '2023-07-10 09:49:24');
INSERT INTO `user_like_comment` VALUES (13, 1, '2023-07-10 09:49:25');
INSERT INTO `user_like_comment` VALUES (22, 1, '2023-07-10 14:26:14');
INSERT INTO `user_like_comment` VALUES (20, 1, '2023-07-10 15:47:19');
INSERT INTO `user_like_comment` VALUES (24, 1, '2023-07-10 15:58:23');
INSERT INTO `user_like_comment` VALUES (16, 1, '2023-07-10 16:18:43');
INSERT INTO `user_like_comment` VALUES (15, 1, '2023-07-10 16:18:46');
INSERT INTO `user_like_comment` VALUES (14, 1, '2023-07-10 16:18:47');
INSERT INTO `user_like_comment` VALUES (17, 1, '2023-07-10 16:18:49');
INSERT INTO `user_like_comment` VALUES (12, 8, '2023-07-10 16:19:37');
INSERT INTO `user_like_comment` VALUES (1, 1, '2023-07-18 10:05:18');
INSERT INTO `user_like_comment` VALUES (2, 1, '2023-07-27 15:53:23');

SET FOREIGN_KEY_CHECKS = 1;
