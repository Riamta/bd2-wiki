# Hệ thống Authentication BD2 Wiki

## Tổng quan
Hệ thống authentication đã được tích hợp vào BD2 Wiki với các tính năng:
- Đăng nhập/đăng xuất
- Phân quyền theo role (admin/user)
- Bảo vệ routes
- Session management với JWT
- UI responsive

## Cấu trúc Files

### 1. Types & Interfaces
- `src/types/auth.ts` - Định nghĩa các types cho authentication

### 2. Context & State Management
- `src/contexts/AuthContext.tsx` - React Context quản lý trạng thái authentication

### 3. API Routes
- `src/app/api/auth/login/route.ts` - API đăng nhập
- `src/app/api/auth/logout/route.ts` - API đăng xuất
- `src/app/api/auth/me/route.ts` - API kiểm tra authentication status

### 4. Components & Pages
- `src/components/LoginForm.tsx` - Form đăng nhập
- `src/app/login/page.tsx` - Trang đăng nhập
- `src/app/dashboard/page.tsx` - Dashboard cho admin
- `src/components/HeaderMenu.tsx` - Header với authentication UI

### 5. Data Storage
- `src/data/users.json` - File JSON lưu trữ tài khoản

### 6. Middleware
- `middleware.ts` - Bảo vệ routes và phân quyền

## Tài khoản Demo

### Admin Accounts:
- **Username:** `admin` | **Password:** `admin123`
- **Username:** `demo_admin` | **Password:** `demo123`

### User Accounts:
- **Username:** `user` | **Password:** `user123`
- **Username:** `demo_user` | **Password:** `demo123`

## Cách sử dụng

### 1. Đăng nhập
1. Truy cập `/login`
2. Nhập username và password
3. Click "Sign In"

### 2. Phân quyền
- **Admin:** Có thể truy cập `/dashboard` và tất cả tính năng
- **User:** Chỉ có thể truy cập các trang công khai

### 3. Dashboard (Admin only)
- Truy cập `/dashboard` (chỉ admin)
- Xem thống kê hệ thống
- Quản lý thông tin tài khoản

### 4. Codes Management (Admin only)
- Từ dashboard, click "Manage Codes" trong Admin Tools section
- **Thêm code mới:**
  - Click "Add Code"
  - Nhập code, reward, start date, end date
  - Start/End date mặc định là ngày hiện tại
- **Chỉnh sửa code:**
  - Click icon Edit (✏️)
  - Có thể sửa tất cả thông tin bao gồm start date
- **Xóa code:**
  - Click icon Delete (🗑️)
  - Xác nhận xóa
- **Tự động cập nhật status:** Code sẽ tự động chuyển thành "Expired" khi hết hạn

### 5. Đăng xuất
- Click vào username trong header
- Chọn "Logout"

## Tính năng

### Authentication
- ✅ JWT-based authentication
- ✅ HTTP-only cookies
- ✅ Session persistence
- ✅ Auto-redirect after login

### Authorization
- ✅ Role-based access control
- ✅ Route protection
- ✅ Admin-only pages
- ✅ Middleware protection

### Admin Features
- ✅ **Codes Management** - CRUD operations for promotional codes
- ✅ Admin dashboard with tools section
- ✅ Real-time code status updates
- ✅ Bulk operations support

### UI/UX
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ User feedback


### Security
- ✅ Password protection
- ✅ JWT token validation
- ✅ Secure cookie settings
- ✅ Route-level protection

## Cấu hình

### Environment Variables
Tạo file `.env.local`:
```
JWT_SECRET=your-super-secret-jwt-key-here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Thêm tài khoản mới
Sử dụng MongoDB để quản lý users. Tài khoản admin mặc định:
- Username: `admin`
- Password: `admin123`

Để tạo user mới, có thể:
1. Sử dụng script: `node src/scripts/create-admin-user.js`
2. Thêm trực tiếp vào MongoDB collection `users`
3. Tạo API endpoint để đăng ký user mới

## Bảo mật

### Lưu ý quan trọng:
1. **Đổi JWT_SECRET** trong production
2. **Mã hóa password** (hiện tại đang lưu plain text cho demo)
3. **HTTPS** trong production
4. **Rate limiting** cho API login
5. **Password complexity** requirements

### Cải tiến có thể thêm:
- Password hashing (bcrypt)
- Email verification
- Password reset
- Two-factor authentication
- Account lockout
- Audit logging

## Troubleshooting

### Lỗi thường gặp:
1. **"Invalid token"** - Token hết hạn hoặc không hợp lệ
2. **"Access Denied"** - Không đủ quyền truy cập
3. **"Network error"** - Lỗi kết nối API

### Debug:
- Kiểm tra browser console
- Xem Network tab trong DevTools
- Kiểm tra cookies
- Xem server logs

## Testing

### Test các tính năng:
1. Đăng nhập với các tài khoản khác nhau
2. Truy cập `/dashboard` với user thường (should redirect)
3. Truy cập `/dashboard` với admin (should work)
4. Đăng xuất và kiểm tra session
5. Refresh page và kiểm tra persistence
