import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, validator


class Appointment(BaseModel):
    id: Optional[str]
    description: str
    timestamp: str

    @validator("id", pre=True, always=True)
    def default_id(cls, value):
        return value or str(uuid.uuid4())

    # @validator("timestamp", pre=True, always=True)
    # def default_timestamp(cls, value):
    #     return value or datetime.now().strftime("%Y/%m/%d %H:%M:%S")

    class Config:
        use_enum_values = True
        orm_mode = True
