import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.message import MessageCreate
from app.schemas.thread import ThreadCreate
from app.services import message_service, thread_service
from app.types.message import MessageRole


@pytest.mark.asyncio
async def test_get_messages_by_thread_empty(db_session: AsyncSession):
    """メッセージがない場合は空リストを返す"""
    # Arrange
    thread = await thread_service.create_thread(
        db_session, ThreadCreate(title="Empty Thread")
    )

    # Act
    messages = await message_service.get_messages_by_thread(db_session, thread.id)

    # Assert
    assert messages == []


@pytest.mark.asyncio
async def test_create_user_message(db_session: AsyncSession):
    """ユーザーメッセージを作成できる"""
    # Arrange
    thread = await thread_service.create_thread(
        db_session, ThreadCreate(title="Test Thread")
    )

    data = MessageCreate(content="Hello, world!")

    # Act
    message = await message_service.create_user_message(db_session, thread.id, data)

    # Assert
    assert message.id is not None
    assert message.thread_id == thread.id
    assert message.role == MessageRole.USER
    assert message.content == "Hello, world!"
    assert message.created_at is not None


@pytest.mark.asyncio
async def test_create_user_message_updates_thread_last_message(
    db_session: AsyncSession,
):
    """ユーザーメッセージ作成時にスレッドのlast_messageが更新される"""
    # Arrange
    thread = await thread_service.create_thread(
        db_session, ThreadCreate(title="Test Thread")
    )

    data = MessageCreate(content="Latest message")

    # Act
    await message_service.create_user_message(db_session, thread.id, data)

    # Assert
    updated_thread = await thread_service.get_thread_by_id(db_session, thread.id)
    assert updated_thread is not None
    assert updated_thread.last_message == "Latest message"


@pytest.mark.asyncio
async def test_create_assistant_message(db_session: AsyncSession):
    """アシスタントメッセージを作成できる"""
    # Arrange
    thread = await thread_service.create_thread(
        db_session, ThreadCreate(title="Test Thread")
    )

    # Act
    message = await message_service.create_assistant_message(
        db_session, thread.id, "AI response here"
    )

    # Assert
    assert message.id is not None
    assert message.thread_id == thread.id
    assert message.role == MessageRole.ASSISTANT
    assert message.content == "AI response here"
    assert message.created_at is not None


@pytest.mark.asyncio
async def test_get_messages_by_thread_ordered(db_session: AsyncSession):
    """メッセージが作成日時の昇順で取得される"""
    # Arrange
    thread = await thread_service.create_thread(
        db_session, ThreadCreate(title="Conversation")
    )

    msg1 = await message_service.create_user_message(
        db_session, thread.id, MessageCreate(content="First")
    )
    msg2 = await message_service.create_assistant_message(
        db_session, thread.id, "Second"
    )
    msg3 = await message_service.create_user_message(
        db_session, thread.id, MessageCreate(content="Third")
    )

    # Act
    messages = await message_service.get_messages_by_thread(db_session, thread.id)

    # Assert
    assert len(messages) == 3
    assert messages[0].id == msg1.id
    assert messages[0].content == "First"
    assert messages[1].id == msg2.id
    assert messages[1].content == "Second"
    assert messages[2].id == msg3.id
    assert messages[2].content == "Third"


@pytest.mark.asyncio
async def test_messages_cascade_delete_with_thread(db_session: AsyncSession):
    """スレッド削除時にメッセージも削除される（カスケード）"""
    # Arrange
    thread = await thread_service.create_thread(
        db_session, ThreadCreate(title="To Delete")
    )
    await message_service.create_user_message(
        db_session, thread.id, MessageCreate(content="Message")
    )

    # Act
    await thread_service.delete_thread(db_session, thread.id)

    # Assert
    messages = await message_service.get_messages_by_thread(db_session, thread.id)
    assert messages == []
