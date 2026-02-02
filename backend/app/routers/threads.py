from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.message import MessageCreate, MessageResponse
from app.schemas.thread import ThreadCreate, ThreadResponse, ThreadUpdate
from app.services import message_service, thread_service

router = APIRouter(prefix="/api/threads", tags=["threads"])


@router.get("", response_model=list[ThreadResponse])
async def get_threads(db: AsyncSession = Depends(get_db)):
    threads = await thread_service.get_all_threads(db)
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
    db: AsyncSession = Depends(get_db),
):
    thread = await thread_service.create_thread(db, data)
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
    db: AsyncSession = Depends(get_db),
):
    thread = await thread_service.update_thread(db, thread_id, data)
    if not thread:
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
    db: AsyncSession = Depends(get_db),
):
    deleted = await thread_service.delete_thread(db, thread_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found"
        )
    return None


@router.get("/{thread_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    thread_id: str,
    db: AsyncSession = Depends(get_db),
):
    thread = await thread_service.get_thread_by_id(db, thread_id)
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found"
        )

    messages = await message_service.get_messages_by_thread(db, thread_id)
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
    response_model=list[MessageResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_message(
    thread_id: str,
    data: MessageCreate,
    db: AsyncSession = Depends(get_db),
):
    thread = await thread_service.get_thread_by_id(db, thread_id)
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found"
        )

    user_msg, assistant_msg = await message_service.create_message(db, thread_id, data)

    return [
        MessageResponse(
            id=user_msg.id,
            thread_id=user_msg.thread_id,
            role=user_msg.role,
            content=user_msg.content,
            timestamp=user_msg.created_at,
        ),
        MessageResponse(
            id=assistant_msg.id,
            thread_id=assistant_msg.thread_id,
            role=assistant_msg.role,
            content=assistant_msg.content,
            timestamp=assistant_msg.created_at,
        ),
    ]
