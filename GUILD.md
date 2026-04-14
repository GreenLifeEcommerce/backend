# 🚀 Hướng dẫn tạo Module nhanh trong Green-Life (Mongoose Edition)

Sử dụng NestJS CLI để tự động tạo cấu trúc file và đăng ký module chỉ bằng một câu lệnh.

---

## 🛠️ Sử dụng lệnh tạo nhanh (Scaffolding)

Tôi đã thiết lập các lệnh phím tắt trong `package.json`. Bạn chỉ cần mở terminal và chạy:

### 1. Tạo trọn bộ CRUD (Khuyên dùng)

```bash
npm run gen:res products
```

_(Chọn "REST API" và "Yes" khi được hỏi có tạo CRUD entry points không)_

---

## 🔧 Các bước cần chỉnh sửa sau khi tạo bằng CLI (Chuẩn Mongoose)

Sau khi NestJS tạo file mẫu, bạn cần chỉnh sửa để dùng Mongoose thay vì TypeORM mặc định:

### 1. Sửa Entity sang Schema (`entities/<name>.entity.ts`)

```typescript
@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { getters: true, virtuals: true },
})
export class Product {
  @Transform(({ value }) => value?.toString())
  _id: string;

  @Prop({ required: true })
  name: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
```

### 2. Sửa Service (`<name>.service.ts`)

Sử dụng `InjectModel` và các hàm của Mongoose:

```typescript
constructor(
  @InjectModel(Product.name)
  private readonly productModel: Model<ProductDocument>,
) {}

async findOne(id: string) {
  return this.productModel.findById(id).exec();
}
```

### 3. Sửa Module (`<name>.module.ts`)

Đăng ký Schema với `MongooseModule`:

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  ...
})
```

---

## 💡 Lưu ý quan trọng

1. **Xác thực**: Gắn `@Public()` nếu muốn API không cần đăng nhập. Gắn `@ApiBearerAuth()` nếu yêu cầu Token.
2. **ObjectId**: Mongoose tự động xử lý ID chuỗi sang ObjectId, bạn chỉ cần dùng `findById(id)`.
3. **Response Format**: `TransformInterceptor` vẫn tự động bọc kết quả cho bạn.
