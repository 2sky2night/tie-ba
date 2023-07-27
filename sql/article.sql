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

 Date: 27/07/2023 18:21:15
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for article
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article`  (
  `aid` int(0) NOT NULL AUTO_INCREMENT COMMENT '帖子的id',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '帖子的标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '帖子的内容',
  `createTime` datetime(0) NULL DEFAULT NULL COMMENT '发帖的时间',
  `bid` int(0) NULL DEFAULT NULL COMMENT '吧的id',
  `uid` int(0) NULL DEFAULT NULL COMMENT '用户的id',
  `photo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '帖子的配图',
  PRIMARY KEY (`aid`) USING BTREE,
  INDEX `uid_acrticle`(`uid`) USING BTREE,
  INDEX `bid_acrticle`(`bid`) USING BTREE,
  CONSTRAINT `bid_acrticle` FOREIGN KEY (`bid`) REFERENCES `bar` (`bid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_acrticle` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 61 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of article
-- ----------------------------
INSERT INTO `article` VALUES (1, '测试', '测试帖子的👌', '2023-06-08 18:12:18', 1, 1, NULL);
INSERT INTO `article` VALUES (2, '测试帖子01', '测试帖子', '2023-06-09 09:57:26', 1, 3, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (3, '测试帖子02', '测试帖子', '2023-06-09 10:17:29', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (4, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-06-12 10:33:43', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (5, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-06-13 15:58:20', 1, 2, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (6, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-06-16 18:43:15', 1, 3, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (7, '参低满状素文', 'anim', '2023-06-20 11:04:23', 4, 4, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (8, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:52', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (9, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:53', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (10, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:53', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (11, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:54', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (12, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:54', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (13, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:55', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (14, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:55', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (15, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:56', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (16, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:56', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (17, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:57', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (18, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:57', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (19, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:58', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (20, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:58', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (21, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:59', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (22, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:20:59', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (23, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:00', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (24, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:02', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (25, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:03', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (26, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:03', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (27, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:04', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (28, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:04', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (29, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:06', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (30, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:07', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (31, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:08', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (32, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-06 16:21:09', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (33, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-07 11:09:58', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (34, '养示按连使', 'laboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud suntlaboris incididunt nostrud sunt', '2023-07-07 14:24:32', 2, 1, NULL);
INSERT INTO `article` VALUES (35, '法程人她', 'voluptate Lorem adipisicing do fugiat', '2023-07-13 16:09:35', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (36, '法程人她111', 'voluptate Lorem adipisicing do fugiat', '2023-07-13 16:09:50', 1, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (37, '法程人她222', 'voluptate Lorem adipisicing do fugiat', '2023-07-13 16:13:03', 1, 1, NULL);
INSERT INTO `article` VALUES (38, '法程人她111', 'voluptate Lorem adipisicing do fugiat', '2023-07-13 16:15:08', 1, 1, NULL);
INSERT INTO `article` VALUES (39, 'asdsa', '花花', '2023-07-14 10:52:52', 8, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (40, 'sd', 'sada', '2023-07-14 11:03:53', 19, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (41, 'saddddddddd', 'sadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsadddddddddsaddddddddd', '2023-07-14 11:06:07', 18, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (42, 'asdsadsad', 'asdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadadsasdasdasdsadads', '2023-07-14 11:08:14', 17, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (45, 'ddddddddddddddd', 'ddddddddddddddd', '2023-07-14 16:51:13', 2, 1, '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `article` VALUES (47, '测', '嘎嘎嘎', '2023-07-14 17:07:33', 19, 1, NULL);

SET FOREIGN_KEY_CHECKS = 1;
