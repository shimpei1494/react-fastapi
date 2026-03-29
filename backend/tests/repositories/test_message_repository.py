import pytest

from app.repositories.message_repository import MessageRepository
from app.repositories.thread_repository import ThreadRepository
from app.schemas.message import MessageCreate
from app.schemas.thread import ThreadCreate
from app.types.message import MessageRole


@pytest.mark.asyncio
async def test_get_by_thread_empty(
    thread_repo: ThreadRepository,
    message_repo: MessageRepository,
):
    """メッセージがない場合は空リストを返す"""
    # Arrange
    thread = await thread_repo.create(ThreadCreate(title="Empty Thread"))

    # Act
    messages = await message_repo.get_by_thread(thread.id)

    # Assert
    assert messages == []


@pytest.mark.asyncio
async def test_create_user_message(
    thread_repo: ThreadRepository,
    message_repo: MessageRepository,
):
    """ユーザーメッセージを作成できる"""
    # Arrange
    thread = await thread_repo.create(ThreadCreate(title="Test Thread"))
    data = MessageCreate(content="Hello, world!")

    # Act
    message = await message_repo.create_user_message(thread.id, data)

    # Assert
    assert message.id is not None
    assert message.thread_id == thread.id
    assert message.role == MessageRole.USER
    assert message.content == "Hello, world!"
    assert message.created_at is not None


@pytest.mark.asyncio
async def test_create_user_message_updates_thread_last_message(
    thread_repo: ThreadRepository,
    message_repo: MessageRepository,
):
    """ユーザーメッセージ作成時にスレッドのlast_messageが更新される"""
    # Arrange
    thread = await thread_repo.create(ThreadCreate(title="Test Thread"))
    data = MessageCreate(content="Latest message")

    # Act
    await message_repo.create_user_message(thread.id, data)

    # Assert
    updated_thread = await thread_repo.get_by_id(thread.id)
    assert updated_thread is not None
    assert updated_thread.last_message == "Latest message"


@pytest.mark.asyncio
async def test_create_assistant_message(
    thread_repo: ThreadRepository,
    message_repo: MessageRepository,
):
    """アシスタントメッセージを作成できる"""
    # Arrange
    thread = await thread_repo.create(ThreadCreate(title="Test Thread"))

    # Act
    message = await message_repo.create_assistant_message(thread.id, "AI response here")

    # Assert
    assert message.id is not None
    assert message.thread_id == thread.id
    assert message.role == MessageRole.ASSISTANT
    assert message.content == "AI response here"
    assert message.created_at is not None


@pytest.mark.asyncio
async def test_get_by_thread_ordered(
    thread_repo: ThreadRepository,
    message_repo: MessageRepository,
):
    """メッセージが作成日時の昇順で取得される"""
    # Arrange
    thread = await thread_repo.create(ThreadCreate(title="Conversation"))
    msg1 = await message_repo.create_user_message(
        thread.id, MessageCreate(content="First")
    )
    msg2 = await message_repo.create_assistant_message(thread.id, "Second")
    msg3 = await message_repo.create_user_message(
        thread.id, MessageCreate(content="Third")
    )

    # Act
    messages = await message_repo.get_by_thread(thread.id)

    # Assert
    assert len(messages) == 3
    assert messages[0].id == msg1.id
    assert messages[0].content == "First"
    assert messages[1].id == msg2.id
    assert messages[1].content == "Second"
    assert messages[2].id == msg3.id
    assert messages[2].content == "Third"


@pytest.mark.asyncio
async def test_messages_cascade_delete_with_thread(
    thread_repo: ThreadRepository,
    message_repo: MessageRepository,
):
    """スレッド削除時にメッセージも削除される（カスケード）"""
    # Arrange
    thread = await thread_repo.create(ThreadCreate(title="To Delete"))
    await message_repo.create_user_message(thread.id, MessageCreate(content="Message"))

    # Act
    await thread_repo.delete(thread.id)

    # Assert
    messages = await message_repo.get_by_thread(thread.id)
    assert messages == []
