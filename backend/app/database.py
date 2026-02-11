import os
from pathlib import Path
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

BASE_DIR = Path(__file__).resolve().parent.parent

# Azure App Serviceでは /home が永続化される
# ローカルでは backend/data を使用
if os.getenv("WEBSITE_INSTANCE_ID"):  # Azure App Service環境
    DB_PATH = Path("/home/data/chat.db")
else:  # ローカル開発環境
    DB_PATH = BASE_DIR / "data" / "chat.db"

# ディレクトリが存在しない場合は作成
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite+aiosqlite:///{DB_PATH}",
)

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
