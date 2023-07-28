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

 Date: 27/07/2023 18:23:35
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_reply_comment
-- ----------------------------
DROP TABLE IF EXISTS `user_reply_comment`;
CREATE TABLE `user_reply_comment`  (
  `rid` int(0) NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `createTime` datetime(0) NULL DEFAULT NULL,
  `uid` int(0) NULL DEFAULT NULL,
  `id` int(0) NULL DEFAULT NULL COMMENT 'id，记录评论的id或回复的id',
  `type` tinyint(0) NULL DEFAULT NULL COMMENT '1回复评论 2对回复进行回复',
  `cid` int(0) NULL DEFAULT NULL COMMENT '评论的id',
  PRIMARY KEY (`rid`) USING BTREE,
  INDEX `uid_reply_comment`(`uid`) USING BTREE,
  INDEX `cid_reply_comment`(`cid`) USING BTREE,
  CONSTRAINT `cid_reply_comment` FOREIGN KEY (`cid`) REFERENCES `comment` (`cid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_reply_comment` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 102 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_reply_comment
-- ----------------------------
INSERT INTO `user_reply_comment` VALUES (15, '回复1', '2023-07-24 15:12:35', 1, 1, 1, 1);
INSERT INTO `user_reply_comment` VALUES (16, '回复的回复1', '2023-07-24 15:13:29', 1, 15, 2, 1);
INSERT INTO `user_reply_comment` VALUES (17, 'ipsum culpa', '2023-07-24 15:16:49', 1, 1, 1, 1);
INSERT INTO `user_reply_comment` VALUES (18, 'ipsum culpa', '2023-07-24 17:57:49', 1, 2, 1, 2);
INSERT INTO `user_reply_comment` VALUES (19, 'ipsum culpa', '2023-07-24 17:57:50', 1, 2, 1, 2);
INSERT INTO `user_reply_comment` VALUES (20, 'ipsum culpa', '2023-07-24 17:57:50', 1, 2, 1, 2);
INSERT INTO `user_reply_comment` VALUES (21, 'ipsum culpa', '2023-07-24 17:57:51', 1, 2, 1, 2);
INSERT INTO `user_reply_comment` VALUES (22, 'ipsum culpa', '2023-07-24 17:57:51', 1, 2, 1, 2);
INSERT INTO `user_reply_comment` VALUES (23, 'ipsum culpa', '2023-07-24 17:58:19', 1, 15, 1, 15);
INSERT INTO `user_reply_comment` VALUES (24, 'ipsum culpa', '2023-07-24 17:58:57', 1, 23, 2, 15);
INSERT INTO `user_reply_comment` VALUES (25, '毛知被当根通压育统音做机全两般上也加。', '2023-07-25 10:09:25', 1, 15, 2, 1);
INSERT INTO `user_reply_comment` VALUES (102, 'asdasd', '2023-07-27 17:14:01', 1, 62, 1, 62);
INSERT INTO `user_reply_comment` VALUES (103, 'sadasd', '2023-07-27 17:14:05', 1, 102, 2, 62);
INSERT INTO `user_reply_comment` VALUES (104, 'asdasdasd', '2023-07-27 17:14:08', 1, 103, 2, 62);
INSERT INTO `user_reply_comment` VALUES (105, 'asdadasd', '2023-07-27 17:14:10', 1, 104, 2, 62);

SET FOREIGN_KEY_CHECKS = 1;
