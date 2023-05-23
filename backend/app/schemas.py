import uuid
from datetime import datetime
from typing import Optional
from decimal import Decimal

from pydantic import BaseModel, validator


class Entry(BaseModel):
    name: str
    quantity: str
    vat: str
    vatTotal: Decimal
    total: Decimal


class Invoice(BaseModel):
    month: int
    year: int
    quantityTotal: Decimal
    vat: str
    vatTotal: Decimal
    services: Entry
    products: Entry
    total: Decimal


class Appointment(BaseModel):
    id: Optional[str]
    description: str
    appointment_datetime: str

    @validator("id", pre=True, always=True)
    def default_id(cls, value):
        return value or str(uuid.uuid4())

    # @validator("timestamp", pre=True, always=True)
    # def default_timestamp(cls, value):
    #     return value or datetime.now().strftime("%Y/%m/%d %H:%M:%S")

    class Config:
        use_enum_values = True
        orm_mode = True


class Login(BaseModel):
    username: str
    password: str
