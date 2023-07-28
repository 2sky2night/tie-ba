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

 Date: 28/07/2023 16:05:17
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_check_bar
-- ----------------------------
DROP TABLE IF EXISTS `user_check_bar`;
CREATE TABLE `user_check_bar`  (
  `uid` int(0) NOT NULL,
  `bid` int(0) NULL DEFAULT NULL,
  `is_checked` tinyint(0) NULL DEFAULT 0 COMMENT '用户签到吧的状态 0未签到 1签到了',
  `score` bigint(0) NULL DEFAULT 0 COMMENT '签到的得分，每次签到+5分？',
  PRIMARY KEY (`uid`) USING BTREE,
  INDEX `bid_user_check_bar`(`bid`) USING BTREE,
  CONSTRAINT `bid_user_check_bar` FOREIGN KEY (`bid`) REFERENCES `bar` (`bid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_user_check_bar` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_check_bar
-- ----------------------------
INSERT INTO `user_check_bar` VALUES (1, 1, 0, 25);
INSERT INTO `user_check_bar` VALUES (12, 19, 0, 0);

SET FOREIGN_KEY_CHECKS = 1;
