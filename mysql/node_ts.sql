/*
 Navicat Premium Data Transfer

 Source Server         : Hjs
 Source Server Type    : MySQL
 Source Server Version : 100318
 Source Host           : localhost:3306
 Source Schema         : node_ts

 Target Server Type    : MySQL
 Target Server Version : 100318
 File Encoding         : 65001

 Date: 16/06/2021 14:47:07
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for todo_table
-- ----------------------------
DROP TABLE IF EXISTS `todo_table`;
CREATE TABLE `todo_table`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '列表id',
  `user_id` int(11) NULL DEFAULT NULL COMMENT '绑定的用户id',
  `content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '内容',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_table
-- ----------------------------
DROP TABLE IF EXISTS `user_table`;
CREATE TABLE `user_table`  (
  `id` int(64) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `name` varchar(48) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '用户名',
  `password` varchar(48) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT '密码',
  `account` varchar(48) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT '账号',
  `type` int(22) NOT NULL COMMENT '权限类型',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '用户注册时间',
  `create_user_id` int(64) NULL DEFAULT NULL COMMENT '创建账户的用户id',
  `group_id` int(64) NULL DEFAULT NULL COMMENT '分组id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;