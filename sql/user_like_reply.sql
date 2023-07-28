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

 Date: 27/07/2023 18:23:11
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_like_reply
-- ----------------------------
DROP TABLE IF EXISTS `user_like_reply`;
CREATE TABLE `user_like_reply`  (
  `rid` int(0) NOT NULL,
  `uid` int(0) NOT NULL,
  `createTime` datetime(0) NULL DEFAULT NULL,
  INDEX `uid_like_reply`(`uid`) USING BTREE,
  INDEX `rid_like_reply`(`rid`) USING BTREE,
  CONSTRAINT `rid_like_reply` FOREIGN KEY (`rid`) REFERENCES `user_reply_comment` (`rid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_like_reply` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_like_reply
-- ----------------------------
INSERT INTO `user_like_reply` VALUES (15, 1, '2023-07-24 15:14:12');
INSERT INTO `user_like_reply` VALUES (16, 1, '2023-07-24 16:58:40');
INSERT INTO `user_like_reply` VALUES (16, 2, '2023-07-24 17:13:56');
INSERT INTO `user_like_reply` VALUES (17, 1, '2023-07-24 17:57:56');
INSERT INTO `user_like_reply` VALUES (18, 1, '2023-07-24 17:57:59');
INSERT INTO `user_like_reply` VALUES (19, 1, '2023-07-24 17:58:03');
INSERT INTO `user_like_reply` VALUES (20, 1, '2023-07-24 17:58:07');
INSERT INTO `user_like_reply` VALUES (21, 1, '2023-07-24 17:58:10');

SET FOREIGN_KEY_CHECKS = 1;
