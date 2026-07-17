# Standalone Mock LLM Server

## Context
Quá trình kiểm thử hệ thống AI (Agno Agents + FastAPI Streaming) cần một công cụ Mock LLM. Giải pháp ban đầu là tạo `MockModel` kế thừa từ model Agno và chạy trực tiếp trong cùng Event Loop với `time.sleep`, dẫn tới việc Block hoàn toàn Event Loop, vô hiệu hoá luồng Streaming (SSE), và Bypass quá trình lưu vết (Tracing).

## Decision
Tách hoàn toàn phần Mock LLM thành một standalone Microservice (`services/mock-llm` chạy ở port `8001`). Server này phải tuân thủ nghiêm ngặt chuẩn SSE streaming của OpenAI (bao gồm các event tool calls và chunk usage).

## Consequences
- **Ưu điểm:** Giữ nguyên kiến trúc Core của `services/ai` (vẫn sử dụng `OpenAIChat`), khôi phục tính năng Streaming đúng chuẩn, đảm bảo tính năng Tracing hoạt động chuẩn xác kể cả ở môi trường Mock.
- **Nhược điểm:** Cần chạy 2 server song song (`ai` và `mock-llm`) trong môi trường phát triển mô phỏng.
