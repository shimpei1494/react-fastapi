from datetime import datetime

from app.schemas.base import CamelCaseModel
from app.types.message import MessageRole


class MessageCreate(CamelCaseModel):
    content: str


class MessageResponse(CamelCaseModel):
    id: str
    thread_id: str
    role: MessageRole
    content: str
    timestamp: datetime
