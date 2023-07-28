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

 Date: 28/07/2023 16:05:42
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_like_article
-- ----------------------------
DROP TABLE IF EXISTS `user_like_article`;
CREATE TABLE `user_like_article`  (
  `aid` int(0) NOT NULL COMMENT '文章的id',
  `uid` int(0) NULL DEFAULT NULL COMMENT '用户的id',
  `createTime` datetime(0) NULL DEFAULT NULL COMMENT '点赞帖子的时间',
  INDEX `uid_like_article`(`uid`) USING BTREE,
  INDEX `aid_like_article`(`aid`) USING BTREE,
  CONSTRAINT `aid_like_article` FOREIGN KEY (`aid`) REFERENCES `article` (`aid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_like_article` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_like_article
-- ----------------------------
INSERT INTO `user_like_article` VALUES (2, 1, '2023-06-09 11:02:10');
INSERT INTO `user_like_article` VALUES (1, 2, '2023-06-12 10:28:10');
INSERT INTO `user_like_article` VALUES (4, 1, '2023-06-12 10:36:52');
INSERT INTO `user_like_article` VALUES (2, 2, '2023-06-12 11:16:53');
INSERT INTO `user_like_article` VALUES (3, 2, '2023-06-12 11:16:55');
INSERT INTO `user_like_article` VALUES (4, 2, '2023-06-12 11:16:58');
INSERT INTO `user_like_article` VALUES (3, 1, '2023-07-05 14:57:46');
INSERT INTO `user_like_article` VALUES (7, 1, '2023-07-06 15:14:31');
INSERT INTO `user_like_article` VALUES (33, 1, '2023-07-10 14:22:05');
INSERT INTO `user_like_article` VALUES (34, 8, '2023-07-10 16:19:31');
INSERT INTO `user_like_article` VALUES (1, 9, '2023-07-11 10:40:22');
INSERT INTO `user_like_article` VALUES (38, 1, '2023-07-13 18:15:44');
INSERT INTO `user_like_article` VALUES (41, 1, '2023-07-14 11:07:05');
INSERT INTO `user_like_article` VALUES (45, 1, '2023-07-14 16:51:20');
INSERT INTO `user_like_article` VALUES (34, 1, '2023-07-17 17:25:26');
INSERT INTO `user_like_article` VALUES (31, 13, '2023-07-18 18:44:20');
INSERT INTO `user_like_article` VALUES (1, 1, '2023-07-24 15:44:16');

SET FOREIGN_KEY_CHECKS = 1;
