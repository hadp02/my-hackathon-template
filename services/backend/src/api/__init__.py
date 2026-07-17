"""
API router aggregator.

All versioned API routers are included here under the ``/api/v1`` prefix.
Import ``api_router`` in ``main.py`` to register all endpoints.
"""

from fastapi import APIRouter

from src.api.health import router as health_router
from src.api.auth import router as auth_router
from src.api.users import router as users_router
from src.api.example_resource import router as items_router
from src.api.ai_routes import router as ai_router
from src.api.upload import router as upload_router
from src.api.tasks import router as tasks_router
from src.api.ws import router as ws_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(items_router)
api_router.include_router(ai_router)
api_router.include_router(upload_router)
api_router.include_router(tasks_router)
api_router.include_router(ws_router)

