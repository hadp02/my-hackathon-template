# Monorepo Micro-Frontend Architecture

## Context
Ban đầu dự án sử dụng cấu trúc Modular Monolith với 1 dự án Frontend duy nhất. Tuy nhiên, nhận thấy Landing Page thường yêu cầu giao diện đậm chất marketing sặc sỡ, trong khi Admin Dashboard cần tối giản và Workspace cần cấu trúc chat chuyên biệt. Việc gộp chung dễ dẫn đến xung đột CSS và mã nguồn phức tạp.

## Decision
Chuyển đổi dự án sang kiến trúc Monorepo Micro-Frontend bằng NPM Workspaces:
- `apps/landing`: Ứng dụng Landing Page.
- `apps/admin`: Ứng dụng quản trị (Admin Dashboard).
- `apps/workspace`: Ứng dụng người dùng lõi.

## Consequences
- **Ưu điểm:** Cách ly tuyệt đối về giao diện (Tailwind theme), rành mạch về cấu trúc, dễ mở rộng, bảo mật cao do chia tách mã nguồn.
- **Nhược điểm:** Cần cài đặt chung NPM workspaces và các thư viện core có thể cần chia sẻ thông qua `packages/` để tránh lặp lại.
