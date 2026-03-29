import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.dependencies import get_message_service, get_thread_service
from app.exceptions import ThreadNotFound
from app.schemas.message import MessageCreate, MessageResponse
from app.schemas.thread import (
    GenerateTitleRequest,
    GenerateTitleResponse,
    ThreadCreate,
    ThreadResponse,
    ThreadUpdate,
)
from app.services.message_service import MessageService
from app.services.thread_service import ThreadService

router = APIRouter(prefix="/api/threads", tags=["threads"])


@router.get("", response_model=list[ThreadResponse])
async def get_threads(
    service: ThreadService = Depends(get_thread_service),
):
    threads = await service.get_all_threads()
    return [
        ThreadResponse(
            id=t.id,
            title=t.title,
            last_message=t.last_message,
            timestamp=t.updated_at,
        )
        for t in threads
    ]


@router.post("", response_model=ThreadResponse, status_code=status.HTTP_201_CREATED)
async def create_thread(
    data: ThreadCreate,
    service: ThreadService = Depends(get_thread_service),
):
    thread = await service.create_thread(data)
    return ThreadResponse(
        id=thread.id,
        title=thread.title,
        last_message=thread.last_message,
        timestamp=thread.updated_at,
    )


@router.patch("/{thread_id}", response_model=ThreadResponse)
async def update_thread(
    thread_id: str,
    data: ThreadUpdate,
    service: ThreadService = Depends(get_thread_service),
):
    try:
        thread = await service.update_thread(thread_id, data)
    except ThreadNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found"
        )
    return ThreadResponse(
        id=thread.id,
        title=thread.title,
        last_message=thread.last_message,
        timestamp=thread.updated_at,
    )


@router.delete("/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_thread(
    thread_id: str,
    service: ThreadService = Depends(get_thread_service),
):
    try:
        await service.delete_thread(thread_id)
    except ThreadNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found"
        )
    return None


@router.post("/{thread_id}/generate-title", response_model=GenerateTitleResponse)
async def generate_thread_title(
    thread_id: str,
    data: GenerateTitleRequest,
    service: ThreadService = Depends(get_thread_service),
):
    """メッセージ内容からAIでタイトルを生成し、スレッドを更新"""
    try:
        title = await service.generate_title(thread_id, data.content)
    except ThreadNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found"
        )
    return GenerateTitleResponse(title=title)


@router.get("/{thread_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    thread_id: str,
    service: MessageService = Depends(get_message_service),
):
    try:
        messages = await service.get_messages(thread_id)
    except ThreadNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found"
        )
    return [
        MessageResponse(
            id=m.id,
            thread_id=m.thread_id,
            role=m.role,
            content=m.content,
            timestamp=m.created_at,
        )
        for m in messages
    ]


@router.post(
    "/{thread_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_message(
    thread_id: str,
    data: MessageCreate,
    service: MessageService = Depends(get_message_service),
):
    """ユーザーメッセージを作成（AI返答はストリーミングエンドポイントを使用）"""
    try:
        user_msg = await service.create_user_message(thread_id, data)
    except ThreadNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found"
        )
    return MessageResponse(
        id=user_msg.id,
        thread_id=user_msg.thread_id,
        role=user_msg.role,
        content=user_msg.content,
        timestamp=user_msg.created_at,
    )


@router.post("/{thread_id}/messages/stream")
async def create_message_stream(
    thread_id: str,
    data: MessageCreate,
    service: MessageService = Depends(get_message_service),
):
    """ストリーミングでAI返答を生成"""
    try:
        await service._ensure_thread_exists(thread_id)
    except ThreadNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found"
        )

    async def generate():
        async for chunk in service.stream_reply(thread_id, data):
            yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
    )
