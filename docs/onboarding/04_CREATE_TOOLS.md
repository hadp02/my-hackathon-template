# Hướng Dẫn Tạo Và Tích Hợp Custom Tools

Trong giai đoạn đầu của template, chúng ta sử dụng `mock_tools.py` để dựng nhanh UI và test luồng (Agent, Dashboard Tracing) mà không cần quan tâm đến logic phức tạp hay API Key của các dịch vụ bên ngoài.

Tuy nhiên, khi bạn muốn đưa AI Agent vào hoạt động thực tế, bạn sẽ cần tạo các **Tool thật**. Tài liệu này hướng dẫn bạn cách thực hiện.

## 1. Cấu trúc thư mục

Các tool nên được đặt trong thư mục `services/backend/src/ai/tools/`. Bạn nên tách mỗi tool (hoặc nhóm tool liên quan) thành một file riêng biệt.

Ví dụ:
```
services/backend/src/ai/tools/
├── __init__.py
├── mock_tools.py      # Giữ lại để test
├── weather.py         # Tool lấy thời tiết (ví dụ dùng OpenWeatherMap)
└── database.py        # Tool truy vấn DB nội bộ
```

## 2. Cách viết một Tool với Agno

Agno (framework chúng ta đang sử dụng) hỗ trợ định nghĩa tool rất đơn giản thông qua decorator `@tool`. 

Dưới đây là một ví dụ tạo Tool thật gọi API Thời Tiết:

```python
# services/backend/src/ai/tools/weather.py
import requests
import os
from agno.tools import tool

@tool
def get_real_weather(location: str) -> str:
    """
    Lấy thời tiết thực tế cho một khu vực.
    
    Args:
        location: Tên thành phố (ví dụ: 'Hà Nội')
        
    Returns:
        Chuỗi chứa thông tin thời tiết
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        return "Lỗi: Chưa cấu hình OPENWEATHER_API_KEY."
        
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
        response = requests.get(url)
        data = response.json()
        
        if response.status_code == 200:
            temp = data['main']['temp']
            desc = data['weather'][0]['description']
            return f"Thời tiết tại {location} hiện tại là {temp}°C, {desc}."
        else:
            return f"Không thể lấy thời tiết: {data.get('message', 'Lỗi không xác định')}"
    except Exception as e:
        return f"Đã xảy ra lỗi khi gọi API: {str(e)}"
```

**Lưu ý quan trọng:**
- Luôn viết **Docstring** rõ ràng (phần nằm trong `""" """`). LLM sẽ đọc phần này để hiểu cách dùng và các tham số của tool.
- Luôn định nghĩa **Type Hints** cho tham số (VD: `location: str`).

## 3. Tích hợp Tool vào Agent

Sau khi tạo tool, bạn cần import nó vào file định nghĩa Agent (ví dụ `assistant_agent.py`) và đưa nó vào mảng `tools`.

```python
# services/backend/src/ai/agents/assistant_agent.py
from typing import Optional
from agno.agent import Agent
from src.ai.core.base_agent import BaseAgent

# Import Tool thật
from src.ai.tools.weather import get_real_weather

def get_assistant_agent(session_id: Optional[str] = None) -> Agent:
    instructions = [
        "Bạn là một trợ lý AI hữu ích.",
        "Khi người dùng hỏi về thời tiết, hãy dùng tool get_real_weather."
    ]
    
    return BaseAgent.create(
        agent_id="core_assistant",
        name="Assistant",
        instructions=instructions,
        tools=[get_real_weather], # Khai báo tool ở đây
        session_id=session_id
    )
```

## 4. Quản lý API Key

Tuyệt đối không hardcode API Key trong mã nguồn. Hãy thêm các khóa API vào file `.env` (nhớ bỏ qua trong `.gitignore`) và thêm tài liệu vào `.env.example`.

`.env`:
```
OPENWEATHER_API_KEY=your_real_api_key_here
```

## 5. Kiểm thử (Verification)

Sau khi tích hợp Tool thật, hãy đảm bảo rằng `.env` của bạn đang cấu hình sử dụng LLM thật (như OpenAI hoặc Gemini) thay vì `mock`:

```
AI_MODEL_PROVIDER=openai
AI_MODEL_NAME=gpt-4o-mini
OPENAI_API_KEY=sk-...
```

(Mock LLM chỉ trả về các kết quả có sẵn và tự động gọi tool đầu tiên, do đó khó kiểm tra logic phức tạp của Tool thật).
