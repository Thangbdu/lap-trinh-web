-- ============================================
-- MobileStore Database - MySQL Version
-- Chuyển đổi từ PostgreSQL sang MySQL
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Tạo database (nếu chưa có)
CREATE DATABASE IF NOT EXISTS mobilestore_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mobilestore_db;

-- ============================================
-- 1. USERS
-- ============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `user_id` INT NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `role` VARCHAR(20) DEFAULT 'customer',
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. BRANDS
-- ============================================
DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
    `brand_id` INT NOT NULL AUTO_INCREMENT,
    `brand_name` VARCHAR(100) NOT NULL,
    `logo_url` VARCHAR(255) DEFAULT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`brand_id`),
    UNIQUE KEY `uk_brands_name` (`brand_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. CATEGORIES
-- ============================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `category_id` INT NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(100) NOT NULL,
    `category_image` VARCHAR(255) DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. PRODUCTS
-- ============================================
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `product_id` INT NOT NULL AUTO_INCREMENT,
    `category_id` INT NOT NULL,
    `brand_id` INT DEFAULT NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(18,2) NOT NULL,
    `old_price` DECIMAL(18,2) DEFAULT NULL,
    `thumbnail_url` VARCHAR(255) DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    `stock_quantity` INT DEFAULT 0,
    `specifications` TEXT DEFAULT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`product_id`),
    KEY `idx_products_category` (`category_id`),
    KEY `idx_products_brand` (`brand_id`),
    CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
    CONSTRAINT `fk_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`brand_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. PRODUCT_IMAGES
-- ============================================
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
    `image_id` INT NOT NULL AUTO_INCREMENT,
    `product_id` INT NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `is_primary` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`image_id`),
    KEY `idx_product_images_product` (`product_id`),
    CONSTRAINT `fk_product_images` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. CART
-- ============================================
DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart` (
    `cart_id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`cart_id`),
    UNIQUE KEY `uk_cart_user` (`user_id`),
    CONSTRAINT `fk_user_cart` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. CARTITEMS
-- ============================================
DROP TABLE IF EXISTS `cartitems`;
CREATE TABLE `cartitems` (
    `cart_item_id` INT NOT NULL AUTO_INCREMENT,
    `cart_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`cart_item_id`),
    KEY `idx_cartitems_cart` (`cart_id`),
    KEY `idx_cartitems_product` (`product_id`),
    CONSTRAINT `fk_cart` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_product_cart` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. PROMOTIONS
-- ============================================
DROP TABLE IF EXISTS `promotions`;
CREATE TABLE `promotions` (
    `promo_id` INT NOT NULL AUTO_INCREMENT,
    `promo_code` VARCHAR(50) NOT NULL,
    `discount_percent` DECIMAL(5,2) DEFAULT NULL,
    `max_discount_amount` DECIMAL(18,2) DEFAULT NULL,
    `min_order_value` DECIMAL(18,2) DEFAULT 0,
    `start_date` DATETIME NOT NULL,
    `end_date` DATETIME NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`promo_id`),
    UNIQUE KEY `uk_promotions_code` (`promo_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. USER_ADDRESSES
-- ============================================
DROP TABLE IF EXISTS `user_addresses`;
CREATE TABLE `user_addresses` (
    `address_id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `recipient_name` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL,
    `full_address` TEXT NOT NULL,
    `is_default` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`address_id`),
    KEY `idx_user_addresses_user` (`user_id`),
    CONSTRAINT `fk_user_address` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. ORDERS
-- ============================================
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `order_id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT DEFAULT NULL,
    `address_id` INT DEFAULT NULL,
    `promo_id` INT DEFAULT NULL,
    `total_amount` DECIMAL(18,2) NOT NULL,
    `discount_amount` DECIMAL(18,2) DEFAULT 0,
    `final_amount` DECIMAL(18,2) NOT NULL,
    `status` VARCHAR(50) DEFAULT 'Chờ xác nhận',
    `order_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`order_id`),
    KEY `idx_orders_user` (`user_id`),
    KEY `idx_orders_address` (`address_id`),
    KEY `idx_orders_promo` (`promo_id`),
    CONSTRAINT `fk_user_order` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
    CONSTRAINT `fk_order_address` FOREIGN KEY (`address_id`) REFERENCES `user_addresses` (`address_id`) ON DELETE SET NULL,
    CONSTRAINT `fk_order_promo` FOREIGN KEY (`promo_id`) REFERENCES `promotions` (`promo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. ORDERITEMS
-- ============================================
DROP TABLE IF EXISTS `orderitems`;
CREATE TABLE `orderitems` (
    `order_item_id` INT NOT NULL AUTO_INCREMENT,
    `order_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `price_at_purchase` DECIMAL(18,2) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`order_item_id`),
    KEY `idx_orderitems_order` (`order_id`),
    KEY `idx_orderitems_product` (`product_id`),
    CONSTRAINT `fk_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_product_order` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. PAYMENTS
-- ============================================
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
    `payment_id` INT NOT NULL AUTO_INCREMENT,
    `order_id` INT NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `payment_status` VARCHAR(50) DEFAULT 'Chưa thanh toán',
    `transaction_id` VARCHAR(255) DEFAULT NULL,
    `amount` DECIMAL(18,2) NOT NULL,
    `paid_at` DATETIME DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`payment_id`),
    UNIQUE KEY `uk_payments_order` (`order_id`),
    CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. REVIEWS
-- ============================================
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
    `review_id` INT NOT NULL AUTO_INCREMENT,
    `product_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `rating` INT DEFAULT NULL,
    `comment` TEXT DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`review_id`),
    KEY `idx_reviews_product` (`product_id`),
    KEY `idx_reviews_user` (`user_id`),
    CONSTRAINT `fk_review_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 14. PASSWORD_RESETS
-- ============================================
DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE `password_resets` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `otp_code` VARCHAR(6) NOT NULL,
    `is_verified` BOOLEAN DEFAULT FALSE,
    `expires_at` DATETIME NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_password_resets_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 15. WISHLIST
-- ============================================
DROP TABLE IF EXISTS `wishlist`;
CREATE TABLE `wishlist` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_wishlist_user_product` (`user_id`, `product_id`),
    KEY `idx_wishlist_product` (`product_id`),
    CONSTRAINT `fk_user_wishlist` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_product_wishlist` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- DỮ LIỆU MẪU
-- ============================================

-- USERS
INSERT INTO `users` (`user_id`, `full_name`, `email`, `password_hash`, `phone`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Nguyễn Văn Admin', 'admin@store.vn', 'hash123', '0901234567', 'admin', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(2, 'Trần Thị Khách', 'khach1@gmail.com', 'hash123', '0912345678', 'customer', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(3, 'Lê Văn Luyện', 'khach2@gmail.com', 'hash123', '0923456789', 'customer', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(4, 'Phạm Thị Nụ', 'khach3@gmail.com', 'hash123', '0934567890', 'customer', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(5, 'Hoàng Văn Dũng', 'khach4@gmail.com', 'hash123', '0945678901', 'customer', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(6, 'Vũ Thị Lan', 'khach5@gmail.com', 'hash123', '0956789012', 'customer', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(7, 'Đặng Văn Tài', 'khach6@gmail.com', 'hash123', '0967890123', 'customer', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(8, 'Bùi Thị Mỹ', 'khach7@gmail.com', 'hash123', '0978901234', 'customer', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(9, 'Đỗ Văn Tèo', 'khach8@gmail.com', 'hash123', '0989012345', 'customer', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(10, 'Hồ Thị Hoa', 'khach9@gmail.com', 'hash123', '0990123456', 'customer', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13');

-- BRANDS
INSERT INTO `brands` (`brand_id`, `brand_name`, `logo_url`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Apple', NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(2, 'Samsung', NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(3, 'Xiaomi', NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(4, 'Oppo', NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(5, 'Sony', NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(6, 'Asus', NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(7, 'Dell', NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(8, 'Logitech', NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(9, 'JBL', NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(10, 'Anker', NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13');

-- CATEGORIES
INSERT INTO `categories` (`category_id`, `category_name`, `category_image`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Điện thoại', NULL, 'Smartphone các loại', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(2, 'Tablet', NULL, 'Máy tính bảng', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(3, 'Laptop', NULL, 'Máy tính xách tay', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(4, 'Tai nghe', NULL, 'Tai nghe không dây và có dây', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(5, 'Đồng hồ thông minh', NULL, 'Smartwatch và vòng đeo tay sức khỏe', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(6, 'Ốp lưng', NULL, 'Ốp lưng bảo vệ điện thoại', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(7, 'Cáp sạc', NULL, 'Cáp sạc và củ sạc', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(8, 'Pin dự phòng', NULL, 'Sạc dự phòng dung lượng cao', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(9, 'Loa Bluetooth', NULL, 'Loa nghe nhạc không dây', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(10, 'Bàn phím', NULL, 'Bàn phím cơ và văn phòng', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13');

-- PRODUCTS
INSERT INTO `products` (`product_id`, `category_id`, `brand_id`, `product_name`, `price`, `old_price`, `thumbnail_url`, `description`, `stock_quantity`, `specifications`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'iPhone 15 Pro Max 256GB', 32990000.00, 34990000.00, NULL, NULL, 50, NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(2, 1, 2, 'Samsung Galaxy S24 Ultra', 29990000.00, 31990000.00, '/uploads/images/products/s24utral.webp', NULL, 40, NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(3, 1, 3, 'Xiaomi 14 Pro', 22990000.00, 24990000.00, '/uploads/images/products/Xiaomi_14_Pro_Green.png', NULL, 60, NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(4, 2, 1, 'iPad Pro 11 inch M2', 20990000.00, 22990000.00, NULL, NULL, 30, NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(5, 3, 1, 'MacBook Air M3 2024', 27990000.00, 29990000.00, '/uploads/images/products/macbook airm 3 2024.jpg', NULL, 25, NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(6, 4, 1, 'AirPods Pro 2', 5990000.00, 6490000.00, NULL, NULL, 100, NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(7, 5, 1, 'Apple Watch Series 9', 10490000.00, 11490000.00, NULL, NULL, 45, NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(8, 8, 10, 'Sạc dự phòng Anker 10000mAh', 800000.00, 950000.00, NULL, NULL, 200, NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(9, 9, 9, 'Loa Bluetooth JBL Flip 6', 2590000.00, 2890000.00, NULL, NULL, 80, NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(10, 10, 8, 'Bàn phím cơ Logitech MX Mechanical', 3990000.00, 4290000.00, NULL, NULL, 40, NULL, TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13');

-- PRODUCT_IMAGES
INSERT INTO `product_images` (`image_id`, `product_id`, `image_url`, `is_primary`, `created_at`) VALUES
(1, 1, 'iphone15_pro_max_main.jpg', TRUE, '2026-03-13 22:22:13'),
(2, 2, '/uploads/images/products/s24utral.webp', TRUE, '2026-03-13 22:22:13'),
(3, 3, '/uploads/images/products/Xiaomi_14_Pro_Green.png', TRUE, '2026-03-13 22:22:13'),
(4, 4, 'ipad_pro_m2_main.jpg', TRUE, '2026-03-13 22:22:13'),
(5, 5, '/uploads/images/products/macbook airm 3 2024.jpg', TRUE, '2026-03-13 22:22:13'),
(6, 6, 'airpods_pro_2_main.jpg', TRUE, '2026-03-13 22:22:13'),
(7, 7, 'apple_watch_s9_main.jpg', TRUE, '2026-03-13 22:22:13'),
(8, 8, 'anker_10000_main.jpg', TRUE, '2026-03-13 22:22:13'),
(9, 9, 'jbl_flip_6_main.jpg', TRUE, '2026-03-13 22:22:13'),
(10, 10, 'logitech_mx_main.jpg', TRUE, '2026-03-13 22:22:13');

-- CART
INSERT INTO `cart` (`cart_id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 1, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(2, 2, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(3, 3, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(4, 4, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(5, 5, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(6, 6, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(7, 7, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(8, 8, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(9, 9, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(10, 10, '2026-03-13 22:22:13', '2026-03-13 22:22:13');

-- CARTITEMS
INSERT INTO `cartitems` (`cart_item_id`, `cart_id`, `product_id`, `quantity`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(2, 2, 2, 2, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(3, 3, 3, 1, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(4, 4, 4, 1, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(5, 5, 5, 1, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(6, 6, 6, 2, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(7, 7, 7, 1, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(8, 8, 8, 3, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(9, 9, 9, 1, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(10, 10, 10, 1, '2026-03-13 22:22:13', '2026-03-13 22:22:13');

-- PROMOTIONS
INSERT INTO `promotions` (`promo_id`, `promo_code`, `discount_percent`, `max_discount_amount`, `min_order_value`, `start_date`, `end_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', 10.00, 500000.00, 1000000.00, '2023-01-01 00:00:00', '2025-12-31 00:00:00', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(2, 'SUMMER20', 20.00, 1000000.00, 5000000.00, '2024-05-01 00:00:00', '2024-08-31 00:00:00', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(3, 'TET50', 50.00, 2000000.00, 10000000.00, '2024-01-01 00:00:00', '2024-02-28 00:00:00', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(4, 'FREESHIP', 0.00, 50000.00, 200000.00, '2024-01-01 00:00:00', '2025-12-31 00:00:00', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(5, 'APPLEFAN', 5.00, 1000000.00, 15000000.00, '2024-01-01 00:00:00', '2024-12-31 00:00:00', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(6, 'SAMFAN', 5.00, 1000000.00, 10000000.00, '2024-01-01 00:00:00', '2024-12-31 00:00:00', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(7, 'STUDENT', 15.00, 800000.00, 2000000.00, '2024-09-01 00:00:00', '2024-10-31 00:00:00', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(8, 'BLACKFRIDAY', 30.00, 1500000.00, 3000000.00, '2024-11-20 00:00:00', '2024-11-30 00:00:00', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(9, 'FLASH1', 10.00, 200000.00, 500000.00, '2024-06-01 00:00:00', '2024-06-02 00:00:00', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(10, 'VIPMEMBER', 12.00, 1200000.00, 8000000.00, '2024-01-01 00:00:00', '2025-01-01 00:00:00', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13');

-- USER_ADDRESSES
INSERT INTO `user_addresses` (`address_id`, `user_id`, `recipient_name`, `phone_number`, `full_address`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 1, 'Admin', '0901234567', '123 Cầu Giấy, Hà Nội', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(2, 2, 'Khách 1 Nhà riêng', '0912345678', '456 Quận 1, TP HCM', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(3, 3, 'Khách 2 Công ty', '0923456789', '789 Thanh Khê, Đà Nẵng', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(4, 4, 'Chị Nụ', '0934567890', '101 Ninh Kiều, Cần Thơ', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(5, 5, 'Anh Dũng', '0945678901', '202 Hải Châu, Đà Nẵng', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(6, 6, 'Lan Vũ', '0956789012', '303 Hoàn Kiếm, Hà Nội', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(7, 7, 'Tài Đặng', '0967890123', '404 Đống Đa, Hà Nội', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(8, 8, 'Mỹ Bùi', '0978901234', '505 Bình Thạnh, TP HCM', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(9, 9, 'Tèo Đỗ', '0989012345', '606 Gò Vấp, TP HCM', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(10, 10, 'Hoa Hồ', '0990123456', '707 Tân Bình, TP HCM', TRUE, '2026-03-13 22:22:13', '2026-03-13 22:22:13');

-- ORDERS
INSERT INTO `orders` (`order_id`, `user_id`, `address_id`, `promo_id`, `total_amount`, `discount_amount`, `final_amount`, `status`, `order_date`, `updated_at`) VALUES
(1, 2, 2, 1, 32990000.00, 500000.00, 32490000.00, 'Đã giao', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(2, 3, 3, 2, 59980000.00, 1000000.00, 58980000.00, 'Đang giao', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(3, 4, 4, 3, 22990000.00, 2000000.00, 20990000.00, 'Đã xác nhận', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(4, 5, 5, NULL, 20990000.00, 0.00, 20990000.00, 'Chờ xác nhận', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(5, 6, 6, 5, 27990000.00, 1000000.00, 26990000.00, 'Đã giao', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(6, 7, 7, 4, 11980000.00, 50000.00, 11930000.00, 'Chờ xác nhận', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(7, 8, 8, NULL, 10490000.00, 0.00, 10490000.00, 'Đã hủy', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(8, 9, 9, NULL, 2400000.00, 0.00, 2400000.00, 'Đã giao', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(9, 10, 10, 9, 2590000.00, 200000.00, 2390000.00, 'Đã xác nhận', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(10, 2, 2, NULL, 3990000.00, 0.00, 3990000.00, 'Đang giao', '2026-03-13 22:22:13', '2026-03-13 22:22:13');

-- ORDERITEMS
INSERT INTO `orderitems` (`order_item_id`, `order_id`, `product_id`, `quantity`, `price_at_purchase`, `created_at`) VALUES
(1, 1, 1, 1, 32990000.00, '2026-03-13 22:22:13'),
(2, 2, 2, 2, 29990000.00, '2026-03-13 22:22:13'),
(3, 3, 3, 1, 22990000.00, '2026-03-13 22:22:13'),
(4, 4, 4, 1, 20990000.00, '2026-03-13 22:22:13'),
(5, 5, 5, 1, 27990000.00, '2026-03-13 22:22:13'),
(6, 6, 6, 2, 5990000.00, '2026-03-13 22:22:13'),
(7, 7, 7, 1, 10490000.00, '2026-03-13 22:22:13'),
(8, 8, 8, 3, 800000.00, '2026-03-13 22:22:13'),
(9, 9, 9, 1, 2590000.00, '2026-03-13 22:22:13'),
(10, 10, 10, 1, 3990000.00, '2026-03-13 22:22:13');

-- PAYMENTS
INSERT INTO `payments` (`payment_id`, `order_id`, `payment_method`, `payment_status`, `transaction_id`, `amount`, `paid_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'VNPay', 'Đã thanh toán', NULL, 32490000.00, '2026-03-13 22:22:13', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(2, 2, 'Chuyển khoản', 'Đã thanh toán', NULL, 58980000.00, '2026-03-13 22:22:13', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(3, 3, 'COD', 'Chưa thanh toán', NULL, 20990000.00, NULL, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(4, 4, 'Momo', 'Chưa thanh toán', NULL, 20990000.00, NULL, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(5, 5, 'Thẻ Tín Dụng', 'Đã thanh toán', NULL, 26990000.00, '2026-03-13 22:22:13', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(6, 6, 'COD', 'Chưa thanh toán', NULL, 11930000.00, NULL, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(7, 7, 'VNPay', 'Thất bại', NULL, 10490000.00, NULL, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(8, 8, 'Momo', 'Đã thanh toán', NULL, 2400000.00, '2026-03-13 22:22:13', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(9, 9, 'COD', 'Chưa thanh toán', NULL, 2390000.00, NULL, '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(10, 10, 'Chuyển khoản', 'Đã thanh toán', NULL, 3990000.00, '2026-03-13 22:22:13', '2026-03-13 22:22:13', '2026-03-13 22:22:13');

-- REVIEWS
INSERT INTO `reviews` (`review_id`, `product_id`, `user_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 5, 'Điện thoại xài rất mượt, camera đẹp.', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(2, 2, 3, 5, 'Màn hình Samsung xem phim siêu nét.', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(3, 3, 4, 4, 'Pin trâu, sạc nhanh, hơi nóng máy.', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(4, 4, 5, 5, 'iPad mua về vẽ vời rất thích.', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(5, 5, 6, 5, 'Máy nhẹ, pin cả ngày.', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(6, 6, 7, 4, 'Chống ồn tốt nhưng đeo lâu hơi đau tai.', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(7, 7, 8, 5, 'Theo dõi sức khỏe tiện lợi.', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(8, 8, 9, 5, 'Sạc dự phòng nhỏ gọn, dung lượng thực tế cao.', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(9, 9, 10, 4, 'Bass đập mạnh, âm thanh hay.', '2026-03-13 22:22:13', '2026-03-13 22:22:13'),
(10, 10, 2, 5, 'Bàn phím gõ êm, kết nối bluetooth nhanh.', '2026-03-13 22:22:13', '2026-03-13 22:22:13');

-- PASSWORD_RESETS
INSERT INTO `password_resets` (`id`, `email`, `otp_code`, `is_verified`, `expires_at`, `created_at`) VALUES
(1, 'khach1@gmail.com', '111111', FALSE, '2026-03-13 22:32:13', '2026-03-13 22:22:13'),
(2, 'khach2@gmail.com', '222222', FALSE, '2026-03-13 22:32:13', '2026-03-13 22:22:13'),
(3, 'khach3@gmail.com', '333333', FALSE, '2026-03-13 22:32:13', '2026-03-13 22:22:13'),
(4, 'khach4@gmail.com', '444444', FALSE, '2026-03-13 22:32:13', '2026-03-13 22:22:13'),
(5, 'khach5@gmail.com', '555555', FALSE, '2026-03-13 22:32:13', '2026-03-13 22:22:13'),
(6, 'khach6@gmail.com', '666666', FALSE, '2026-03-13 22:32:13', '2026-03-13 22:22:13'),
(7, 'khach7@gmail.com', '777777', FALSE, '2026-03-13 22:32:13', '2026-03-13 22:22:13'),
(8, 'khach8@gmail.com', '888888', FALSE, '2026-03-13 22:32:13', '2026-03-13 22:22:13'),
(9, 'khach9@gmail.com', '999999', FALSE, '2026-03-13 22:32:13', '2026-03-13 22:22:13'),
(10, 'admin@store.vn', '123456', FALSE, '2026-03-13 22:32:13', '2026-03-13 22:22:13');

-- WISHLIST
INSERT INTO `wishlist` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(1, 2, 1, '2026-03-13 22:22:13'),
(2, 2, 5, '2026-03-13 22:22:13'),
(3, 3, 2, '2026-03-13 22:22:13'),
(4, 4, 3, '2026-03-13 22:22:13'),
(5, 5, 4, '2026-03-13 22:22:13'),
(6, 6, 5, '2026-03-13 22:22:13'),
(7, 7, 6, '2026-03-13 22:22:13'),
(8, 8, 7, '2026-03-13 22:22:13'),
(9, 9, 8, '2026-03-13 22:22:13'),
(10, 10, 9, '2026-03-13 22:22:13');
