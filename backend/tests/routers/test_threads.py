import pytest
from httpx import AsyncClient

from app.dependencies import get_ai_service
from app.main import app
from tests.services.fake_ai import FakeAIService


@pytest.fixture()
def fake_ai() -> FakeAIService:
    return FakeAIService(title="Generated Title")


@pytest.fixture(autouse=True)
def _override_ai_service(fake_ai: FakeAIService):
    """すべてのルーターテストでAIServiceをFakeに差し替え"""
    app.dependency_overrides[get_ai_service] = lambda: fake_ai
    yield
    app.dependency_overrides.pop(get_ai_service, None)


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """ヘルスチェックエンドポイント"""
    # Arrange

    # Act
    response = await client.get("/api/health")

    # Assert
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_get_threads_empty(client: AsyncClient):
    """スレッドが空の場合"""
    # Arrange

    # Act
    response = await client.get("/api/threads")

    # Assert
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_thread(client: AsyncClient):
    """スレッドを作成できる"""
    # Arrange

    # Act
    response = await client.post("/api/threads", json={"title": "New Chat"})

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Chat"
    assert data["lastMessage"] == ""
    assert "id" in data
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_get_threads(client: AsyncClient):
    """スレッド一覧を取得できる"""
    # Arrange
    await client.post("/api/threads", json={"title": "Thread 1"})
    await client.post("/api/threads", json={"title": "Thread 2"})

    # Act
    response = await client.get("/api/threads")

    # Assert
    assert response.status_code == 200
    threads = response.json()
    assert len(threads) == 2
    titles = {t["title"] for t in threads}
    assert titles == {"Thread 1", "Thread 2"}


@pytest.mark.asyncio
async def test_update_thread(client: AsyncClient):
    """スレッドのタイトルを更新できる"""
    # Arrange
    create_res = await client.post("/api/threads", json={"title": "Original"})
    thread_id = create_res.json()["id"]

    # Act
    response = await client.patch(
        f"/api/threads/{thread_id}", json={"title": "Updated"}
    )

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated"
    assert data["id"] == thread_id


@pytest.mark.asyncio
async def test_update_thread_not_found(client: AsyncClient):
    """存在しないスレッドの更新は404"""
    # Arrange

    # Act
    response = await client.patch("/api/threads/non-existent", json={"title": "New"})

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Thread not found"


@pytest.mark.asyncio
async def test_delete_thread(client: AsyncClient):
    """スレッドを削除できる"""
    # Arrange
    create_res = await client.post("/api/threads", json={"title": "To Delete"})
    thread_id = create_res.json()["id"]

    # Act
    response = await client.delete(f"/api/threads/{thread_id}")

    # Assert
    assert response.status_code == 204

    get_res = await client.get("/api/threads")
    assert get_res.json() == []


@pytest.mark.asyncio
async def test_delete_thread_not_found(client: AsyncClient):
    """存在しないスレッドの削除は404"""
    # Arrange

    # Act
    response = await client.delete("/api/threads/non-existent")

    # Assert
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_messages_empty(client: AsyncClient):
    """メッセージが空の場合"""
    # Arrange
    create_res = await client.post("/api/threads", json={"title": "Empty"})
    thread_id = create_res.json()["id"]

    # Act
    response = await client.get(f"/api/threads/{thread_id}/messages")

    # Assert
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_get_messages_not_found(client: AsyncClient):
    """存在しないスレッドのメッセージ取得は404"""
    # Arrange

    # Act
    response = await client.get("/api/threads/non-existent/messages")

    # Assert
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_message(client: AsyncClient):
    """ユーザーメッセージを作成できる"""
    # Arrange
    create_res = await client.post("/api/threads", json={"title": "Chat"})
    thread_id = create_res.json()["id"]

    # Act
    response = await client.post(
        f"/api/threads/{thread_id}/messages", json={"content": "Hello"}
    )

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "Hello"
    assert data["role"] == "user"
    assert data["threadId"] == thread_id
    assert "id" in data
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_create_message_not_found(client: AsyncClient):
    """存在しないスレッドへのメッセージ作成は404"""
    # Arrange

    # Act
    response = await client.post(
        "/api/threads/non-existent/messages", json={"content": "Hello"}
    )

    # Assert
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_messages(client: AsyncClient):
    """メッセージ一覧を取得できる"""
    # Arrange
    create_res = await client.post("/api/threads", json={"title": "Conversation"})
    thread_id = create_res.json()["id"]

    await client.post(
        f"/api/threads/{thread_id}/messages", json={"content": "Message 1"}
    )
    await client.post(
        f"/api/threads/{thread_id}/messages", json={"content": "Message 2"}
    )

    # Act
    response = await client.get(f"/api/threads/{thread_id}/messages")

    # Assert
    assert response.status_code == 200
    messages = response.json()
    assert len(messages) == 2
    assert messages[0]["content"] == "Message 1"
    assert messages[1]["content"] == "Message 2"


@pytest.mark.asyncio
async def test_generate_thread_title(client: AsyncClient, fake_ai: FakeAIService):
    """AIでタイトルを生成できる"""
    # Arrange
    create_res = await client.post("/api/threads", json={"title": "Original"})
    thread_id = create_res.json()["id"]

    # Act
    response = await client.post(
        f"/api/threads/{thread_id}/generate-title",
        json={"content": "User's first message"},
    )

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Generated Title"

    # タイトルが更新されている
    get_res = await client.get("/api/threads")
    assert get_res.json()[0]["title"] == "Generated Title"

    # Fakeが呼ばれた
    assert fake_ai.generate_title_calls == ["User's first message"]


@pytest.mark.asyncio
async def test_generate_title_thread_not_found(
    client: AsyncClient, fake_ai: FakeAIService
):
    """存在しないスレッドのタイトル生成は404"""
    # Arrange

    # Act
    response = await client.post(
        "/api/threads/non-existent/generate-title",
        json={"content": "Message"},
    )

    # Assert
    assert response.status_code == 404
    assert fake_ai.generate_title_calls == []


@pytest.mark.asyncio
async def test_create_message_stream(client: AsyncClient, fake_ai: FakeAIService):
    """ストリーミングでメッセージを作成できる"""
    # Arrange
    create_res = await client.post("/api/threads", json={"title": "Stream Test"})
    thread_id = create_res.json()["id"]

    # Act
    response = await client.post(
        f"/api/threads/{thread_id}/messages/stream",
        json={"content": "Tell me a story"},
    )

    # Assert
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/event-stream; charset=utf-8"

    content = response.text
    assert 'data: "Hello"' in content
    assert 'data: " "' in content
    assert 'data: "World"' in content
    assert "data: [DONE]" in content

    # ユーザーメッセージとアシスタントメッセージがDBに保存されている
    messages_res = await client.get(f"/api/threads/{thread_id}/messages")
    messages = messages_res.json()
    assert len(messages) == 2
    assert messages[0]["role"] == "user"
    assert messages[0]["content"] == "Tell me a story"
    assert messages[1]["role"] == "assistant"
    assert messages[1]["content"] == "Hello World"


@pytest.mark.asyncio
async def test_create_message_stream_thread_not_found(
    client: AsyncClient, fake_ai: FakeAIService
):
    """存在しないスレッドへのストリーミングは404"""
    # Arrange

    # Act
    response = await client.post(
        "/api/threads/non-existent/messages/stream",
        json={"content": "Hello"},
    )

    # Assert
    assert response.status_code == 404
    assert fake_ai.generate_stream_calls == []
