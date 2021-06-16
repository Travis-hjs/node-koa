/*
 Navicat Premium Data Transfer

 Source Server         : 博士-Hjs
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
-- Table structure for todo_form
-- ----------------------------
DROP TABLE IF EXISTS `todo_form`;
CREATE TABLE `todo_form`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '列表id',
  `user_id` int(11) NULL DEFAULT NULL COMMENT '绑定的用户id',
  `content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '内容',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_form
-- ----------------------------
DROP TABLE IF EXISTS `user_form`;
CREATE TABLE `user_form`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `account` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账号',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
