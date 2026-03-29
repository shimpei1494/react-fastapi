from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.openai_adapter import OpenAIAdapter
from app.ai.protocol import AIService
from app.config import get_settings
from app.database import get_db
from app.repositories.message_repository import MessageRepository
from app.repositories.thread_repository import ThreadRepository
from app.services.message_service import MessageService
from app.services.thread_service import ThreadService


def get_ai_service() -> AIService:
    return OpenAIAdapter(api_key=get_settings().openai_api_key)


def get_thread_repository(
    db: AsyncSession = Depends(get_db),
) -> ThreadRepository:
    return ThreadRepository(db)


def get_message_repository(
    db: AsyncSession = Depends(get_db),
) -> MessageRepository:
    return MessageRepository(db)


def get_thread_service(
    thread_repo: ThreadRepository = Depends(get_thread_repository),
    ai: AIService = Depends(get_ai_service),
) -> ThreadService:
    return ThreadService(thread_repo=thread_repo, ai=ai)


def get_message_service(
    thread_repo: ThreadRepository = Depends(get_thread_repository),
    message_repo: MessageRepository = Depends(get_message_repository),
    ai: AIService = Depends(get_ai_service),
) -> MessageService:
    return MessageService(
        thread_repo=thread_repo,
        message_repo=message_repo,
        ai=ai,
    )
