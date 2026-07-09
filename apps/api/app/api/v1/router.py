from fastapi import APIRouter

from app.api.v1 import ai, auth, flashcards, gamification, games, statistics, users, vocabulary

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(vocabulary.router)
api_router.include_router(vocabulary.admin_router)
api_router.include_router(flashcards.router)
api_router.include_router(gamification.router)
api_router.include_router(games.router)
api_router.include_router(statistics.router)
api_router.include_router(ai.router)
