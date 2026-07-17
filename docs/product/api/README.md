# API Documentation

## Overview
API documentation for all backend services. Can be auto-generated from FastAPI's built-in OpenAPI support or manually maintained here.

## Auto-Generated Docs (FastAPI)
When services are running, interactive API docs are available at:

| Service | Swagger UI | ReDoc |
|---------|-----------|-------|
| API | `http://localhost:8002/docs` | `http://localhost:8002/redoc` |
| AI | `http://localhost:8000/docs` | `http://localhost:8000/redoc` |
| Mock LLM | `http://localhost:8001/docs` | `http://localhost:8001/redoc` |

## OpenAPI Specification
Export the OpenAPI spec for code generation or external documentation:
```bash
# After services are running:
curl http://localhost:8002/openapi.json > docs/api/api-openapi.json
curl http://localhost:8000/openapi.json > docs/api/ai-openapi.json
curl http://localhost:8001/openapi.json > docs/api/mock-llm-openapi.json
```

## API Conventions
- **Base path**: `/api/v1/` for all endpoints
- **Auth**: Bearer token in `Authorization` header
- **Response format**: `{ "success": true|false, "data": {...}, "message": "...", "error_code": "..." }`
- **Pagination**: `?page=1&limit=20`
- **Errors**: HTTP status codes + error body with `code` and `message`
