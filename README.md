# Green-Life Backend 🌿

![Build Status](https://github.com/GreenLifeEcommerce/backend/actions/workflows/ci.yml/badge.svg)
![Prettier](https://img.shields.io/badge/Code%20style-prettier-informational?logo=prettier&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 Giới thiệu

**Green-Life** là hệ thống Backend cho nền tảng thương mại điện tử chuyên cung cấp các sản phẩm bảo vệ môi trường. Dự án sử dụng NestJS, kết hợp với MongoDB và Redis để đảm bảo hiệu năng và tính linh hoạt.

## 🛠️ Mô hình phát triển (Hybrid Setup)

Để tối ưu hóa tốc độ phát triển, dự án sử dụng mô hình:

- **Docker**: Quản lý cơ sở hạ tầng (MongoDB & Redis). Bạn không cần cài đặt DB thủ công trên máy.
- **Node.js**: Chạy trực tiếp mã nguồn ứng dụng trên máy local để hỗ trợ Hot-Reload nhanh nhất.

---

## 🚀 Hướng dẫn cài đặt

### 1. Cấu hình môi trường

Tạo file `.env` từ file mẫu:

```bash
# Trên Windows
copy .env.example .env

# Trên Linux/MacOS
cp .env.example .env
```

### 2. Khởi động Cơ sở hạ tầng (Docker)

Đảm bảo bạn đã cài đặt **Docker Desktop**. Chạy lệnh sau để khởi động MongoDB và Redis:

```bash
docker-compose up -d
```

### 3. Cài đặt và Chạy ứng dụng (Node.js)

```bash
# Cài đặt thư viện
npm install

# Chạy chế độ phát triển (Tự động tải lại khi sửa code)
npm run start:dev
```

---

## 🏗️ Hướng dẫn mở rộng (Tạo Module mới)

Dự án có sẵn CLI để tạo nhanh các chức năng mới (Product, Order, v.v.). Xem chi tiết tại:
👉 **[Hướng dẫn tạo Module mới (GUILD.md)](GUILD.md)**

---

## 📝 Tài liệu API (Swagger)

Sau khi ứng dụng khởi động thành công, truy cập ngay tại:
👉 **[http://localhost:8080/docs](http://localhost:8080/docs)**

## 🧪 Kiểm thử (Testing)

```bash
# Chạy Unit tests
npm run test:unit

# Chạy E2E tests
npm run test:e2e
```

## 📄 Bản quyền

Dự án được phát hành dưới giấy phép [MIT](./LICENSE).

---

## 🛠️ Quy tắc phát triển (Coding Convention)

1. **Pre-commit**: Tự động chạy `Lint` và `Format` trước khi commit.
2. **Pre-push**: Tự động chạy `Unit Test` trước khi push code lên GitHub.
