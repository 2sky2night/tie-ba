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

 Date: 27/07/2023 18:21:26
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for bar
-- ----------------------------
DROP TABLE IF EXISTS `bar`;
CREATE TABLE `bar`  (
  `bid` int(0) NOT NULL AUTO_INCREMENT COMMENT '吧的id',
  `bname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '吧的名称',
  `createTime` datetime(0) NULL DEFAULT NULL COMMENT '吧创建的时间',
  `uid` int(0) NULL DEFAULT NULL COMMENT '用户的id',
  `bdesc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '吧的描述',
  `photo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '吧的头像',
  PRIMARY KEY (`bid`) USING BTREE,
  INDEX `uid_bar`(`uid`) USING BTREE,
  CONSTRAINT `uid_bar` FOREIGN KEY (`uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 27 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of bar
-- ----------------------------
INSERT INTO `bar` VALUES (1, '重庆', '2023-05-30 11:08:43', 1, '行千里致广大', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (2, '北京', '2023-05-30 13:39:24', 1, '我爱北京!', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (3, '软件测试', '2023-05-30 13:44:18', 1, '软件测试交流吧！', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (4, 'react', '2023-05-30 13:45:04', 1, '探讨react的交流，工作、求职等等知识', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (5, '我的世界', '2023-05-30 15:07:35', 1, '欢迎来到我的世界吧!', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (6, '英雄联盟', '2023-05-30 15:07:35', 1, '欢迎来到英雄联盟吧!', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (7, '赛马娘', '2023-05-30 15:13:34', 1, '欢迎来到赛马娘吧!', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (8, '哈哈', '2023-06-06 14:41:39', 2, '即可', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (9, '包直光想容别', '2023-07-13 17:20:44', 1, 'minim et anim', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (10, '文通需决', '2023-07-13 17:20:45', 1, 'ullamco', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (11, '重广二拉该', '2023-07-13 17:20:47', 1, 'nisi do aliqua', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (12, '二车完离任最或', '2023-07-13 17:20:48', 1, 'eiusmod mollit et occaecat', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (13, '特成得要没', '2023-07-13 17:20:50', 1, 'commodo', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (14, '群记了报社', '2023-07-13 17:20:52', 1, 'incididunt do dolore reprehenderit', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (15, '里中者白王滚滚滚', '2023-07-13 17:20:54', 1, '里中者白王123里中者白王123里中者白王123里中者白王123里中者白王123里中者白王123里中者白王123里中者白王123里中者白王123里中者白王123里中者白王123', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (16, '中百别消华程', '2023-07-13 17:20:55', 1, 'elit aliquip enim', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (17, '农党识科根各', '2023-07-13 17:20:57', 1, 'irure dolore mollit', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (18, '从求还金治他', '2023-07-13 17:20:58', 1, 'proident do', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (19, '题决小适品育', '2023-07-13 17:21:00', 1, 'culpa laboris exercitation sint veniam', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (20, '热较要段会阶', '2023-07-13 17:21:02', 1, 'dolore labore adipisicing velit laborum', '/img/微信图片_20230621173731_1689581691513_f59da882e88cb27c706bfe302.png');
INSERT INTO `bar` VALUES (27, '吧等级制度是好的!!!', '2023-07-27 18:16:35', 1, 'asdsda', '/img/02_1690452994007_22eac2816579c2e4b0cdf7a00.png');

-- ----------------------------
-- Triggers structure for table bar
-- ----------------------------
DROP TRIGGER IF EXISTS `tigger_add_bar_rank_table`;
delimiter ;;
CREATE TRIGGER `tigger_add_bar_rank_table` AFTER INSERT ON `bar` FOR EACH ROW BEGIN
	INSERT into bar_rank values (new.bid,'[{"label":"初出茅庐","level":1,"score":0},{"label":"初级粉丝","level":2,"score":15},{"label":"中级粉丝","level":3,"score":40},{"label":"高级粉丝","level":4,"score":100},{"label":"活跃吧友","level":5,"score":200},{"label":"核心吧友","level":6,"score":400},{"label":"铁杆吧友","level":7,"score":600},{"label":"知名人士","level":8,"score":1000},{"label":"人气楷模","level":9,"score":1500},{"label":"黄牌指导","level":10,"score":2000},{"label":"意见领袖","level":11,"score":3000},{"label":"意见领袖","level":12,"score":6000},{"label":"意见领袖","level":13,"score":10000},{"label":"意见领袖","level":14,"score":14000},{"label":"意见领袖","level":15,"score":20000}]');
end
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
