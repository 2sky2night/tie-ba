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

 Date: 27/07/2023 18:22:48
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_follow_user
-- ----------------------------
DROP TABLE IF EXISTS `user_follow_user`;
CREATE TABLE `user_follow_user`  (
  `uid` int(0) NULL DEFAULT NULL COMMENT '关注用户的用户id',
  `uid_is_followed` int(0) NULL DEFAULT NULL COMMENT '被关注的用户id',
  `createTime` datetime(0) NULL DEFAULT NULL,
  INDEX `uid_follow_user`(`uid`) USING BTREE,
  INDEX `uid_is_followed_follow_user`(`uid_is_followed`) USING BTREE,
  CONSTRAINT `uid_follow_user` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_is_followed_follow_user` FOREIGN KEY (`uid_is_followed`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_follow_user
-- ----------------------------
INSERT INTO `user_follow_user` VALUES (1, 5, '2023-06-06 14:37:40');
INSERT INTO `user_follow_user` VALUES (2, 3, '2023-06-12 10:35:18');
INSERT INTO `user_follow_user` VALUES (2, 1, '2023-06-12 10:35:20');
INSERT INTO `user_follow_user` VALUES (2, 4, '2023-06-12 10:35:22');
INSERT INTO `user_follow_user` VALUES (3, 1, '2023-06-25 10:13:19');
INSERT INTO `user_follow_user` VALUES (1, 8, '2023-07-10 17:07:13');
INSERT INTO `user_follow_user` VALUES (9, 1, '2023-07-11 10:40:14');
INSERT INTO `user_follow_user` VALUES (1, 9, '2023-07-11 16:22:21');
INSERT INTO `user_follow_user` VALUES (1, 2, '2023-07-18 10:32:19');
INSERT INTO `user_follow_user` VALUES (1, 3, '2023-07-18 11:03:06');
INSERT INTO `user_follow_user` VALUES (1, 4, '2023-07-18 11:03:13');
INSERT INTO `user_follow_user` VALUES (1, 6, '2023-07-18 11:03:24');
INSERT INTO `user_follow_user` VALUES (1, 7, '2023-07-18 11:03:37');
INSERT INTO `user_follow_user` VALUES (8, 1, '2023-07-18 11:48:42');

SET FOREIGN_KEY_CHECKS = 1;
