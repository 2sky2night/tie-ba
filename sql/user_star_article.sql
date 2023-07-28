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

 Date: 28/07/2023 16:06:07
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_star_article
-- ----------------------------
DROP TABLE IF EXISTS `user_star_article`;
CREATE TABLE `user_star_article`  (
  `uid` int(0) NOT NULL,
  `aid` int(0) NOT NULL,
  `createTime` datetime(0) NOT NULL,
  INDEX `aid_star`(`aid`) USING BTREE,
  INDEX `uid_star`(`uid`) USING BTREE,
  CONSTRAINT `aid_star` FOREIGN KEY (`aid`) REFERENCES `article` (`aid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_star` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_star_article
-- ----------------------------
INSERT INTO `user_star_article` VALUES (1, 2, '2023-06-09 11:29:23');
INSERT INTO `user_star_article` VALUES (1, 3, '2023-06-09 18:48:45');
INSERT INTO `user_star_article` VALUES (2, 2, '2023-06-12 10:28:17');
INSERT INTO `user_star_article` VALUES (2, 4, '2023-06-12 10:43:12');
INSERT INTO `user_star_article` VALUES (2, 3, '2023-06-12 11:16:25');
INSERT INTO `user_star_article` VALUES (2, 1, '2023-06-12 11:16:32');
INSERT INTO `user_star_article` VALUES (2, 5, '2023-06-13 15:58:31');
INSERT INTO `user_star_article` VALUES (1, 7, '2023-07-06 15:14:35');
INSERT INTO `user_star_article` VALUES (1, 32, '2023-07-06 17:50:13');
INSERT INTO `user_star_article` VALUES (1, 33, '2023-07-07 11:31:38');
INSERT INTO `user_star_article` VALUES (1, 22, '2023-07-10 15:55:10');
INSERT INTO `user_star_article` VALUES (1, 34, '2023-07-10 15:55:53');
INSERT INTO `user_star_article` VALUES (8, 34, '2023-07-10 16:19:30');
INSERT INTO `user_star_article` VALUES (1, 1, '2023-07-11 17:19:25');
INSERT INTO `user_star_article` VALUES (1, 42, '2023-07-14 14:23:16');

SET FOREIGN_KEY_CHECKS = 1;
