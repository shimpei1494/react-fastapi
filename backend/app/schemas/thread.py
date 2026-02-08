from datetime import datetime

from app.schemas.base import CamelCaseModel


class ThreadCreate(CamelCaseModel):
    title: str


class ThreadUpdate(CamelCaseModel):
    title: str | None = None


class ThreadResponse(CamelCaseModel):
    id: str
    title: str
    last_message: str
    timestamp: datetime


class GenerateTitleRequest(CamelCaseModel):
    content: str


class GenerateTitleResponse(CamelCaseModel):
    title: str
