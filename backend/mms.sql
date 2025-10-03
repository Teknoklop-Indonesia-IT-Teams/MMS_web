/*
 Navicat Premium Data Transfer

 Source Server         : databasevps
 Source Server Type    : MySQL
 Source Server Version : 50568 (5.5.68-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : db_admin

 Target Server Type    : MySQL
 Target Server Version : 50568 (5.5.68-MariaDB)
 File Encoding         : 65001

 Date: 22/08/2025 09:39:00
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for m_alat
-- ----------------------------
DROP TABLE IF EXISTS `m_alat`;
CREATE TABLE `m_alat`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `lokasi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `jenis` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `instalasi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `garansi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `remot` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `device` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `sensor` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `pelanggan` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `pic` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `i_alat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 30 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of m_alat
-- ----------------------------
INSERT INTO `m_alat` VALUES (7, 'AWLR WS-JS (TKI)', 'Ambarawa', 'AWLR', '2024-03-10', '2025-03-22', 'on', 'habis', 'S. Panjang', '-', 'PJT', '2', '');
INSERT INTO `m_alat` VALUES (8, 'AWLR WS-JS (TKI)', 'Ambarawa', 'AWLR', '2024-03-12', '2025-03-22', 'on', 'habis', 'Rawa Pening', '-', 'PJT', '2', '');
INSERT INTO `m_alat` VALUES (9, 'CCTV Solo', 'Solo', 'CCTV', '2024-03-18', '2024-03-18', 'off', 'habis', 'CCTV', '-', 'PJT', '2', '');
INSERT INTO `m_alat` VALUES (10, 'TELEMETERI PEMANTAUAN REMBESAN B.WLINGI (TKI)', 'Bendung Wlingi', 'Rembesan', '2024-04-25', '2025-04-18', 'on', 'garansi', 'OPL', '-', 'PJT', '2', '');
INSERT INTO `m_alat` VALUES (11, 'TELEMETERI PEMANTAUAN REMBESAN B.WLINGI (TKI)', 'Bendung Wlingi', 'Rembesan', '2024-04-25', '2025-04-18', 'on', 'garansi', 'OPR', '-', 'PJT', '2', '');
INSERT INTO `m_alat` VALUES (12, 'AWLR WS-JS (TKI)', 'Semarang', 'AWLR', '2024-05-21', '2025-03-22', 'on', 'garansi', 'KTH Timo', '-', 'PJT', '4', '');
INSERT INTO `m_alat` VALUES (13, 'ARR WS-JS (TKI)', 'Semarang', 'ARR', '2024-06-03', '2025-06-05', 'on', 'garansi', 'ARR Juwangi', '-', 'PJT', '3', '');
INSERT INTO `m_alat` VALUES (14, 'AWLR WS-JS (TKI)', 'Ambarawa', 'AWLR', '2024-06-05', '2025-03-22', 'on', 'garansi', 'S. Garang', '-', 'PJT', '3', '');
INSERT INTO `m_alat` VALUES (15, 'WQMS BERBASIS LAYANAN DATA (TKI)', 'Bendungan Karangkates', 'WQMS', '2024-06-20', '2025-08-01', 'on', 'garansi', 'KARANGKATES', '-', 'PJT', '4', '');
INSERT INTO `m_alat` VALUES (16, 'WQMS BERBASIS LAYANAN DATA (TKI)', 'Bendungan Selorejo', 'WQMS', '2024-06-20', '2025-08-01', 'on', 'garansi', 'SELOREJO', '-', 'PJT', '3', '');
INSERT INTO `m_alat` VALUES (17, 'TELEMETRI REMBESAN GALLERY WONOREJO (TKI)', 'Bendung Wonorejo', 'Rembesan', '2024-08-13', '2026-08-26', 'on', 'garansi', 'Wonorejo', '-', 'PJT', '2', '');
INSERT INTO `m_alat` VALUES (18, 'TELEMETRI PEMANTAUAN GWL B.WONOREJO (TKI)', 'Bendung Wonorejo', 'GWL', '2024-08-13', '2026-08-26', 'on', 'garansi', 'Wonorejo', '-', 'PJT', '2', '');
INSERT INTO `m_alat` VALUES (19, 'TELEMETRI PERALATAN KLIMATOLOGI WADUK WONOREJO (TKI)', 'Bendung Wonorejo', 'Weather Station', '2024-08-13', '2026-08-26', 'on', 'garansi', 'Wonorejo', '-', 'PJT', '2', '');
INSERT INTO `m_alat` VALUES (20, 'TELEMETRI REMBESAN B.JATIBARANG (TKI)', 'PLTA Jatibarang', 'Rembesan', '2024-09-20', '2026-11-22', 'on', 'garansi', 'JATIBARANG SM1 Left', '-', 'PJT', '2', '');
INSERT INTO `m_alat` VALUES (21, 'Rembesan VS RG', 'Bendung Wlingi', 'Rembesan', '2024-10-22', '2024-10-22', 'on', 'habis', 'Rembesan Wlingi', '-', 'PJT', '2', '');
INSERT INTO `m_alat` VALUES (22, 'AWLR KALI KUNCIR KIRI DAN KANAN (MTMM)', 'Nganjuk', 'AWLR', '2024-12-10', '2026-01-01', 'on', 'garansi', 'KUNCIR KANAN', '-', 'PJT', '2', '');
INSERT INTO `m_alat` VALUES (23, 'AWLR KALI KUNCIR KIRI DAN KANAN (MTMM)', 'Nganjuk', 'AWLR', '2024-12-10', '2026-01-01', 'on', 'garansi', 'KUNCIR KIRI', '-', 'PJT', '2', '');
INSERT INTO `m_alat` VALUES (24, 'AWLR KALI KEDUNGSUKO (MTMM)', 'Nganjuk', 'AWLR', '2024-12-10', '2026-01-01', 'on', 'garansi', 'KEDUNGSUKO', '-', 'PJT', '3', '');
INSERT INTO `m_alat` VALUES (25, 'WQMS MRICA (TURBIDTY) (TKI)', 'Purbalingga', 'WQMS', '2024-12-21', '2025-12-21', 'on', 'garansi', 'MRICA HILIR', '-', 'PJT', '4', '');
INSERT INTO `m_alat` VALUES (26, 'WQMS MRICA (TURBIDTY) (TKI)', 'Banjarnegara', 'WQMS', '2024-12-21', '2025-12-21', 'on', 'garansi', 'BEND.CLANGAP', '-', 'PJT', '3', '');
INSERT INTO `m_alat` VALUES (27, 'ARR DJA WS-SB (MTMM)', 'Wadaslintang', 'ARR', '2023-12-15', '2025-12-14', 'on', 'garansi', 'MEDONO', '-', 'PJT', '4', '');
INSERT INTO `m_alat` VALUES (28, 'ARR DJA WS-SB (MTMM)', 'Wadaslintang', 'ARR', '2023-12-15', '2025-12-14', 'on', 'garansi', 'SUMBER SARI', '-', 'PJT', '2', '1739360236.png');
INSERT INTO `m_alat` VALUES (29, 'dummy', 'dummy', 'Weather Station', '2025-02-02', '2025-02-10', 'on', 'garansi', 'dummy', 'dummy', 'pjt_dummy', '4', '1739111266.jpg');

-- ----------------------------
-- Table structure for m_record
-- ----------------------------
DROP TABLE IF EXISTS `m_record`;
CREATE TABLE `m_record`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deskripsi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `awal` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `tindakan` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `tambahan` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `akhir` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `berikutnya` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `keterangan` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `petugas` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `i_panel` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `i_alat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `i_sensor` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `id_m_alat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `tanggal` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of m_record
-- ----------------------------
INSERT INTO `m_record` VALUES (1, 'ffsadfsf', 'rwerewrw', 'sdfsdfsfd', 'fghtrh', 'fgngnfg', 'yerertertert', 'v vbnvbnbcvb', '3', 'WhatsApp_Image_2025-01-31_at_14_46_08_86ff6e491.jpg', 'cctv1.png', 'logo-removebg-preview1.png', '', '2025-02-09');
INSERT INTO `m_record` VALUES (2, 'daafddf', 'adfdasff', 'dasfadfs', 'adsfsadfa', 'zxcvzxv', 'sfdfg', 'sdfgsfdg', '3', 'cctv2.png', 'logo-removebg-preview2.png', 'WhatsApp_Image_2025-01-31_at_14_46_08_86ff6e492.jpg', '', '2025-02-09');
INSERT INTO `m_record` VALUES (3, 'test', 'test', 'test', 'test', 'test', 'test ', 'test', '2', 'logo-removebg-preview5.png', 'cctv5.png', NULL, '7', '2025-02-12');
INSERT INTO `m_record` VALUES (5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-10');
INSERT INTO `m_record` VALUES (6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-10');
INSERT INTO `m_record` VALUES (7, 'Pembersihan box panel,device dalam box panel,solar panel dan tipping bucket sensor terhadap kotoran dan serangga serta update program terbabru', 'Box panel penuh serangga,solar panel kotor,tipping bucket sensor kotor', 'Pembersihan seluruh komponen dalam box panel,pembersihan solar panel,pembersihan tipping bucket sensor dan update program arr terbaru', 'Tidak Ada', 'Alat telemetri sudah dalam keadaan bersih dan normal kembali', '-', 'Untuk alat telemetri ARR lebih sering di cross check kebersihannya agar dapat berfungsi dengan baik dan maksimal', '2', 'WhatsApp_Image_2025-01-31_at_14_46_08_86ff6e496.jpg', '', 'd46db7ae-18b3-41b9-9963-6ae8f1a93c93.jpeg', '27', '2025-02-12');
INSERT INTO `m_record` VALUES (8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-10');
INSERT INTO `m_record` VALUES (9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-10');
INSERT INTO `m_record` VALUES (11, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-14');
INSERT INTO `m_record` VALUES (12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-04');
INSERT INTO `m_record` VALUES (19, '(07-08-2025)', 'Kondisi Awal Panel box tidak begitu kotor, tegangan PV dan Aki normal, Panel Surya kotor', 'Pembersihan panel box dan panel surya', 'tidak ada', 'Kondisi akhir panel box bersih, panel surya bersih', '-', '-', '3', NULL, NULL, NULL, '23', '2025-08-08');

-- ----------------------------
-- Table structure for m_user
-- ----------------------------
DROP TABLE IF EXISTS `m_user`;
CREATE TABLE `m_user`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `petugas` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of m_user
-- ----------------------------
INSERT INTO `m_user` VALUES (2, 'Revan Ardian', 'alirohman857@gmail.com');
INSERT INTO `m_user` VALUES (3, 'Achmad Rofiuddin', 'ferdiantohengky@gmail.com');
INSERT INTO `m_user` VALUES (7, 'Fayyadh', 'flwmtr01@gmail.com');

-- ----------------------------
-- Table structure for tbl_items
-- ----------------------------
DROP TABLE IF EXISTS `tbl_items`;
CREATE TABLE `tbl_items`  (
  `itemId` int(11) NOT NULL AUTO_INCREMENT,
  `itemHeader` varchar(512) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Heading',
  `itemSub` varchar(1021) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'sub heading',
  `itemDesc` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT 'content or description',
  `itemImage` varchar(80) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `isDeleted` tinyint(4) NOT NULL DEFAULT 0,
  `createdBy` int(11) NOT NULL,
  `createdDtm` datetime NOT NULL,
  `updatedDtm` datetime NULL DEFAULT NULL,
  `updatedBy` int(11) NULL DEFAULT NULL,
  PRIMARY KEY (`itemId`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of tbl_items
-- ----------------------------
INSERT INTO `tbl_items` VALUES (1, 'jquery.validation.js', 'Contribution towards jquery.validation.js', 'jquery.validation.js is the client side javascript validation library authored by Jörn Zaefferer hosted on github for us and we are trying to contribute to it. Working on localization now', 'validation.png', 0, 1, '2015-09-02 00:00:00', NULL, NULL);
INSERT INTO `tbl_items` VALUES (2, 'CodeIgniter User Management', 'Demo for user management system', 'This the demo of User Management System (Admin Panel) using CodeIgniter PHP MVC Framework and AdminLTE bootstrap theme. You can download the code from the repository or forked it to contribute. Usage and installation instructions are provided in ReadMe.MD', 'cias.png', 0, 1, '2015-09-02 00:00:00', NULL, NULL);

-- ----------------------------
-- Table structure for tbl_reset_password
-- ----------------------------
DROP TABLE IF EXISTS `tbl_reset_password`;
CREATE TABLE `tbl_reset_password`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(128) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `activation_id` varchar(32) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `agent` varchar(512) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `client_ip` varchar(32) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `isDeleted` tinyint(4) NOT NULL DEFAULT 0,
  `createdBy` bigint(20) NOT NULL DEFAULT 1,
  `createdDtm` datetime NOT NULL,
  `updatedBy` bigint(20) NULL DEFAULT NULL,
  `updatedDtm` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = latin1 COLLATE = latin1_swedish_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of tbl_reset_password
-- ----------------------------

-- ----------------------------
-- Table structure for tbl_roles
-- ----------------------------
DROP TABLE IF EXISTS `tbl_roles`;
CREATE TABLE `tbl_roles`  (
  `roleId` tinyint(4) NOT NULL AUTO_INCREMENT COMMENT 'role id',
  `role` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'role text',
  PRIMARY KEY (`roleId`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of tbl_roles
-- ----------------------------
INSERT INTO `tbl_roles` VALUES (1, 'System Administrator');
INSERT INTO `tbl_roles` VALUES (2, 'Manager');
INSERT INTO `tbl_roles` VALUES (3, 'Employee');

-- ----------------------------
-- Table structure for tbl_users
-- ----------------------------
DROP TABLE IF EXISTS `tbl_users`;
CREATE TABLE `tbl_users`  (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'login email',
  `password` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'hashed login password',
  `name` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'full name of user',
  `mobile` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `roleId` tinyint(4) NOT NULL,
  `isDeleted` tinyint(4) NOT NULL DEFAULT 0,
  `createdBy` int(11) NOT NULL,
  `createdDtm` datetime NOT NULL,
  `updatedBy` int(11) NULL DEFAULT NULL,
  `updatedDtm` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`userId`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of tbl_users
-- ----------------------------
INSERT INTO `tbl_users` VALUES (1, 'alirohman857@gmail.com', '$2y$10$SAvFim22ptA9gHVORtIaru1dn9rhgerJlJCPxRNA02MjQaJnkxawq', 'Revan Ardian', '9890098900', 1, 0, 0, '2015-07-01 18:56:49', 1, '2025-09-09 09:37:01');
INSERT INTO `tbl_users` VALUES (2, 'manager@bewithdhanu.in', '$2y$10$Gkl9ILEdGNoTIV9w/xpf3.mSKs0LB1jkvvPKK7K0PSYDsQY7GE9JK', 'Achmad Rofiuddin', '9890098900', 2, 0, 1, '2016-12-09 17:49:56', 1, '2017-06-19 09:22:29');
INSERT INTO `tbl_users` VALUES (3, 'employee@bewithdhanu.in', '$2y$10$MB5NIu8i28XtMCnuExyFB.Ao1OXSteNpCiZSiaMSRPQx1F1WLRId2', 'Fayyadh', '9890098900', 3, 0, 1, '2016-12-09 17:50:22', 1, '2017-06-19 09:23:21');

-- ----------------------------
-- Table structure for email_logs
-- ----------------------------
DROP TABLE IF EXISTS `email_logs`;
CREATE TABLE `email_logs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `equipment_id` int(11) NOT NULL,
    `equipment_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `recipient_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `email_type` enum('warning','urgent','test') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `maintenance_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
    `maintenance_alert_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
    `days_left` int(11) NULL DEFAULT NULL,
    `sent_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` enum('sent','failed','pending') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
    `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
    PRIMARY KEY (`id`) USING BTREE,
    INDEX `idx_equipment_id` (`equipment_id`) USING BTREE,
    INDEX `idx_recipient_email` (`recipient_email`) USING BTREE,
    INDEX `idx_sent_at` (`sent_at`) USING BTREE,
    INDEX `idx_status` (`status`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for email_config
-- ----------------------------
DROP TABLE IF EXISTS `email_config`;
CREATE TABLE `email_config` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `config_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE INDEX `config_name` (`config_name`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of email_config
-- ----------------------------
INSERT INTO `email_config` (`config_name`, `config_value`, `description`) VALUES
('smtp_host', 'smtp.gmail.com', 'SMTP server host'),
('smtp_port', '587', 'SMTP server port'),
('smtp_secure', 'false', 'Use SSL/TLS'),
('email_from', 'noreply@mms-system.com', 'Default sender email'),
('email_from_name', 'MMS System', 'Default sender name'),
('test_email', 'alirohman857@gmail.com', 'Email for testing notifications'),
('enable_auto_notifications', 'true', 'Enable automatic email notifications'),
('notification_interval_hours', '24', 'Minimum hours between notifications for same equipment')
ON DUPLICATE KEY UPDATE 
`config_value` = VALUES(`config_value`),
`updated_at` = CURRENT_TIMESTAMP;

SET FOREIGN_KEY_CHECKS = 1;
