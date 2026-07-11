from fastapi import APIRouter

from app.api.v1 import admin, ai, auth, flashcards, gamification, games, library, multiplayer, payments, skills, social, statistics, teacher, tts, users, vocabulary

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
api_router.include_router(payments.router)
api_router.include_router(payments.gateway_router)
api_router.include_router(teacher.router)
api_router.include_router(admin.router)
api_router.include_router(social.router)
api_router.include_router(multiplayer.router)
api_router.include_router(skills.router)
api_router.include_router(tts.router)
api_router.include_router(library.router)
