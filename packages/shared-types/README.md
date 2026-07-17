# Shared Types

## Purpose
Language-agnostic API contracts and type definitions shared between frontend apps and backend services. Ensures type consistency across the entire stack.

## Strategy

### For TypeScript (Frontend)
TypeScript interfaces and Zod schemas that define API request/response shapes:

```typescript
// Example: User type shared between web app and admin dashboard
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

### For Python (Backend)
Pydantic models that mirror the TypeScript types:

```python
from pydantic import BaseModel
from datetime import datetime

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
```

### For Cross-Language (OpenAPI)
The source of truth can optionally be an OpenAPI spec (`docs/api/openapi.yml`) from which both TypeScript and Python types are generated.

## Directory Structure
```
src/
├── typescript/
│   ├── models/          # TypeScript interfaces
│   ├── schemas/         # Zod validation schemas
│   └── index.ts         # Re-exports
└── python/
    ├── models/          # Pydantic models
    └── __init__.py      # Re-exports
```

## Usage
- **Frontend apps**: Import types from this package
- **Backend services**: Import Pydantic models or generate from OpenAPI spec
- **API changes**: Update shared types FIRST, then update services and apps
