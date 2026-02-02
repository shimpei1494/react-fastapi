from datetime import datetime
from typing import Literal

from app.schemas.base import CamelCaseModel


class MessageCreate(CamelCaseModel):
    content: str


class MessageResponse(CamelCaseModel):
    id: str
    thread_id: str
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime
