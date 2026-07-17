# Shared Utilities

## Purpose
Common utility functions and helpers used across multiple services and apps. Prevents code duplication and ensures consistency.

## Examples of Shared Utilities

### Date/Time Helpers
```python
# Python
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def format_iso(dt: datetime) -> str:
    return dt.isoformat()
```

```typescript
// TypeScript
export const utcNow = (): Date => new Date();
export const formatISO = (date: Date): string => date.toISOString();
```

### Response Formatters
```python
def success_response(data: dict, message: str = "Success"):
    return {"status": "success", "message": message, "data": data}

def error_response(message: str, code: int = 400):
    return {"status": "error", "message": message, "code": code}
```

### Validation Helpers
```python
import re

def is_valid_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
```

## Directory Structure
```
src/
├── python/
│   ├── formatting.py    # Response formatters
│   ├── validation.py    # Input validation helpers
│   ├── datetime_utils.py
│   └── __init__.py
└── typescript/
    ├── formatting.ts
    ├── validation.ts
    ├── datetime.ts
    └── index.ts
```

## Usage
Import from this package in any service or app that needs common utilities.
