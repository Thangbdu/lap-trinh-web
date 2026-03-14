# 📦 MobileStore - Cấu Trúc Database (MySQL)

> Chuyển đổi từ PostgreSQL sang MySQL. Database: `mobilestore_db`

---

## 📊 Sơ Đồ Quan Hệ (ER Diagram)

```mermaid
erDiagram
    users ||--o{ cart : "1 user → 1 cart"
    users ||--o{ orders : "đặt hàng"
    users ||--o{ user_addresses : "có nhiều địa chỉ"
    users ||--o{ reviews : "viết đánh giá"
    users ||--o{ wishlist : "yêu thích"

    brands ||--o{ products : "thuộc thương hiệu"
    categories ||--o{ products : "thuộc danh mục"

    products ||--o{ product_images : "có nhiều ảnh"
    products ||--o{ cartitems : "trong giỏ hàng"
    products ||--o{ orderitems : "trong đơn hàng"
    products ||--o{ reviews : "được đánh giá"
    products ||--o{ wishlist : "được yêu thích"

    cart ||--o{ cartitems : "chứa sản phẩm"

    orders ||--o{ orderitems : "chứa sản phẩm"
    orders ||--|| payments : "có thanh toán"
    orders }o--|| user_addresses : "giao đến"
    orders }o--o| promotions : "áp dụng mã"

    users {
        INT user_id PK
        VARCHAR full_name
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR phone
        VARCHAR role
        BOOLEAN is_active
        DATETIME created_at
        DATETIME updated_at
    }

    brands {
        INT brand_id PK
        VARCHAR brand_name UK
        VARCHAR logo_url
        BOOLEAN is_active
        DATETIME created_at
        DATETIME updated_at
    }

    categories {
        INT category_id PK
        VARCHAR category_name
        VARCHAR category_image
        TEXT description
        BOOLEAN is_active
        DATETIME created_at
        DATETIME updated_at
    }

    products {
        INT product_id PK
        INT category_id FK
        INT brand_id FK
        VARCHAR product_name
        DECIMAL price
        DECIMAL old_price
        VARCHAR thumbnail_url
        TEXT description
        INT stock_quantity
        TEXT specifications
        BOOLEAN is_active
        DATETIME created_at
        DATETIME updated_at
    }

    product_images {
        INT image_id PK
        INT product_id FK
        VARCHAR image_url
        BOOLEAN is_primary
        DATETIME created_at
    }

    cart {
        INT cart_id PK
        INT user_id FK_UK
        DATETIME created_at
        DATETIME updated_at
    }

    cartitems {
        INT cart_item_id PK
        INT cart_id FK
        INT product_id FK
        INT quantity
        DATETIME created_at
        DATETIME updated_at
    }

    orders {
        INT order_id PK
        INT user_id FK
        INT address_id FK
        INT promo_id FK
        DECIMAL total_amount
        DECIMAL discount_amount
        DECIMAL final_amount
        VARCHAR status
        DATETIME order_date
        DATETIME updated_at
    }

    orderitems {
        INT order_item_id PK
        INT order_id FK
        INT product_id FK
        INT quantity
        DECIMAL price_at_purchase
        DATETIME created_at
    }

    payments {
        INT payment_id PK
        INT order_id FK_UK
        VARCHAR payment_method
        VARCHAR payment_status
        VARCHAR transaction_id
        DECIMAL amount
        DATETIME paid_at
        DATETIME created_at
        DATETIME updated_at
    }

    promotions {
        INT promo_id PK
        VARCHAR promo_code UK
        DECIMAL discount_percent
        DECIMAL max_discount_amount
        DECIMAL min_order_value
        DATETIME start_date
        DATETIME end_date
        BOOLEAN is_active
        DATETIME created_at
        DATETIME updated_at
    }

    reviews {
        INT review_id PK
        INT product_id FK
        INT user_id FK
        INT rating
        TEXT comment
        DATETIME created_at
        DATETIME updated_at
    }

    user_addresses {
        INT address_id PK
        INT user_id FK
        VARCHAR recipient_name
        VARCHAR phone_number
        TEXT full_address
        BOOLEAN is_default
        DATETIME created_at
        DATETIME updated_at
    }

    password_resets {
        INT id PK
        VARCHAR email
        VARCHAR otp_code
        BOOLEAN is_verified
        DATETIME expires_at
        DATETIME created_at
    }

    wishlist {
        INT id PK
        INT user_id FK
        INT product_id FK
        DATETIME created_at
    }
```

---

## 📋 Chi Tiết Các Bảng

### 1. `users` — Người dùng
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| user_id | INT | PK, AUTO_INCREMENT | |
| full_name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(191) | NOT NULL, UNIQUE | 191 cho index UTF8MB4 |
| password_hash | VARCHAR(255) | NOT NULL | |
| phone | VARCHAR(20) | | |
| role | VARCHAR(20) | DEFAULT 'customer' | 'admin' / 'customer' |
| is_active | BOOLEAN | DEFAULT TRUE | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

### 2. `brands` — Thương hiệu
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| brand_id | INT | PK, AUTO_INCREMENT | |
| brand_name | VARCHAR(100) | NOT NULL, UNIQUE | |
| logo_url | VARCHAR(255) | | |
| is_active | BOOLEAN | DEFAULT TRUE | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

### 3. `categories` — Danh mục sản phẩm
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| category_id | INT | PK, AUTO_INCREMENT | |
| category_name | VARCHAR(100) | NOT NULL | |
| category_image | VARCHAR(255) | | |
| description | TEXT | | |
| is_active | BOOLEAN | DEFAULT TRUE | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

### 4. `products` — Sản phẩm
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| product_id | INT | PK, AUTO_INCREMENT | |
| category_id | INT | NOT NULL, FK → categories | |
| brand_id | INT | FK → brands | Nullable |
| product_name | VARCHAR(255) | NOT NULL | |
| price | DECIMAL(18,2) | NOT NULL | |
| old_price | DECIMAL(18,2) | | Giá cũ (gạch ngang) |
| thumbnail_url | VARCHAR(255) | | |
| description | TEXT | | |
| stock_quantity | INT | DEFAULT 0 | |
| specifications | TEXT | | JSON thông số kỹ thuật |
| is_active | BOOLEAN | DEFAULT TRUE | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

### 5. `product_images` — Ảnh sản phẩm
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| image_id | INT | PK, AUTO_INCREMENT | |
| product_id | INT | NOT NULL, FK → products (CASCADE) | |
| image_url | VARCHAR(255) | NOT NULL | |
| is_primary | BOOLEAN | DEFAULT FALSE | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |

---

### 6. `cart` — Giỏ hàng (1 user = 1 cart)
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| cart_id | INT | PK, AUTO_INCREMENT | |
| user_id | INT | NOT NULL, UNIQUE, FK → users (CASCADE) | 1-1 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

### 7. `cartitems` — Chi tiết giỏ hàng
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| cart_item_id | INT | PK, AUTO_INCREMENT | |
| cart_id | INT | NOT NULL, FK → cart (CASCADE) | |
| product_id | INT | NOT NULL, FK → products (CASCADE) | |
| quantity | INT | DEFAULT 1 | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

### 8. `orders` — Đơn hàng
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| order_id | INT | PK, AUTO_INCREMENT | |
| user_id | INT | NOT NULL, FK → users | |
| address_id | INT | FK → user_addresses | Nullable |
| promo_id | INT | FK → promotions | Nullable |
| total_amount | DECIMAL(18,2) | NOT NULL | |
| discount_amount | DECIMAL(18,2) | DEFAULT 0 | |
| final_amount | DECIMAL(18,2) | NOT NULL | |
| status | VARCHAR(50) | DEFAULT 'Chờ xác nhận' | |
| order_date | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

### 9. `orderitems` — Chi tiết đơn hàng
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| order_item_id | INT | PK, AUTO_INCREMENT | |
| order_id | INT | NOT NULL, FK → orders (CASCADE) | |
| product_id | INT | NOT NULL, FK → products | |
| quantity | INT | NOT NULL | |
| price_at_purchase | DECIMAL(18,2) | NOT NULL | Giá tại thời điểm mua |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |

---

### 10. `payments` — Thanh toán (1 order = 1 payment)
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| payment_id | INT | PK, AUTO_INCREMENT | |
| order_id | INT | NOT NULL, UNIQUE, FK → orders (CASCADE) | 1-1 |
| payment_method | VARCHAR(50) | NOT NULL | COD / VNPay / Momo / ... |
| payment_status | VARCHAR(50) | DEFAULT 'Chưa thanh toán' | |
| transaction_id | VARCHAR(255) | | Mã giao dịch bên thứ 3 |
| amount | DECIMAL(18,2) | NOT NULL | |
| paid_at | DATETIME | | NULL nếu chưa thanh toán |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

### 11. `promotions` — Mã khuyến mãi
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| promo_id | INT | PK, AUTO_INCREMENT | |
| promo_code | VARCHAR(50) | NOT NULL, UNIQUE | |
| discount_percent | DECIMAL(5,2) | | % giảm giá |
| max_discount_amount | DECIMAL(18,2) | | Giảm tối đa |
| min_order_value | DECIMAL(18,2) | DEFAULT 0 | Đơn tối thiểu |
| start_date | DATETIME | NOT NULL | |
| end_date | DATETIME | NOT NULL | |
| is_active | BOOLEAN | DEFAULT TRUE | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

### 12. `reviews` — Đánh giá sản phẩm
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| review_id | INT | PK, AUTO_INCREMENT | |
| product_id | INT | NOT NULL, FK → products (CASCADE) | |
| user_id | INT | NOT NULL, FK → users (CASCADE) | |
| rating | INT | | 1-5 sao |
| comment | TEXT | | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

### 13. `user_addresses` — Sổ địa chỉ
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| address_id | INT | PK, AUTO_INCREMENT | |
| user_id | INT | NOT NULL, FK → users (CASCADE) | |
| recipient_name | VARCHAR(255) | NOT NULL | Tên người nhận |
| phone_number | VARCHAR(20) | NOT NULL | |
| full_address | TEXT | NOT NULL | |
| is_default | BOOLEAN | DEFAULT FALSE | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

---

### 14. `password_resets` — OTP đặt lại mật khẩu
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| id | INT | PK, AUTO_INCREMENT | |
| email | VARCHAR(255) | NOT NULL | |
| otp_code | VARCHAR(6) | NOT NULL | |
| is_verified | BOOLEAN | DEFAULT FALSE | |
| expires_at | DATETIME | NOT NULL | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |

---

### 15. `wishlist` — Danh sách yêu thích
| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|-------|-----------|---------|
| id | INT | PK, AUTO_INCREMENT | |
| user_id | INT | NOT NULL, FK → users (CASCADE) | |
| product_id | INT | NOT NULL, FK → products (CASCADE) | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| | | UNIQUE(user_id, product_id) | Không trùng |

---

## 🔗 Tổng Hợp Foreign Keys

| Bảng con | Cột FK | → Bảng cha | Cột tham chiếu | ON DELETE |
|----------|--------|------------|-----------------|-----------|
| cart | user_id | users | user_id | CASCADE |
| cartitems | cart_id | cart | cart_id | CASCADE |
| cartitems | product_id | products | product_id | CASCADE |
| products | category_id | categories | category_id | RESTRICT |
| products | brand_id | brands | brand_id | RESTRICT |
| product_images | product_id | products | product_id | CASCADE |
| orders | user_id | users | user_id | RESTRICT |
| orders | address_id | user_addresses | address_id | RESTRICT |
| orders | promo_id | promotions | promo_id | RESTRICT |
| orderitems | order_id | orders | order_id | CASCADE |
| orderitems | product_id | products | product_id | RESTRICT |
| payments | order_id | orders | order_id | CASCADE |
| reviews | product_id | products | product_id | CASCADE |
| reviews | user_id | users | user_id | CASCADE |
| user_addresses | user_id | users | user_id | CASCADE |
| wishlist | user_id | users | user_id | CASCADE |
| wishlist | product_id | products | product_id | CASCADE |
