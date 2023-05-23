import binascii
import hashlib
import os
import uuid
from datetime import datetime
from typing import List
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Session, relationship
from fastapi import HTTPException

from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(128), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login_at = Column(DateTime, default=None)
    api_key = Column(String(36), unique=True, index=True, default=generate_uuid)

    appointments = relationship("Appointment", backref="user")

    def to_sanitized_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "appointments": self.appointments,
        }

    @classmethod
    def authenticate(cls, db: Session, username: str, password: str):
        user = db.query(cls).filter(cls.username == username).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        user.last_login_at = datetime.now()
        db.commit()
        return user

    @classmethod
    def exists(cls, db: Session) -> bool:
        return db.query(cls).first() is not None

    @staticmethod
    def create(db: Session, username: str, password: str):
        hashed_password = get_password_hash(password)
        user = User(username=username, hashed_password=hashed_password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


def get_password_hash(password: str) -> str:
    salt = hashlib.sha256(os.urandom(60)).hexdigest().encode("ascii")
    pwdhash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    pwdhash = binascii.hexlify(pwdhash)
    return (salt + pwdhash).decode("ascii")


def verify_password(password: str, hashed_password: str) -> bool:
    salt = hashed_password[:64]
    stored_password = hashed_password[64:]
    pwdhash = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("ascii"), 100000
    )
    pwdhash = binascii.hexlify(pwdhash).decode("ascii")
    return pwdhash == stored_password


def create_initial_users(db: Session):
    if not User.exists(db):
        User.create(db, username="user", password="user"),
        print("Initial users created.")
    else:
        print("There are users in the database, initial users not created.")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String)
    appointment_datetime = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __init__(
        self,
        description: str,
        appointment_datetime: datetime = None,
    ):
        self.description = description
        self.appointment_datetime = appointment_datetime or datetime.utcnow()

    @classmethod
    def create(
        cls, db: Session, user_id: int, description: str, appointment_datetime: datetime
    ):
        parsed_appointment_datetime = datetime.strptime(
            appointment_datetime, "%Y-%m-%d %H:%M"
        )

        appointment = Appointment(
            description=description, appointment_datetime=parsed_appointment_datetime
        )
        appointment.user_id = user_id
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        return appointment

    @classmethod
    def get_by_id(cls, db: Session, id: int) -> "Appointment":
        return db.query(cls).filter(cls.id == id).first()

    @classmethod
    def delete(cls, db, id, user_id):
        appointment = db.query(cls).filter_by(id=id, user_id=user_id).first()
        if appointment:
            db.delete(appointment)
            db.commit()
            return True
        return False

    @classmethod
    def update(
        cls,
        db: Session,
        appointment_id: str,
        updated_appointment: "Appointment",
        user_id: int,
    ) -> bool:
        appointment = cls.get_by_id(db, appointment_id)
        if appointment:
            if appointment.user_id == user_id:
                appointment.description = updated_appointment.description
                appointment.appointment_datetime = datetime.strptime(
                    updated_appointment.appointment_datetime, "%Y-%m-%d %H:%M"
                )
                db.commit()
                return True
            else:
                raise HTTPException(status_code=403, detail="Unauthorized")
        else:
            raise HTTPException(status_code=404, detail="Appointment not found")

    @classmethod
    def get_by_date(cls, db: Session, date: str, user_id: int) -> List["Appointment"]:
        appointments_query = db.query(Appointment).filter_by(user_id=user_id)
        appointments_query = appointments_query.filter(
            func.date(Appointment.appointment_datetime) == date
        )
        appointments_query = appointments_query.order_by(
            func.time(Appointment.appointment_datetime)
        )
        return appointments_query.all()

    @classmethod
    def get_all(cls, db: Session) -> List["Appointment"]:
        return db.query(cls).all()
