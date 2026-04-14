# 🚀 Hướng dẫn tạo Module nhanh trong Green-Life

Sử dụng NestJS CLI để tự động tạo cấu trúc file và đăng ký module chỉ bằng một câu lệnh.

---

## 🛠️ Sử dụng lệnh tạo nhanh (Scaffolding)

Tôi đã thiết lập các lệnh phím tắt trong `package.json`. Bạn chỉ cần mở terminal và chạy:

### 1. Tạo trọn bộ CRUD (Khuyên dùng)

Lệnh này sẽ tạo đủ: Module, Controller, Service, DTO, Entity và các hàm CRUD mẫu.

```bash
npm run gen:res products
```

_(Chọn "REST API" và "Yes" khi được hỏi có tạo CRUD entry points không)_

### 2. Tạo lẻ từng thành phần

- **Chỉ tạo Module:** `npm run gen:mo products`
- **Chỉ tạo Controller:** `npm run gen:co products`
- **Chỉ tạo Service:** `npm run gen:s products`

---

## Cấu trúc thư mục chuẩn sau khi tạo

Sau khi chạy CLI, cấu trúc sẽ như sau (bạn cần chuyển file vào đúng thư mục con):

```text
src/<module>/
├── dto/              # Các Data Transfer Objects (Validation)
├── entities/         # Các Entity của TypeORM (MongoDB)
├── <module>.controller.ts
├── <module>.service.ts
└── <module>.module.ts
```

---

## Các bước cần chỉnh sửa sau khi tạo bằng CLI

Vì chúng ta dùng **MongoDB**, sau khi NestJS tạo file mẫu, bạn cần chỉnh sửa vài chỗ:

### 1. Sửa Entity (`entities/<name>.entity.ts`)

Thay đổi decorator khóa chính sang MongoDB:

```typescript
@Entity({ name: 'products' })
export class Product {
  @ObjectIdColumn()
  @Transform(({ value }) => value?.toString())
  id: ObjectId;

  @Column()
  name: string;
}
```

### 2. Sửa Service (`<name>.service.ts`)

Nhớ dùng `ObjectId` khi tìm kiếm theo ID:

```typescript
async findOne(id: string) {
  return this.productRepository.findOne({
    where: { _id: new ObjectId(id) } as any
  });
}
```

### 3. Sửa Controller (`<name>.controller.ts`)

- Gắn `@ApiTags('<tên-module>')` để hiển thị trên Swagger.
- Mặc định mọi API đều bị chặn. Gắn `@Public()` nếu muốn mở công khai.
- Gắn `@ApiBearerAuth()` nếu API yêu cầu đăng nhập.

---

## Lưu ý quan trọng

1. **Tự động đăng ký**: Khi dùng lệnh CLI, NestJS sẽ tự động `import` module mới vào `AppModule.ts`. Bạn không cần làm thủ công nữa.
2. **Response Format**: `TransformInterceptor` đã được cài toàn cục, mọi kết quả trả về từ Controller sẽ tự động được bọc trong format chuẩn `{ statusCode, data, ... }`.
