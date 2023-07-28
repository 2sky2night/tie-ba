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

 Date: 27/07/2023 18:22:04
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for comment
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment`  (
  `cid` int(0) NOT NULL AUTO_INCREMENT COMMENT '评论的id',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '评论的内容',
  `createTime` datetime(0) NULL DEFAULT NULL COMMENT '评论的时间',
  `aid` int(0) NULL DEFAULT NULL COMMENT '帖子的id',
  `uid` int(0) NULL DEFAULT NULL COMMENT '用户的id',
  `photo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`cid`) USING BTREE,
  INDEX `uid_comment`(`uid`) USING BTREE,
  INDEX `aid_comment`(`aid`) USING BTREE,
  CONSTRAINT `aid_comment` FOREIGN KEY (`aid`) REFERENCES `article` (`aid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_comment` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 62 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comment
-- ----------------------------
INSERT INTO `comment` VALUES (1, 'ea Duis', '2023-06-12 09:46:55', 1, 2, NULL);
INSERT INTO `comment` VALUES (2, 'culpa', '2023-06-12 09:47:20', 1, 2, NULL);
INSERT INTO `comment` VALUES (3, '你好啊', '2023-06-19 16:51:53', 1, 1, NULL);
INSERT INTO `comment` VALUES (4, 'fugiat minim officia non cillum', '2023-06-19 16:52:55', 2, 1, NULL);
INSERT INTO `comment` VALUES (5, '大瓜法国', '2023-06-19 16:53:21', 3, 1, NULL);
INSERT INTO `comment` VALUES (6, 'culpa', '2023-06-20 10:03:18', 4, 1, NULL);
INSERT INTO `comment` VALUES (7, 'culpa', '2023-06-20 10:03:20', 4, 1, NULL);
INSERT INTO `comment` VALUES (8, 'culpa', '2023-06-20 10:03:20', 4, 1, NULL);
INSERT INTO `comment` VALUES (9, 'culpa', '2023-06-20 10:03:21', 4, 1, NULL);
INSERT INTO `comment` VALUES (10, 'culpa', '2023-06-20 10:20:29', 5, 1, NULL);
INSERT INTO `comment` VALUES (11, 'culpa', '2023-06-20 11:30:18', 7, 1, NULL);
INSERT INTO `comment` VALUES (12, '你好啊', '2023-07-07 17:09:19', 34, 1, NULL);
INSERT INTO `comment` VALUES (13, '黑暗时代杀毒后', '2023-07-07 17:10:47', 34, 1, NULL);
INSERT INTO `comment` VALUES (14, '你太搞笑了', '2023-07-07 17:10:59', 34, 1, NULL);
INSERT INTO `comment` VALUES (15, 'asdasd', '2023-07-07 17:12:14', 34, 1, NULL);
INSERT INTO `comment` VALUES (16, 'asdasdasdasd', '2023-07-07 17:12:30', 34, 1, NULL);
INSERT INTO `comment` VALUES (17, 'asdasd', '2023-07-07 17:45:41', 34, 1, NULL);
INSERT INTO `comment` VALUES (18, 'asdsad', '2023-07-07 18:44:32', 33, 1, NULL);
INSERT INTO `comment` VALUES (19, '哈哈哈哈', '2023-07-10 11:52:51', 33, 1, NULL);
INSERT INTO `comment` VALUES (20, '大师傅士大夫', '2023-07-10 14:23:18', 33, 1, NULL);
INSERT INTO `comment` VALUES (21, 'adsad', '2023-07-10 14:23:34', 33, 1, NULL);
INSERT INTO `comment` VALUES (22, 'dddd', '2023-07-10 14:26:04', 33, 1, NULL);
INSERT INTO `comment` VALUES (23, '哈哈哈哈的😫😫😫', '2023-07-10 14:58:05', 1, 1, NULL);
INSERT INTO `comment` VALUES (24, '哈哈哈', '2023-07-10 15:58:18', 32, 1, NULL);
INSERT INTO `comment` VALUES (25, '十大', '2023-07-11 09:23:24', 34, 1, NULL);
INSERT INTO `comment` VALUES (26, 'asdsad', '2023-07-11 17:11:23', 34, 1, NULL);
INSERT INTO `comment` VALUES (27, 'asdasd', '2023-07-14 11:28:36', 39, 1, NULL);
INSERT INTO `comment` VALUES (28, 'jjjjjjj', '2023-07-14 14:23:06', 42, 1, NULL);
INSERT INTO `comment` VALUES (29, 'dddd', '2023-07-14 16:51:26', 45, 1, NULL);
INSERT INTO `comment` VALUES (30, 'dddd', '2023-07-14 16:51:32', 45, 1, NULL);
INSERT INTO `comment` VALUES (31, 'dddd', '2023-07-14 16:51:56', 45, 1, NULL);
INSERT INTO `comment` VALUES (62, 'asdsad', '2023-07-27 17:13:58', 47, 1, NULL);

SET FOREIGN_KEY_CHECKS = 1;
