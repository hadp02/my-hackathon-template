---
title: "Full-Stack AI Dashboard, Tracing & Mock LLM Architecture"
date: "2026-07-09"
tags: ["react", "dashboard", "agno", "tracing", "streaming", "mock-llm", "monorepo"]
status: "completed"
---

# Case Study: Full-Stack AI System - From Monorepo Setup to Agno Agents & Mock Tracing

## Context
Phiên làm việc là một hành trình Full-Stack đồ sộ đi từ việc định hình kiến trúc thư mục Frontend đến việc hoàn thiện cơ chế Tracing AI Backend. Ban đầu dự án khởi chạy theo kiến trúc Modular Monolith, nhưng sau đó để giải quyết triệt để vấn đề "Separation of Concerns" (phân tách Giao diện Landing Page, Admin Dashboard, và Workspace App), hệ thống đã tiến hoá thành Monorepo Micro-Frontend. Ở phía Backend, hệ thống tích hợp chuẩn Agno cho AI Agents, lưu trữ Traces với SQLite, và tách biệt hoàn toàn Mock LLM thành một standalone server để đảm bảo tính chuẩn xác của quá trình Streaming.

## Khởi tạo và Tối ưu Kiến trúc Cơ bản

### 1. Dọn dẹp & Kiến trúc Monorepo
- **Loại bỏ Prometheus:** Lược bỏ Prometheus do Dokploy đã cung cấp sẵn giải pháp Monitoring, giúp kiến trúc bớt cồng kềnh, tập trung đúng vào trọng tâm của một Template nhanh, gọn.
- **Micro-Frontend:** Chuyển đổi kiến trúc từ một Frontend duy nhất sang **NPM Workspaces** bao gồm 3 ứng dụng riêng biệt: `apps/landing` (Landing Page Marketing), `apps/admin` (Admin Dashboard), và `apps/workspace` (Giao diện người dùng lõi). Quyết định này giúp từng ứng dụng tự do chọn theme Tailwind/shadcn khác nhau mà không sợ xung đột.

## Khởi tạo Giao diện (Frontend)

### 2. Frontend Tech Stack
- Khởi tạo với **Vite + React + Tailwind CSS v4 + shadcn/ui**, cùng với React Router và Zustand.
- Cấu hình UI theo chuẩn Premium Admin Dashboard cho `apps/admin` và ứng dụng trò chuyện AI realtime cho `apps/workspace`.

### 3. Admin Tracing Dashboard (`apps/admin`)
- Xây dựng trang `AITracingDashboard.tsx` tích hợp các thẻ KPI chuyên dụng hiển thị hiệu năng AI: Total Cost, lượng Token tiêu thụ (Input/Output), Độ trễ trung bình (Avg Latency), và Thời gian phản hồi Token đầu tiên (TTFT).
- Tích hợp biểu đồ trực quan (`OverviewChart.tsx`) và bảng nhật ký (Recent Traces) để hiển thị chi tiết từng phiên chạy của `main agent`.

### 4. Workspace Agent UI (`apps/workspace`)
- Xử lý hệ thống phân tích Event Stream (NDJSON) trực tiếp từ Backend. Frontend nhận diện các hành động gọi công cụ (`tool_calls`) tự động bằng các Micro-animations.

## Kiến trúc Hệ thống (Backend)

### 5. Tiêu chuẩn AI với Agno
- Lựa chọn **Agno** làm nền tảng chính (Loại bỏ LangGraph) vì khả năng đáp ứng hoàn hảo từ RAG đơn giản đến Workflow phức tạp (Multi-Agent/ReAct) chỉ bằng những hàm Python thuần túy.
- Tích hợp **Qdrant** cho nhu cầu RAG tương lai và dùng Kaggle tunnel làm giải pháp self-host Tiếng Việt Embeddings.

### 6. Tích hợp SQLite Tracer (`services/ai`)
- Áp dụng kỹ thuật gắn Hook của Agno (`@hook post_run`) vào lớp cơ sở `BaseAgent`.
- Trích xuất toàn bộ dữ liệu hiệu năng thực từ đối tượng `RunMetrics` của Agno (như `input_tokens`, `output_tokens`, `duration`) và đẩy vào cơ sở dữ liệu `traces.db` theo thời gian thực.
- Khắc phục lỗi Parse Metric khác biệt giữa cấu trúc Dictionary và Dataclass, đặc biệt xử lý lỗi thiếu dữ liệu metric trong Mock Mode.

### 7. Tách biệt Mock LLM Server (`services/mock-llm`)
- **Vấn đề ban đầu:** Việc Mock LLM ngay trong Service AI bằng cách kế thừa mô hình Agno và dùng `time.sleep` đồng bộ đã phá vỡ hoàn toàn kiến trúc Streaming của FastAPI (Block Event Loop) và Bypass toàn bộ hệ thống lưu vết (Tracing).
- **Giải pháp:** Tách hoàn toàn Mock model thành một Microservice độc lập (`services/mock-llm` chạy ở port `8001`).
- **Kết quả:** Đảm bảo `mock-llm` tuân thủ 100% chuẩn SSE streaming của OpenAI (cung cấp đầy đủ `chat.completion.chunk`, chunk gọi tool, và `"usage"` chunk). Nhờ vậy, thư viện LLM mặc định của Agno (`OpenAIChat`) vẫn sử dụng được nguyên bản mã nguồn không cần sửa đổi, giữ Tracing Database hoạt động chính xác.

## Kết luận & Bài học
- **Micro-Frontend cho Template:** Tuyệt đối hữu dụng khi làm các sản phẩm cần UI/UX cực đoan (marketing sặc sỡ vs admin tối giản) trong một team quy mô nhỏ (Hackathon/Startup).
- **Tuân thủ Chuẩn mực (Standardization) ở Backend:** Thay vì hack vào trong lõi thư viện AI bằng các class giả mạo, hãy giả mạo giao thức mạng (Network Mocking qua cổng 8001). Điều này giúp hệ thống Core (`services/ai`) sạch sẽ, duy trì luồng sự kiện (Events) và Tracing trơn tru, sẵn sàng lên Production chỉ với một thay đổi `base_url`.
