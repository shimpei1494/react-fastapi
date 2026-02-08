from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """ヘルスチェックエンドポイント"""
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_get_threads_empty(client: AsyncClient):
    """スレッドが空の場合"""
    response = await client.get("/api/threads")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_thread(client: AsyncClient):
    """スレッドを作成できる"""
    response = await client.post("/api/threads", json={"title": "New Chat"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Chat"
    assert data["lastMessage"] == ""
    assert "id" in data
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_get_threads(client: AsyncClient):
    """スレッド一覧を取得できる"""
    await client.post("/api/threads", json={"title": "Thread 1"})
    await client.post("/api/threads", json={"title": "Thread 2"})

    response = await client.get("/api/threads")
    assert response.status_code == 200
    threads = response.json()
    assert len(threads) == 2
    # 両方のスレッドが含まれている（順序は問わない）
    titles = {t["title"] for t in threads}
    assert titles == {"Thread 1", "Thread 2"}


@pytest.mark.asyncio
async def test_update_thread(client: AsyncClient):
    """スレッドのタイトルを更新できる"""
    create_res = await client.post("/api/threads", json={"title": "Original"})
    thread_id = create_res.json()["id"]

    response = await client.patch(
        f"/api/threads/{thread_id}", json={"title": "Updated"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated"
    assert data["id"] == thread_id


@pytest.mark.asyncio
async def test_update_thread_not_found(client: AsyncClient):
    """存在しないスレッドの更新は404"""
    response = await client.patch("/api/threads/non-existent", json={"title": "New"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Thread not found"


@pytest.mark.asyncio
async def test_delete_thread(client: AsyncClient):
    """スレッドを削除できる"""
    create_res = await client.post("/api/threads", json={"title": "To Delete"})
    thread_id = create_res.json()["id"]

    response = await client.delete(f"/api/threads/{thread_id}")
    assert response.status_code == 204

    # 削除後は取得できない
    get_res = await client.get("/api/threads")
    assert get_res.json() == []


@pytest.mark.asyncio
async def test_delete_thread_not_found(client: AsyncClient):
    """存在しないスレッドの削除は404"""
    response = await client.delete("/api/threads/non-existent")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_messages_empty(client: AsyncClient):
    """メッセージが空の場合"""
    create_res = await client.post("/api/threads", json={"title": "Empty"})
    thread_id = create_res.json()["id"]

    response = await client.get(f"/api/threads/{thread_id}/messages")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_get_messages_not_found(client: AsyncClient):
    """存在しないスレッドのメッセージ取得は404"""
    response = await client.get("/api/threads/non-existent/messages")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_message(client: AsyncClient):
    """ユーザーメッセージを作成できる"""
    create_res = await client.post("/api/threads", json={"title": "Chat"})
    thread_id = create_res.json()["id"]

    response = await client.post(
        f"/api/threads/{thread_id}/messages", json={"content": "Hello"}
    )
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
    response = await client.post(
        "/api/threads/non-existent/messages", json={"content": "Hello"}
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_messages(client: AsyncClient):
    """メッセージ一覧を取得できる"""
    create_res = await client.post("/api/threads", json={"title": "Conversation"})
    thread_id = create_res.json()["id"]

    await client.post(
        f"/api/threads/{thread_id}/messages", json={"content": "Message 1"}
    )
    await client.post(
        f"/api/threads/{thread_id}/messages", json={"content": "Message 2"}
    )

    response = await client.get(f"/api/threads/{thread_id}/messages")
    assert response.status_code == 200
    messages = response.json()
    assert len(messages) == 2
    assert messages[0]["content"] == "Message 1"
    assert messages[1]["content"] == "Message 2"


@pytest.mark.asyncio
@patch("app.services.openai_service.generate_title")
async def test_generate_thread_title(
    mock_generate_title: AsyncMock, client: AsyncClient
):
    """AIでタイトルを生成できる"""
    mock_generate_title.return_value = "Generated Title"

    create_res = await client.post("/api/threads", json={"title": "Original"})
    thread_id = create_res.json()["id"]

    response = await client.post(
        f"/api/threads/{thread_id}/generate-title",
        json={"content": "User's first message"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Generated Title"

    # タイトルが更新されている
    get_res = await client.get("/api/threads")
    assert get_res.json()[0]["title"] == "Generated Title"

    # モックが呼ばれた
    mock_generate_title.assert_called_once_with("User's first message")


@pytest.mark.asyncio
@patch("app.services.openai_service.generate_title")
async def test_generate_title_thread_not_found(
    mock_generate_title: AsyncMock, client: AsyncClient
):
    """存在しないスレッドのタイトル生成は404"""
    response = await client.post(
        "/api/threads/non-existent/generate-title",
        json={"content": "Message"},
    )
    assert response.status_code == 404
    mock_generate_title.assert_not_called()


@pytest.mark.asyncio
@patch("app.services.openai_service.generate_response_stream")
async def test_create_message_stream(
    mock_generate_stream: AsyncMock, client: AsyncClient
):
    """ストリーミングでメッセージを作成できる"""

    # モック: async generatorを返す
    async def mock_stream(*args, **kwargs):
        yield "Hello"
        yield " "
        yield "World"

    mock_generate_stream.return_value = mock_stream()

    create_res = await client.post("/api/threads", json={"title": "Stream Test"})
    thread_id = create_res.json()["id"]

    response = await client.post(
        f"/api/threads/{thread_id}/messages/stream",
        json={"content": "Tell me a story"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/event-stream; charset=utf-8"

    # ストリーミングレスポンスを読み取り
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
@patch("app.services.openai_service.generate_response_stream")
async def test_create_message_stream_thread_not_found(
    mock_generate_stream: AsyncMock, client: AsyncClient
):
    """存在しないスレッドへのストリーミングは404"""
    response = await client.post(
        "/api/threads/non-existent/messages/stream",
        json={"content": "Hello"},
    )
    assert response.status_code == 404
    mock_generate_stream.assert_not_called()
