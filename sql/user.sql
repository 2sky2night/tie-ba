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

 Date: 27/07/2023 18:22:22
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `uid` int(0) NOT NULL AUTO_INCREMENT COMMENT '用户的id',
  `username` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户的名称',
  `password` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户的密码',
  `createTime` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `avatar` varchar(999) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'http://127.0.0.1:3000/img/default_avatar.png' COMMENT '头像地址',
  `state` tinyint(0) NULL DEFAULT 1 COMMENT '用户的状态 0注销 1正常用户',
  `udesc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '这个人很懒，简介都不写呢~' COMMENT '用户简介',
  PRIMARY KEY (`uid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'admin', '123456', '2023-05-29 15:28:10', '/img/image-20230620172137194_1689652047859_055c654dfbc81b97a1bde9701.png', 1, '再见~');
INSERT INTO `user` VALUES (2, '郭军', '123456', '2023-05-29 20:24:37', '/img/image-20230620172137194_1689652047859_055c654dfbc81b97a1bde9701.png', 1, '这个人很懒，简介都不写呢~');
INSERT INTO `user` VALUES (3, '张军', '123456', '2023-05-29 20:55:34', '/img/image-20230620172137194_1689652047859_055c654dfbc81b97a1bde9701.png', 0, '这个人很懒，简介都不写呢~');
INSERT INTO `user` VALUES (4, '七喜128', '123456', '2023-05-29 21:17:24', '/img/image-20230620172137194_1689652047859_055c654dfbc81b97a1bde9701.png', 1, '这个人很懒，简介都不写呢~');
INSERT INTO `user` VALUES (5, 'Mark', '123456', '2023-05-30 11:14:02', '/img/image-20230620172137194_1689652047859_055c654dfbc81b97a1bde9701.png', 1, '这个人很懒，简介都不写呢~');
INSERT INTO `user` VALUES (6, 'Mark1', '123456', '2023-06-21 17:33:07', '/img/image-20230620172137194_1689652047859_055c654dfbc81b97a1bde9701.png', 1, '这个人很懒，简介都不写呢~');
INSERT INTO `user` VALUES (7, 'Mark11', '12456', '2023-06-21 17:34:01', '/img/image-20230620172137194_1689652047859_055c654dfbc81b97a1bde9701.png', 1, '这个人很懒，简介都不写呢~');
INSERT INTO `user` VALUES (8, 'wocao', '123456', '2023-07-10 16:19:06', '/img/image-20230620172137194_1689652047859_055c654dfbc81b97a1bde9701.png', 1, '这个人很懒，简介都不写呢~');
INSERT INTO `user` VALUES (9, 'kk', '111111', '2023-07-11 10:31:43', '/img/image-20230620172137194_1689652047859_055c654dfbc81b97a1bde9701.png', 1, '这个人很懒，简介都不写呢~');
INSERT INTO `user` VALUES (12, 'kk888', '111111', '2023-07-18 18:09:26', '/img/image-20230620172137194_1689652047859_055c654dfbc81b97a1bde9701.png', 1, '这个人很懒，简介都不写呢~');
INSERT INTO `user` VALUES (13, 'kk899', '111111', '2023-07-18 18:17:38', '/img/image-20230620172137194_1689652047859_055c654dfbc81b97a1bde9701.png', 1, '这个人很懒，简介都不写呢~');

SET FOREIGN_KEY_CHECKS = 1;
