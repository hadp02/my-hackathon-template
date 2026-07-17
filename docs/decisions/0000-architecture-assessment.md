# Architecture Assessment & PoC/MVP Strategy

**Date:** 2026-07-13
**Context:** Đánh giá cấu trúc Micro-services hiện tại, mức độ phù hợp cho PoC/MVP, và định hướng scale.

---

## 1. Phân tích Cấu trúc Hiện tại (Current Architecture)

Dự án hiện tại được thiết kế theo mô hình Micro-services (chia nhỏ thành 6 thành phần deploy riêng biệt):
- **Frontend (Apps):** `landing`, `workspace`, `admin`
- **Backend (Services):** `api`, `ai`, `mock-llm`
- **Packages:** `shared-types`, `utils`

### Ưu điểm của cấu trúc hiện tại:
- Sự phân tách rõ ràng về mặt vật lý giữa các module (Separation of Concerns).
- Sẵn sàng cho việc phân chia team độc lập (Ví dụ: Team A làm Frontend Landing, Team B làm Backend AI).

### Nhược điểm đối với PoC/MVP (Complexity Overkill):
1. **Frontend Overhead:** 3 ứng dụng Vite + React độc lập dẫn đến 3 quy trình build, 3 thư mục `node_modules` khổng lồ, và khó khăn trong việc chia sẻ Component UI/State.
2. **Backend Overhead:** Việc tách `api` và `ai` thành 2 service riêng biệt buộc các service phải giao tiếp qua mạng (HTTP/REST) thay vì gọi hàm trực tiếp. Điều này gây tăng độ trễ (latency), phức tạp hóa việc đồng bộ Data Schema (Pydantic), và tăng độ khó khi debug/tracing.
3. **DevOps/Deployment:** Phải maintain 6 Dockerfiles và tốn nhiều tài nguyên hệ thống (RAM/CPU) chỉ để chạy môi trường Local/Dev.

---

## 2. Đánh giá Mức độ cần thiết của Micro-services cho PoC/MVP

**Kết luận:** Kiến trúc Micro-services hiện tại là **KHÔNG CẦN THIẾT** và đang làm **PHỨC TẠP HÓA** quá trình xây dựng PoC/MVP.

Đối với một dự án ở giai đoạn MVP, ưu tiên số 1 là **Tốc độ phát triển (Iteration Speed)** và **Tính nhất quán (Consistency)**. Kiến trúc phân tán (Distributed Architecture) giải quyết các bài toán về quy mô tổ chức (Organizational Scaling) và chịu tải cực lớn, những thứ chưa phải là ưu tiên của MVP.

---

## 3. Đánh giá Xu hướng Scale (Scaling Trend)

Việc gộp các service lại ở thời điểm này (chuyển sang kiến trúc Modular Monolith) **KHÔNG** làm ảnh hưởng xấu đến khả năng scale sau này vì:

1. **Stateless Nature:** Cả Frontend và Backend đều không lưu state cục bộ (state nằm ở PostgreSQL). Do đó, ứng dụng Monolith vẫn có thể được scale ngang (Horizontal Scaling) một cách dễ dàng bằng cách tăng số lượng Docker container (Replicas) trên Dokploy hoặc Kubernetes.
2. **Modular Monolith Design:** Nếu code được tổ chức tốt theo các thư mục/module (Ví dụ: `src/api` và `src/ai` nằm chung trong 1 repo nhưng không coupling chặt chẽ về database transaction), thì việc tách chúng ra thành Micro-services trong tương lai (khi hệ thống đủ lớn) chỉ là việc di chuyển thư mục và thêm API Gateway, chi phí này rất thấp so với chi phí phải maintain Micro-services từ ngày đầu.
3. **Frontend SPA:** Frontend khi gộp lại sẽ trở thành một Single Page Application lớn. Việc tải app có thể được tối ưu dễ dàng bằng kỹ thuật Code Splitting và Lazy Loading (React.lazy).

---

## 4. Đề xuất Tái cấu trúc (Restructuring Proposal)

Để dự án đi nhanh hơn trong giai đoạn MVP, đề xuất tái cấu trúc theo mô hình **Modular Monolith**:

### A. Tái cấu trúc Frontend
- Gộp `apps/landing`, `apps/workspace`, và `apps/admin` thành một ứng dụng Vite duy nhất (VD: `apps/web`).
- Sử dụng **React Router** để quản lý các phân hệ:
  - `/` -> Phân hệ Landing
  - `/app` -> Phân hệ Workspace
  - `/admin` -> Phân hệ Admin
- **Lợi ích:** 1 lần cài đặt NPM, 1 lần build, chia sẻ component dễ dàng, deploy 1 Docker container duy nhất.

### B. Tái cấu trúc Backend
- Gộp `services/ai` vào trong `services/api` để tạo thành một service Backend duy nhất.
- Chuyển logic của AI Agent (Agno) thành một Module/Router bên trong Backend. Các endpoint cần AI sẽ gọi trực tiếp function thay vì gọi HTTP qua một container khác.
- Dịch vụ `mock-llm` có thể giữ lại như một Dev Tool (không deploy production) hoặc gộp thành một Mock Router.
- **Lợi ích:** Không còn độ trễ mạng nội bộ, loại bỏ sự phức tạp của gRPC/REST giữa các service, quản lý duy nhất 1 kết nối Database, dễ dàng tracing.

> **Hành động tiếp theo:** Nếu đồng ý với đánh giá này, chúng ta sẽ bắt đầu thực hiện các bước gộp Frontend và Backend như đề xuất trên.
