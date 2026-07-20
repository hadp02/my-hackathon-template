# Hướng dẫn Deploy (Dokploy) — [Tên Dự Án]

Tài liệu này hướng dẫn chi tiết cách deploy dự án lên máy chủ Dokploy. Mô hình triển khai là **Application Mode** (không dùng Docker Compose). Chúng ta sẽ tạo 3 service riêng biệt trên Dokploy: **Database**, **Backend**, và **Frontend**.

## Prerequisites
- **VPS** với [Dokploy](https://docs.dokploy.com) đã cài đặt (tối thiểu 4GB RAM)
- **Domain** trỏ về IP của VPS
- **Git repo** kết nối được với Dokploy (GitHub)

## Kiến trúc trên Dokploy

```
Dokploy Project: "[Tên Dự Án]"
├── Application: backend       → services/backend/Dockerfile   → api.domain.com
├── Application: web           → apps/web/Dockerfile           → app.domain.com
└── Database: postgres         → Dokploy built-in PostgreSQL   → internal only
```

---

## Bước 1: Setup Database Service
1. Đăng nhập vào Dokploy UI.
2. Chọn Project của bạn -> Bấm **Create Service** -> Chọn **PostgreSQL**.
3. Điền thông tin cấu hình cơ bản (Database Name, User, Password). Bạn có thể tự đặt hoặc để Dokploy random sinh ra.
4. Bấm **Deploy**.
5. **Lưu ý quan trọng**: Ở màn hình chi tiết của Database vừa tạo, hãy ghi lại **Tên Service Nội Bộ** (Internal Hostname) ví dụ: `[tên-service-postgres-xyz]`. Bạn sẽ cần nó để cấu hình cho Backend.
6. (Optional) Nếu muốn kết nối DB này từ máy local của dev, hãy mở tab **External Port** và bật Public Port (vd: 5432).

---

## Bước 2: Setup Backend (FastAPI)
1. Ở giao diện Project, bấm **Create Service** -> Chọn **Application**.
2. **General**:
   - Name: `backend-staging`
   - Provider: **GitHub**. Lấy code từ repository của team, chọn nhánh `dev`.
3. **Build**:
   - Build Type: **Dockerfile**
   - Build Context: `/` (Thư mục gốc của dự án)
   - Dockerfile Path: `services/backend/Dockerfile`
4. **Environment**:
   Chuyển sang tab Environment Variables, cấu hình để kết nối với DB ở Bước 1:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=<mat-khau-db-o-buoc-1>
   POSTGRES_SERVER=<internal-hostname-o-buoc-1.5>
   POSTGRES_PORT=5432
   POSTGRES_DB=dev-db
   ```

   > 🔐 Điền giá trị thật **trực tiếp trên Dokploy UI**, đây là nơi lưu secret của
   > dự án. Không commit chúng vào repo. Xem [SECRETS.md](SECRETS.md).
5. **Port**:
   - Internal Port: `8002` (Vì FastAPI expose port 8002).
   - Domain: Cấu hình domain hoặc sub-domain (vd: `api-staging.yourdomain.com`).
6. Bấm **Deploy** và chờ quá trình build hoàn tất. Dokploy sẽ tự động listen push webhook trên nhánh `dev`.

---

## Bước 3: Setup Frontend (React + Vite)
1. Bấm **Create Service** -> Chọn **Application**.
2. **General**:
   - Name: `frontend-staging`
   - Provider: **GitHub** -> Chọn repo và nhánh `dev`.
3. **Build**:
   - Build Type: **Dockerfile**
   - Build Context: `/` (Thư mục gốc)
   - Dockerfile Path: `apps/web/Dockerfile`
4. **Environment**:
   Vite build ở phía Frontend cần biết URL của backend API. Trong `Dockerfile` đã setup sẵn `ARG VITE_API_URL`. Khi bạn thêm biến ở Dokploy, nó sẽ tự động được inject vào:
   ```env
   VITE_API_URL=https://api-staging.yourdomain.com  # Điền domain của backend bạn vừa setup ở Bước 2
   ```
5. **Port**:
   - Internal Port: `80` (Bởi vì container dùng Nginx).
   - Domain: Cấu hình domain staging (vd: `staging.yourdomain.com`).
6. Bấm **Deploy**.

---

## Bước 4: Auto Deploy (CI/CD)
Mặc định, khi chọn GitHub Provider qua Dokploy App, Dokploy đã tự động đăng ký Webhook.
- Bất kỳ code nào được **push** hoặc **merge** vào nhánh `dev`, Dokploy sẽ tự động trigger quá trình rebuild cho cả Backend và Frontend.
- Team của bạn chỉ cần truy cập vào Domain Staging để thấy bản cập nhật mới nhất.

Nếu webhook chưa được tạo tự động, setup thủ công:
1. Vào Dokploy dashboard > **General** tab > bật **Auto Deploy**.
2. Vào **Deployments** tab > copy **Webhook URL**.
3. Trong **GitHub repo** > **Settings > Webhooks > Add webhook** > paste URL, Content-Type = `application/json`, chọn "Just the push event".

---

## Branch-Based Environments

| Environment | Branch | Database | Domain |
|---|---|---|---|
| **Dev/Staging** | `dev` | DB riêng cho dev | `staging.domain.com` |
| **Production** | `main` | DB riêng cho production | `app.domain.com` |

---

## Database Schema & Migrations
Schema được quản lý bởi SQLAlchemy models. Migrations chạy tự động khi app khởi động (via `start.sh` → `alembic upgrade head`).

Khi tạo migration mới:
```bash
make migrate-new m="add_new_table"
make migrate
```

