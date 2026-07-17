# Team & AI Workflow Rules

These rules help **both Human Developers and AI Agents** decide what to read, how to plan, and how to validate work. By following the same phases, the entire 6-person team and our AI coding assistants stay perfectly synced and avoid stepping on each other's toes.

## Context & Execution Phases

Every task (whether executed by a human or an AI) must go through these logical phases:

### 0. Phase 0: Sprint 0 (Diverge & Converge)
**Goal:** Ensure 100% shared context across the entire 6-person team before anyone writes a line of code using the Double Diamond model.
- **Phase 0.1 - Diverge (Ideation):** Mỗi thành viên dành 30 phút tự suy nghĩ. Chạy lệnh `make setup-sprint0` để tự động tạo thư mục cá nhân dựa trên tài khoản Github (VD: `docs/ideation/username/`). Sau đó gọi AI skill `ideation-assistant` để AI phỏng vấn bạn, khơi gợi ý tưởng về business value, user journey và tự động lưu các file ghi chú vào thư mục đó.
- **Phase 0.2 - Converge (Merge):** Leader gọi AI skill `ideation-merge`. AI sẽ quét toàn bộ file trong `docs/ideation/`, tổng hợp điểm chung, ý tưởng độc đáo và highlight các mâu thuẫn vào file `docs/SPRINT_0_NOTES.md`.
- **Phase 0.3 - Debate & Decide:** Cả team họp review file `SPRINT_0_NOTES.md`, chốt lại các mâu thuẫn và định hình sản phẩm cuối cùng.
- **Phase 0.4 - Plan:** Leader gọi AI skill `sprint-0-planner`. AI sẽ chuyển hóa tầm nhìn đã chốt trong `SPRINT_0_NOTES.md` thành `BACKLOG.md` và Database Schema.

### 1. Sprint Kickoff (2-3 Hour Sprints)
**Goal:** Tránh trùng lặp công việc, duy trì tốc độ cao và triệt tiêu Git Merge Conflict.
- **Action (Leader):** Cứ mỗi 2-3 giờ, Leader cho team dừng lại 5 phút. Leader chạy AI skill `sprint-kickoff` (bằng cách chat với AI: "Start a new sprint"). AI sẽ đọc `BACKLOG.md` và tự động tạo/cập nhật file `docs/SPRINT_ACTIVE.md`.
- **Action (Leader):** Leader kiểm tra lại `SPRINT_ACTIVE.md` và assign đích danh (`@Name`) 1-2 task cho mỗi người, đồng thời để các task an toàn vào phần `Overflow Queue`.
- **Action (Team):** Đọc file `SPRINT_ACTIVE.md` để nhận task. Đọc `.agents/AGENTS.md` và `docs/HARNESS.md` để nạp luật làm việc. Nếu xong task sớm, tự động xuống `Overflow Queue` bốc task và ghi tên mình vào.

### 2. Planning Phase
**Goal:** Decide the smallest safe approach and expected proof.
- **Action:** Identify the exact files that need editing.
- **Action:** Read relevant prior architecture decisions in `docs/decisions/` if touching core systems (Auth, DB schemas, API routing).
- **Rule:** Do not dive into unrelated history or refactor code outside the scope of the specific task. Keep PRs/commits small.

### 3. Implementation Phase (Trunk-Based Development)
**Goal:** Make the code change safely and integrate continuously.
- **Action:** Follow the existing patterns in the repository (e.g., use Pydantic for validation, follow the Parse-First Boundary Rule defined in `ARCHITECTURE.md`).
- **Action (Human/Agent):** Push code directly to the `main` (or `dev`) branch. We use **Trunk-Based Development** for speed. Feature branches should ONLY be used for massive, high-risk refactors.

### 4. Validation Phase
**Goal:** Prove the change works before claiming completion.
- **Rule:** Never mark a task as done without verification.
- **Action:** Run the exact validation steps written in `docs/BACKLOG.md` for the current task.
- **Action:** Execute local tests (`make test`) and linting (`make lint`).
- **Action:** Use `git status --short` and `git diff` to review exactly what files were modified and ensure no accidental deletions or secret leaks occurred.

### 5. Task Completion
**Goal:** Cập nhật trạng thái và thông báo cho team.
- **Action:** Update `docs/SPRINT_ACTIVE.md` to mark the task as `[x]` ONLY if validation passes.
- **Action (Human/Agent):** Commit and push your code directly to the shared branch (`main`/`dev`). If your commit changes the Database Schema (Alembic) or API Contract (OpenAPI), you MUST notify the team on Discord immediately.

## Cẩm nang Điều phối dành cho Leader (Leader Guide)

Để điều phối team 6 người + AI trong 48h, Leader cần thực hiện chuẩn xác các quy tắc sau:

1. **Sprint Kickoff 5 Phút:** Cứ sau 2-3 giờ, Leader hô hào team tạm dừng. Nhờ AI chạy lệnh "Start a sprint kickoff" để tự động tạo file `SPRINT_ACTIVE.md`. Leader chỉ cần sửa lại tên `@Name` cho hợp lý, rồi hô team tiếp tục.
2. **Quy tắc Overflow:** Leader luôn phải đảm bảo phần `Overflow Queue` trong `SPRINT_ACTIVE.md` có sẵn ít nhất 3-4 task "an toàn" (không đụng chạm DB, ít conflict). Ai code nhanh xong sớm thì tự động bốc task ở đây, cấm ngồi chờ.
3. **Cảnh sát Database:** Bất cứ khi nào có thành viên báo cáo chuẩn bị chạy `make migrate-new`, Leader phải yêu cầu tất cả mọi người dừng push code, đảm bảo người đó `git pull` trước, sau đó chạy migrate và push lên. Chỉ khi file migration mới nhất đã ở trên remote, những người khác mới được tiếp tục. Tránh tuyệt đối lỗi `Multiple Head Revisions`.

When certain events happen, **you MUST fetch additional context**:

| Trigger Condition | Action |
| --- | --- |
| Task touches database schema or migrations | Check `services/backend/alembic/env.py` and existing models before running Alembic. |
| Task touches auth, authorization, or security | Treat as high-risk; review `services/backend/src/api/auth.py` and `ARCHITECTURE.md` carefully. |
| Task discovers stale docs or repeated friction | Do not fix it silently. Add a new task to `docs/BACKLOG.md` tagged with `[Harness]` or `[Tech Debt]`. |

## Hackathon Team Guidelines

Từ phiên thảo luận chuẩn bị Hackathon, toàn bộ 6 thành viên phải tuân thủ các quy định sinh tử sau để đảm bảo tốc độ:

1. **Quy định Database (Alembic):**
   - Chúng ta sử dụng **1 Remote Database chung** trong lúc dev. 
   - **Bắt buộc:** Trước khi chạy lệnh `make migrate-new` để tạo bảng mới, bạn phải thực hiện `git pull` để lấy file migration mới nhất của người khác về, tránh lỗi `Multiple Head Revisions`.

2. **Quy định Đồng bộ API (Frontend - Backend Contract):**
   - Bất cứ khi nào Backend dev thay đổi endpoint, payload, hoặc response schema: Phải lập tức thông báo trên **kênh Discord của team**.
   - Frontend dev khi nhận được thông báo phải chạy ngay lệnh `make generate-client` (gọi tới `openapi-ts`) để cập nhật lại SDK, nếu không code Frontend sẽ bị lỗi type.
