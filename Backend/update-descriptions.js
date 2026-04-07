const mysql = require('mysql2/promise');
require('dotenv').config();

const products = [
  // ─── iPhone 17 Pro Max ────────────────────────────────────────────────
  {
    name: 'iPhone 17 Pro Max',
    description: `iPhone 17 Pro Max là đỉnh cao công nghệ của Apple năm 2025, được trang bị chip A19 Pro mạnh mẽ nhất từ trước đến nay. Màn hình Super Retina XDR 6.9 inch ProMotion 120Hz mang lại trải nghiệm hình ảnh sống động, sắc nét đến từng chi tiết. Hệ thống camera Pro tiên tiến với cảm biến lớn hơn, khẩu độ f/1.5 cho ảnh đẹp ngay cả trong bóng tối. Thiết kế titan cao cấp nhẹ hơn, mỏng hơn so với thế hệ trước.`,
    specifications: JSON.stringify({
      "Màn hình": "6.9 inch Super Retina XDR OLED, ProMotion 120Hz, 2868x1320px, 460ppi",
      "Chip": "Apple A19 Pro Bionic (3nm)",
      "RAM": "8GB",
      "Bộ nhớ trong": "256GB / 512GB / 1TB",
      "Camera sau": "Chính 48MP (f/1.5) + Telephoto 12MP 5x zoom + Ultrawide 48MP",
      "Camera trước": "24MP TrueDepth",
      "Pin": "4685 mAh, sạc nhanh 45W, sạc không dây 25W MagSafe",
      "Hệ điều hành": "iOS 19",
      "Kết nối": "5G, Wi-Fi 7, Bluetooth 5.4, NFC, USB-C Thunderbolt 4",
      "Màu sắc": "Natural Titanium, Black Titanium, White Titanium, Desert Titanium",
      "Kích thước": "163.0 x 77.6 x 8.2 mm",
      "Trọng lượng": "227g",
      "Kháng nước": "IP68 (chịu nước 6m trong 30 phút)",
      "SIM": "eSIM + Nano SIM hoặc 2 eSIM"
    })
  },
  // ─── iPhone Air ────────────────────────────────────────────────────────
  {
    name: 'iPhone Air',
    description: `iPhone Air là chiếc iPhone mỏng nhất từ trước đến nay của Apple, chỉ dày 5.5mm, thiết kế siêu mỏng nhẹ với màn hình 6.6 inch tuyệt đẹp. Được trang bị chip A18 mạnh mẽ, camera chính 48MP và pin 4000 mAh, iPhone Air là lựa chọn lý tưởng cho những ai yêu thích sự thanh lịch, nhỏ gọn mà vẫn không đánh đổi hiệu năng.`,
    specifications: JSON.stringify({
      "Màn hình": "6.6 inch Super Retina XDR OLED, 60Hz, 2532x1170px, 460ppi",
      "Chip": "Apple A18 (3nm)",
      "RAM": "8GB",
      "Bộ nhớ trong": "128GB / 256GB",
      "Camera sau": "Chính 48MP (f/1.6) + Ultrawide 12MP",
      "Camera trước": "12MP TrueDepth",
      "Pin": "4000 mAh, sạc nhanh 30W, sạc không dây 25W MagSafe",
      "Hệ điều hành": "iOS 18",
      "Kết nối": "5G, Wi-Fi 6E, Bluetooth 5.3, NFC, USB-C",
      "Màu sắc": "Starlight, Midnight, Pink, Ultramarine, Teal",
      "Kích thước": "147.6 x 71.9 x 5.5 mm",
      "Trọng lượng": "145g",
      "Kháng nước": "IP68 (chịu nước 6m trong 30 phút)",
      "SIM": "eSIM + Nano SIM"
    })
  },
  // ─── Samsung Galaxy S26 Ultra ──────────────────────────────────────────
  {
    name: 'Samsung Galaxy S26 Ultra',
    description: `Samsung Galaxy S26 Ultra – Siêu phẩm Android đỉnh cao năm 2026 với camera 200MP cho ảnh cực kỳ sắc nét. S Pen tích hợp thông minh hơn với AI Writing Assist. Màn hình Dynamic AMOLED 2X 6.9 inch, tần số quét 120Hz, độ sáng cực đại 2500 nits. Chip Snapdragon 8 Elite 2 xử lý mọi tác vụ mượt mà, pin 5000mAh với sạc nhanh 45W.`,
    specifications: JSON.stringify({
      "Màn hình": "6.9 inch Dynamic AMOLED 2X, 3088x1440px, 120Hz, 2500nits",
      "Chip": "Snapdragon 8 Elite 2 (3nm)",
      "RAM": "12GB / 16GB",
      "Bộ nhớ trong": "256GB / 512GB / 1TB",
      "Camera sau": "Chính 200MP (f/1.7) + Periscope 50MP 10x + Telephoto 10MP 3x + Ultrawide 12MP",
      "Camera trước": "12MP",
      "Pin": "5000 mAh, sạc nhanh 45W, sạc không dây 15W",
      "Hệ điều hành": "Android 16, One UI 8",
      "Kết nối": "5G, Wi-Fi 7, Bluetooth 5.4, NFC, USB-C 3.2",
      "Màu sắc": "Titanium Silverblue, Titanium Black, Titanium White Silver, Titanium Gray",
      "Kích thước": "163.6 x 79.0 x 8.6 mm",
      "Trọng lượng": "229g",
      "Kháng nước": "IP68",
      "S Pen": "Tích hợp sẵn trong máy"
    })
  },
  // ─── Samsung Galaxy Z Fold7 ────────────────────────────────────────────
  {
    name: 'SamSung Galaxy Z Fold7',
    description: `Samsung Galaxy Z Fold7 – Điện thoại gập đỉnh cao với màn hình trong 7.9 inch siêu lớn, mỏng nhất dòng Fold từ trước đến nay chỉ 4.2mm khi mở. Khung titan bền bỉ, bản lề Flex Hinge thế hệ mới. Camera hình dưới màn hình (UDC) thế hệ 4 tiên tiến, chip Snapdragon 8 Elite 2 và AI Galaxy đem đến trải nghiệm đa nhiệm không thể đánh bại.`,
    specifications: JSON.stringify({
      "Màn hình trong": "7.9 inch Dynamic AMOLED 2X QXGA+, 120Hz",
      "Màn hình ngoài": "6.5 inch Dynamic AMOLED 2X HD+, 120Hz",
      "Chip": "Snapdragon 8 Elite 2 (3nm)",
      "RAM": "12GB",
      "Bộ nhớ trong": "256GB / 512GB / 1TB",
      "Camera sau": "Chính 200MP + Telephoto 10MP 3x + Ultrawide 12MP",
      "Camera trước (ngoài)": "10MP",
      "Camera UDC (trong)": "4MP Under Display",
      "Pin": "4400 mAh, sạc nhanh 25W, sạc không dây 15W",
      "Hệ điều hành": "Android 16, One UI 8",
      "Kết nối": "5G, Wi-Fi 7, Bluetooth 5.4, NFC, USB-C 3.2",
      "Màu sắc": "Navy, Silver Shadow, White",
      "Kích thước (mở)": "158.2 x 132.6 x 4.2 mm",
      "Kích thước (gập)": "158.2 x 67.9 x 9.1 mm",
      "Trọng lượng": "236g",
      "Kháng nước": "IPX8"
    })
  },
  // ─── Samsung Galaxy Z Flip7 ────────────────────────────────────────────
  {
    name: 'Samsung Galaxy Z Flip7',
    description: `Samsung Galaxy Z Flip7 – Điện thoại gập vỏ sò thời trang nhất 2025, thiết kế nhỏ gọn bỏ túi dễ dàng. Màn hình FlexWindow ngoài lớn hơn 4.0 inch cho phép xem thông báo, chụp ảnh selfie ngay khi gập máy. Chip Snapdragon 8s Elite mạnh mẽ, camera 50MP, pin 4000mAh sạc nhanh 20 phút đầy 50%.`,
    specifications: JSON.stringify({
      "Màn hình trong": "6.9 inch Dynamic AMOLED 2X FHD+, 120Hz",
      "FlexWindow (ngoài)": "4.0 inch Super AMOLED",
      "Chip": "Snapdragon 8s Elite (4nm)",
      "RAM": "8GB",
      "Bộ nhớ trong": "256GB / 512GB",
      "Camera sau": "Chính 50MP (f/1.8) + Ultrawide 12MP (f/2.2)",
      "Camera trước": "10MP",
      "Pin": "4000 mAh, sạc nhanh 25W, sạc không dây 15W",
      "Hệ điều hành": "Android 16, One UI 8",
      "Kết nối": "5G, Wi-Fi 7, Bluetooth 5.4, NFC, USB-C 3.2",
      "Màu sắc": "Crafted Black, White, Mint, Blue Amethyst, Blue Sunglow",
      "Kích thước (mở)": "165.1 x 71.9 x 6.9 mm",
      "Kích thước (gập)": "85.1 x 71.9 x 14.9 mm",
      "Trọng lượng": "187g",
      "Kháng nước": "IPX8"
    })
  },
  // ─── Samsung Galaxy S25 FE ─────────────────────────────────────────────
  {
    name: 'Samsung Galaxy S25 FE',
    description: `Samsung Galaxy S25 FE – Phiên bản Fan Edition mang dòng S25 đến tay người dùng ở mức giá tốt hơn. Thiết kế phẳng thanh lịch, màn hình Dynamic AMOLED 6.7 inch sắc nét, chip Exynos 2500 hiệu năng cao. Camera chính 50MP AI, pin 4900mAh sạc nhanh 45W là những điểm nhấn đáng chú ý.`,
    specifications: JSON.stringify({
      "Màn hình": "6.7 inch Dynamic AMOLED 2X FHD+, 120Hz, 1080x2340px",
      "Chip": "Exynos 2500 (3nm)",
      "RAM": "8GB",
      "Bộ nhớ trong": "128GB / 256GB",
      "Camera sau": "Chính 50MP (f/1.8) + Telephoto 10MP 3x + Ultrawide 12MP",
      "Camera trước": "10MP",
      "Pin": "4900 mAh, sạc nhanh 45W, sạc không dây 15W",
      "Hệ điều hành": "Android 15, One UI 7",
      "Kết nối": "5G, Wi-Fi 7, Bluetooth 5.4, NFC, USB-C 3.2",
      "Màu sắc": "Shadow, Coralred, Graphite, Mint, Teal",
      "Kích thước": "162.2 x 77.0 x 7.7 mm",
      "Trọng lượng": "205g",
      "Kháng nước": "IP68"
    })
  },
  // ─── iPhone 15 Pro Max ─────────────────────────────────────────────────
  {
    name: 'iPhone 15 Pro Max 256GB',
    description: `iPhone 15 Pro Max là siêu phẩm năm 2023 của Apple, trang bị chip A17 Pro đầu tiên trên tiến trình 3nm, hiệu năng vượt trội so với thế hệ trước. Thiết kế titan nhẹ hơn, nút Action Button đa năng, cổng USB-C Thunderbolt 3 tốc độ cao. Camera hệ thống 48MP với Telephoto 12MP 5x optical zoom lần đầu xuất hiện trên iPhone.`,
    specifications: JSON.stringify({
      "Màn hình": "6.7 inch Super Retina XDR OLED, ProMotion 120Hz, 2796x1290px, 460ppi",
      "Chip": "Apple A17 Pro Bionic (3nm)",
      "RAM": "8GB",
      "Bộ nhớ trong": "256GB / 512GB / 1TB",
      "Camera sau": "Chính 48MP (f/1.78) + Telephoto 12MP 5x + Ultrawide 12MP",
      "Camera trước": "12MP TrueDepth",
      "Pin": "4422 mAh, sạc nhanh 27W, sạc không dây 15W MagSafe",
      "Hệ điều hành": "iOS 17, nâng cấp lên iOS 18",
      "Kết nối": "5G, Wi-Fi 6E, Bluetooth 5.3, NFC, USB-C Thunderbolt 3",
      "Màu sắc": "Natural Titanium, Blue Titanium, White Titanium, Black Titanium",
      "Kích thước": "159.9 x 76.7 x 8.25 mm",
      "Trọng lượng": "221g",
      "Kháng nước": "IP68",
      "SIM": "eSIM + Nano SIM"
    })
  },
  // ─── Samsung Galaxy S22 Ultra ──────────────────────────────────────────
  {
    name: 'Samsung Galaxy S22 Ultra',
    description: `Samsung Galaxy S22 Ultra kết hợp hoàn hảo giữa dòng Note và S Series với S Pen tích hợp. Màn hình Dynamic AMOLED 2X 6.8 inch cực sắc, camera 108MP với khả năng chụp zoom 100x Space Zoom. Chip Snapdragon 8 Gen 1 đảm bảo hiệu năng ổn định cho các tác vụ nặng.`,
    specifications: JSON.stringify({
      "Màn hình": "6.8 inch Dynamic AMOLED 2X QHD+, 120Hz, 3088x1440px",
      "Chip": "Snapdragon 8 Gen 1 (4nm)",
      "RAM": "8GB / 12GB",
      "Bộ nhớ trong": "128GB / 256GB / 512GB / 1TB",
      "Camera sau": "Chính 108MP (f/1.8) + Telephoto 10MP 10x + Telephoto 10MP 3x + Ultrawide 12MP",
      "Camera trước": "40MP",
      "Pin": "5000 mAh, sạc nhanh 45W, sạc không dây 15W",
      "Hệ điều hành": "Android 12, nâng cấp lên Android 15",
      "Kết nối": "5G, Wi-Fi 6E, Bluetooth 5.2, NFC, USB-C 3.1",
      "Màu sắc": "Phantom Black, Phantom White, Burgundy, Green",
      "Kích thước": "163.3 x 77.9 x 8.9 mm",
      "Trọng lượng": "228g",
      "Kháng nước": "IP68",
      "S Pen": "Tích hợp sẵn trong máy"
    })
  },
  // ─── Xiaomi 15 Ultra 5G ────────────────────────────────────────────────
  {
    name: 'Xiaomi 15 Ultra 5G',
    description: `Xiaomi 15 Ultra 5G – Siêu phẩm chụp ảnh cộng tác cùng Leica với bộ camera 200MP HyperOIS tiên tiến. Màn hình LTPO AMOLED 6.73 inch QHD+ 2K sắc nét từng pixel. Chip Snapdragon 8 Elite mạnh mẽ, pin khổng lồ 6000mAh sạc siêu nhanh 90W và sạc không dây 80W.`,
    specifications: JSON.stringify({
      "Màn hình": "6.73 inch LTPO AMOLED QHD+ 3200x1440px, 1-120Hz, 3000nits",
      "Chip": "Snapdragon 8 Elite (3nm)",
      "RAM": "12GB / 16GB",
      "Bộ nhớ trong": "256GB / 512GB / 1TB",
      "Camera sau": "Leica 50MP (f/1.63, biến thiên) + 200MP Periscope 5x + 50MP Ultrawide",
      "Camera trước": "32MP",
      "Pin": "6000 mAh, sạc nhanh 90W (đầy trong 37 phút), sạc không dây 80W",
      "Hệ điều hành": "Android 15, HyperOS 2",
      "Kết nối": "5G, Wi-Fi 7, Bluetooth 5.4, NFC, USB-C 3.2",
      "Màu sắc": "White, Black, Titanium Gray",
      "Kích thước": "161.4 x 75.3 x 9.35 mm",
      "Trọng lượng": "226g",
      "Kháng nước": "IP68"
    })
  },
  // ─── Xiaomi Redmi Note 15 Pro ──────────────────────────────────────────
  {
    name: 'Xiaomi Redmi Note 15 Pro',
    description: `Xiaomi Redmi Note 15 Pro là điện thoại tầm trung được nâng cấp mạnh mẽ, camera 200MP ISOCELL HM6 siêu chi tiết, màn hình AMOLED 6.67 inch 2K 120Hz. Sạc nhanh 67W đầy pin 5200mAh trong 46 phút, thiết kế kính mờ cao cấp, chip Dimensity 7300 Ultra mạnh mẽ cho phân khúc giá.`,
    specifications: JSON.stringify({
      "Màn hình": "6.67 inch AMOLED FHD+, 120Hz, 1220x2712px, 446ppi",
      "Chip": "MediaTek Dimensity 7300 Ultra (4nm)",
      "RAM": "8GB / 12GB",
      "Bộ nhớ trong": "128GB / 256GB",
      "Camera sau": "Chính 200MP (f/1.65) + Ultrawide 8MP + Macro 2MP",
      "Camera trước": "20MP",
      "Pin": "5200 mAh, sạc nhanh 67W",
      "Hệ điều hành": "Android 14, HyperOS",
      "Kết nối": "5G, Wi-Fi 6, Bluetooth 5.3, NFC, USB-C 2.0",
      "Màu sắc": "Phantom Black, Midnight Blue, Sunrise Orange",
      "Kích thước": "162.3 x 74.6 x 8.0 mm",
      "Trọng lượng": "190g",
      "Kháng nước": "IP64"
    })
  },
  // ─── Xiaomi POCO F8 Pro 5G ─────────────────────────────────────────────
  {
    name: 'Xiaomi POCO F8 Pro 5G',
    description: `Xiaomi POCO F8 Pro 5G là "kẻ hủy diệt tầm trung" với chip Snapdragon 8 Gen 2 hiệu năng flagship thực sự ở tầm giá mid-range. Màn hình LiquidCool AMOLED 6.67 inch 120Hz tản nhiệt cực tốt, camera Sony IMX890 50MP, pin 4600mAh sạc siêu nhanh 120W.`,
    specifications: JSON.stringify({
      "Màn hình": "6.67 inch AMOLED FHD+, 120Hz, 2400x1080px",
      "Chip": "Qualcomm Snapdragon 8 Gen 2 (4nm)",
      "RAM": "8GB / 12GB",
      "Bộ nhớ trong": "256GB",
      "Camera sau": "Sony IMX890 50MP (f/1.88) + Ultrawide 8MP + Macro 2MP",
      "Camera trước": "16MP",
      "Pin": "4600 mAh, sạc nhanh 120W",
      "Hệ điều hành": "Android 13, MIUI 14",
      "Kết nối": "5G, Wi-Fi 6E, Bluetooth 5.3, NFC, USB-C 2.0",
      "Màu sắc": "Black, White, Yellow",
      "Kích thước": "162.5 x 75.4 x 8.0 mm",
      "Trọng lượng": "204g",
      "Kháng nước": "IP54"
    })
  },
  // ─── iPad Pro 11 inch M2 ───────────────────────────────────────────────
  {
    name: 'iPad Pro 11 inch M2',
    description: `iPad Pro 11 inch M2 mang lại hiệu năng desktop thực sự với chip M2 mạnh mẽ. Màn hình Liquid Retina 11 inch ProMotion 120Hz xuất sắc, hỗ trợ Apple Pencil (2nd gen) với Hover Detection cực nhạy. USB-C Thunderbolt 4 cho phép kết nối màn hình 6K ngoài. Lý tưởng cho sáng tác nội dung, thiết kế và làm việc chuyên nghiệp.`,
    specifications: JSON.stringify({
      "Màn hình": "11.0 inch Liquid Retina IPS, ProMotion 120Hz, 2388x1668px, 264ppi",
      "Chip": "Apple M2 (5nm)",
      "RAM": "8GB / 16GB",
      "Bộ nhớ trong": "128GB / 256GB / 512GB / 1TB / 2TB",
      "Camera sau": "12MP Wide (f/1.8) + 10MP Ultrawide + LiDAR",
      "Camera trước": "12MP TrueDepth",
      "Pin": "7538 mAh, sạc nhanh 20W, sạc không dây qua Magic Connector",
      "Hệ điều hành": "iPadOS 16, nâng cấp lên iPadOS 18",
      "Kết nối": "Wi-Fi 6E, Bluetooth 5.3, USB-C Thunderbolt 4, 5G (tùy phiên bản)",
      "Màu sắc": "Space Gray, Silver",
      "Kích thước": "247.6 x 178.5 x 5.9 mm",
      "Trọng lượng": "466g (Wi-Fi)",
      "Bút": "Hỗ trợ Apple Pencil (2nd gen)"
    })
  },
  // ─── MacBook Air M3 2024 ───────────────────────────────────────────────
  {
    name: 'MacBook Air M3 2024',
    description: `MacBook Air M3 2024 – Chiếc laptop mỏng nhẹ thông minh nhất từ trước đến nay. Chip M3 đem đến hiệu năng đột phá, CPU nhanh hơn 60% và GPU nhanh hơn 2x so với MacBook Air M1. Màn hình Liquid Retina 13 inch tương phản 500 nits, pin lên đến 18 giờ, hỗ trợ 2 màn hình ngoài – lần đầu tiên trên MacBook Air.`,
    specifications: JSON.stringify({
      "Màn hình": "13.6 inch Liquid Retina IPS, 2560x1664px, 224ppi, 500nits",
      "Chip": "Apple M3 (3nm) – 8 CPU cores, 10 GPU cores",
      "RAM": "8GB / 16GB / 24GB",
      "Bộ nhớ trong": "256GB / 512GB / 1TB / 2TB SSD",
      "Camera": "1080p FaceTime HD",
      "Pin": "52.6 Wh, lên đến 18 giờ sử dụng",
      "Hệ điều hành": "macOS Sonoma, nâng cấp lên macOS Sequoia",
      "Kết nối": "Wi-Fi 6E, Bluetooth 5.3, 2x USB-C Thunderbolt 3, MagSafe 3, 3.5mm jack",
      "Màu sắc": "Midnight, Starlight, Space Gray, Sky Blue",
      "Kích thước": "304.1 x 215.0 x 11.5 mm",
      "Trọng lượng": "1.24 kg",
      "Bàn phím": "Magic Keyboard có Touch ID",
      "Màn hình ngoài": "Hỗ trợ 2 màn hình Thunderbolt/USB-C"
    })
  },
  // ─── AirPods Pro 2 ─────────────────────────────────────────────────────
  {
    name: 'AirPods Pro 2',
    description: `AirPods Pro thế hệ 2 với chip H2 mới, chống ồn Active Noise Cancellation mạnh gấp 2 lần thế hệ trước. Adaptive Audio tự động điều chỉnh âm thanh theo môi trường xung quanh. Pin 6 giờ nghe, 30 giờ với hộp sạc. Hộp sạc hỗ trợ USB-C, sạc không dây MagSafe và Apple Watch. Tính năng Hearing Aid FDA-approved.`,
    specifications: JSON.stringify({
      "Chip": "Apple H2",
      "Chống ồn": "Active Noise Cancellation thế hệ 2 (40dB)",
      "Âm thanh": "Adaptive Audio, Personalized Spatial Audio, Transparency Mode",
      "Pin tai nghe": "6 giờ (ANC bật), 7.5 giờ (ANC tắt)",
      "Pin hộp sạc": "Tổng cộng 30 giờ với hộp sạc",
      "Sạc hộp": "USB-C, Lightning (phiên bản cũ), MagSafe, Apple Watch charger",
      "Kết nối": "Bluetooth 5.3, H2 chip",
      "Kháng nước": "IPX4 (tai nghe và hộp sạc)",
      "Màu sắc": "White",
      "Trọng lượng": "5.3g mỗi tai, 50.8g hộp sạc",
      "Tính năng đặc biệt": "Find My, Siri, Touch sensor, Hearing Aid"
    })
  },
  // ─── Apple Watch Series 9 ─────────────────────────────────────────────
  {
    name: 'Apple Watch Series 9',
    description: `Apple Watch Series 9 với chip S9 mới, màn hình Always-On Retina sáng hơn 2000 nits ngoài trời. Tính năng Double Tap bằng 2 ngón tay điều khiển không cần chạm màn hình. Siri xử lý on-device nhanh hơn 25%, đo oxy trong máu, đo ECG, phát hiện té ngã. Carbon neutral – đồng hồ thân thiện môi trường đầu tiên của Apple.`,
    specifications: JSON.stringify({
      "Màn hình": "Always-On Retina LTPO OLED, 2000nits max, 41mm hoặc 45mm",
      "Chip": "Apple S9 SiP",
      "Bộ nhớ": "64GB",
      "Pin": "18 giờ sử dụng thông thường, 36 giờ chế độ Low Power",
      "Sạc": "Magnetic Fast Charging USB-C (đầy 80% trong 45 phút)",
      "Cảm biến sức khỏe": "ECG, Blood Oxygen (SpO2), Heart Rate, Skin Temperature",
      "Kết nối": "LTE + GPS, Bluetooth 5.3, Wi-Fi 802.11b/g/n 2.4GHz + 5GHz, NFC",
      "Hệ điều hành": "watchOS 10",
      "Kháng nước": "WR50 (50m)",
      "Màu sắc vỏ": "Starlight, Midnight, Silver, Red, Pink, (PRODUCT)RED",
      "Vật liệu vỏ": "Nhôm Aerospace-grade, Thép không gỉ",
      "Kích thước": "41mm x 35mm x 10.7mm hoặc 45mm x 38mm x 10.7mm",
      "Tính năng đặc biệt": "Double Tap, Crash Detection, Emergency SOS"
    })
  },
  // ─── Sạc Anker 10000mAh ───────────────────────────────────────────────
  {
    name: 'Sạc dự phòng Anker 10000mAh',
    description: `Anker PowerCore 10000mAh là pin dự phòng nhỏ gọn nhất dòng 10000mAh của Anker, nhỏ hơn 25% so với pin dự phòng cùng dung lượng khác. Công nghệ PowerIQ 3.0 tự nhận diện thiết bị để cung cấp tốc độ sạc tối ưu. Sạc được 2.5 lần iPhone 14, có thể sạc đồng thời 2 thiết bị.`,
    specifications: JSON.stringify({
      "Dung lượng": "10000 mAh",
      "Đầu ra": "USB-A: 22.5W (PowerIQ 3.0) + USB-C: 20W PD",
      "Đầu vào": "USB-C: 20W, Micro-USB: 10W",
      "Sạc đồng thời": "2 thiết bị cùng lúc",
      "Dung lượng thực tế": "~6500mAh (hiệu suất chuyển đổi 65%)",
      "Màu sắc": "Đen, Trắng, Xanh Navy",
      "Kích thước": "91.3 x 62 x 22 mm",
      "Trọng lượng": "180g",
      "Tính năng": "PowerIQ 3.0, Voltage Boost, Temperature Protection",
      "Tương thích": "iPhone, Samsung, iPad, AirPods, và mọi thiết bị USB"
    })
  },
  // ─── JBL Flip 6 ─────────────────────────────────────────────────────
  {
    name: 'Loa Bluetooth JBL Flip 6',
    description: `JBL Flip 6 nâng cấp động cơ Racetrack để cải thiện bass và âm trầm rõ rệt hơn Flip 5. Tweeter riêng biệt cho âm cao trong trẻo hơn. Loa ngoài trời chống nước IP67, pin 12 giờ, ghép nối với 100+ loa JBL qua PartyBoost. Thiết kế hình trụ classic bắt mắt với 6 màu phong phú.`,
    specifications: JSON.stringify({
      "Công suất": "30W (2 x 15W)",
      "Driver": "2 full-range drivers + 2 racetrack passive radiators + tweeter",
      "Tần số đáp ứng": "63Hz – 20kHz",
      "Pin": "4800mAh, lên đến 12 giờ",
      "Sạc": "USB-C, 2.5 giờ sạc đầy",
      "Kết nối": "Bluetooth 5.1, hỗ trợ PartyBoost",
      "Kháng nước": "IP67 (chịu nước 1m trong 30 phút, chống bụi)",
      "Màu sắc": "Đen, Xanh Navy, Xanh Lá, Đỏ, Hồng, Xám",
      "Kích thước": "178 x 68 x 72 mm",
      "Trọng lượng": "550g",
      "Tính năng": "PartyBoost, JBL App, Eco Mode"
    })
  },
  // ─── Logitech MX Mechanical ───────────────────────────────────────────
  {
    name: 'Bàn phím cơ Logitech MX Mechanical',
    description: `Logitech MX Mechanical là bàn phím cơ cao cấp dành cho người dùng chuyên nghiệp, kết hợp giữa độ chính xác của switch cơ học và sự tiện lợi của kết nối không dây. Kết nối đồng thời 3 thiết bị, backlight thông minh tự sáng khi bàn tay tiếp cận, pin 15 ngày (backlight bật) hoặc 10 tháng (tắt backlight).`,
    specifications: JSON.stringify({
      "Switch": "Tactile Quiet / Clicky / Linear (tùy phiên bản)",
      "Kết nối": "Logi Bolt USB receiver + Bluetooth, Easy-Switch 3 thiết bị",
      "Tương thích": "Windows, macOS, Linux, Chrome OS",
      "Pin": "AAA x 2, lên đến 15 ngày (backlight bật) / 10 tháng (backlight tắt)",
      "Backlight": "RGB per-key, tự sáng khi tiếp cận (Smart Illumination)",
      "Hành trình phím": "4mm, điểm kích hoạt 2mm",
      "Màu sắc": "Graphite, Pale Gray",
      "Kích thước (full-size)": "430 x 131.6 x 20.5 mm",
      "Trọng lượng": "855g",
      "Tính năng": "Flow Cross-computer, Easy-Switch, USB-C sạc"
    })
  }
];

async function updateDescriptions() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mobilestore_db',
  });

  console.log('✅ Kết nối DB thành công!\n');

  let updated = 0;
  let notFound = 0;

  for (const p of products) {
    const [rows] = await conn.query(
      'SELECT product_id, product_name FROM products WHERE product_name LIKE ?',
      [`%${p.name}%`]
    );

    if (rows.length === 0) {
      console.log(`⚠️  Không tìm thấy: "${p.name}"`);
      notFound++;
      continue;
    }

    for (const row of rows) {
      await conn.query(
        'UPDATE products SET description = ?, specifications = ? WHERE product_id = ?',
        [p.description.trim(), p.specifications, row.product_id]
      );
      console.log(`✅ Đã cập nhật [ID ${row.product_id}]: ${row.product_name}`);
      updated++;
    }
  }

  console.log(`\n📊 Kết quả: Cập nhật ${updated} sản phẩm, không tìm thấy ${notFound} sản phẩm`);
  await conn.end();
}

updateDescriptions().catch(e => console.error('❌ Lỗi:', e.message));
