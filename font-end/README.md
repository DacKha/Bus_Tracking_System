# Smart School Bus Tracking System - Front-end

Hệ thống quản lý và theo dõi xe đưa đón học sinh thông minh. Ứng dụng web Next.js cho admin, tài xế, và phụ huynh.

## Tính Năng

### Cho Quản Lý (Admin)
- Xem tổng quan dashboard (thống kê xe, tài xế, học sinh, tuyến đường)
- Quản lý xe buýt (CRUD)
- Quản lý tài xế (CRUD)
- Quản lý học sinh (CRUD)
- Quản lý tuyến đường (CRUD)
- Lên lịch trình xe (tuần/tháng)
- Theo dõi lịch trình hôm nay
- Gửi tin nhắn cho tài xế/phụ huynh
- Cài đặt hệ thống (ngôn ngữ, giao diện)

### Cho Tài Xế (Driver)
- Xem lịch trình hàng ngày
- Danh sách học sinh cần đón
- Báo cáo tình trạng đón/trả
- Gửi cảnh báo khi có sự cố

### Cho Phụ Huynh (Parent)
- Theo dõi vị trí xe buýt con mình
- Nhận thông báo khi xe đến gần
- Nhận cảnh báo khi xe bị trễ
- Xem lịch trình con từng ngày

## Cấu Trúc Dự Án

```
font-end/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/          # Admin pages
│   │   ├── driver/         # Driver pages
│   │   ├── parents/        # Parent pages
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home (redirect)
│   ├── components/         # Reusable React components
│   ├── context/            # React Context (Auth, etc)
│   ├── lib/                # Services & utilities
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript interfaces
│   └── utils/              # Helper functions
├── public/                 # Static files
├── .env.local              # Environment variables
└── package.json            # Dependencies
```

## Yêu Cầu Hệ Thống

- Node.js 18+
- npm hoặc yarn
- Backend API chạy tại `http://localhost:5000`

## Cài Đặt

### 1. Clone Repository
```bash
cd font-end
```

### 2. Cài Đặt Dependencies
```bash
npm install
# hoặc
yarn install
```

### 3. Cấu Hình Environment
Tạo file `.env.local` (nếu chưa có):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Smart School Bus
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4. Chạy Development Server
```bash
npm run dev
# hoặc
yarn dev
```

Truy cập [http://localhost:3000](http://localhost:3000)

## Build Production

```bash
npm run build
npm start
```

## Tài Khoản Demo

### Admin
- Email: `admin@ssb.com`
- Password: `Admin@123`

### Driver
- Email: `driver@ssb.com`
- Password: `Driver@123`

### Parent
- Email: `parent@ssb.com`
- Password: `Parent@123`

## Công Nghệ Sử Dụng

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icons
- **date-fns** - Date utilities

## Các Trang Chính

### Admin
- `/admin/login` - Đăng nhập
- `/admin` - Dashboard
- `/admin/bus` - Quản lý xe
- `/admin/driver` - Quản lý tài xế
- `/admin/student` - Quản lý học sinh
- `/admin/route` - Quản lý tuyến
- `/admin/schedule` - Quản lý lịch trình
- `/admin/message` - Tin nhắn
- `/admin/setting` - Cài đặt

### Driver
- `/admin/login` - Đăng nhập (dùng chung)
- `/driver` - Dashboard
- `/driver/home` - Trang chủ
- `/driver/students` - Danh sách học sinh

### Parent
- `/parents/login` - Đăng nhập
- `/parents/home` - Dashboard
- `/parents/tracking` - Theo dõi xe (khi hoàn thiện)

## API Integration

Ứng dụng kết nối với backend thông qua:

- **Base URL**: `http://localhost:5000/api`
- **Authorization**: JWT token trong header `Authorization: Bearer {token}`
- **Real-time**: Socket.IO cho tracking

## Services (Lib)

- `authService.ts` - Xác thực người dùng
- `busService.ts` - Quản lý xe
- `driverService.ts` - Quản lý tài xế
- `studentService.ts` - Quản lý học sinh
- `routeService.ts` - Quản lý tuyến
- `scheduleService.ts` - Quản lý lịch trình
- `messageService.ts` - Quản lý tin nhắn
- `dashboardService.ts` - Dữ liệu dashboard
- `parentService.ts` - Dữ liệu phụ huynh

## Hướng Phát Triển

- [ ] Thêm tính năng real-time tracking (Google Maps/Leaflet)
- [ ] Push notifications
- [ ] Offline support (PWA)
- [ ] Internationalization (i18n)
- [ ] Dark mode (đã có framework)
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Report generation

## Troubleshooting

### Lỗi "Cannot find module"
```bash
npm install
```

### Backend không kết nối
- Kiểm tra backend chạy tại `http://localhost:5000`
- Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env.local`

### CORS Error
- Đảm bảo backend có CORS config đúng
- Backend URL phải khớp với `NEXT_PUBLIC_API_URL`

## Liên Hệ & Hỗ Trợ

Vui lòng liên hệ với team phát triển để được hỗ trợ.

---

Made with ❤️ for Smart School Bus Tracking System
