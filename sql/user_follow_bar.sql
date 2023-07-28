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

 Date: 27/07/2023 18:22:41
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_follow_bar
-- ----------------------------
DROP TABLE IF EXISTS `user_follow_bar`;
CREATE TABLE `user_follow_bar`  (
  `uid` int(0) NULL DEFAULT NULL,
  `bid` int(0) NULL DEFAULT NULL,
  `createTime` datetime(0) NULL DEFAULT NULL,
  INDEX `uid_follow`(`uid`) USING BTREE,
  INDEX `bid_follow`(`bid`) USING BTREE,
  CONSTRAINT `bid_follow` FOREIGN KEY (`bid`) REFERENCES `bar` (`bid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `uid_follow` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_follow_bar
-- ----------------------------
INSERT INTO `user_follow_bar` VALUES (1, 1, '2023-07-27 18:01:36');

-- ----------------------------
-- Triggers structure for table user_follow_bar
-- ----------------------------
DROP TRIGGER IF EXISTS `tirgger_add_check_bar_table`;
delimiter ;;
CREATE TRIGGER `tirgger_add_check_bar_table` AFTER INSERT ON `user_follow_bar` FOR EACH ROW BEGIN
	INSERT into user_check_bar (uid,bid) VALUES (new.uid,new.bid);
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table user_follow_bar
-- ----------------------------
DROP TRIGGER IF EXISTS `tigger_delete_check_bar_table`;
delimiter ;;
CREATE TRIGGER `tigger_delete_check_bar_table` BEFORE DELETE ON `user_follow_bar` FOR EACH ROW BEGIN
	delete from user_check_bar where uid=old.uid and bid=old.bid;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
