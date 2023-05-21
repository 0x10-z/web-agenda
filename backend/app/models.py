import binascii
import hashlib
import os
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Session, relationship

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

    @staticmethod
    def create(
        db: Session, user_id: int, description: str, appointment_datetime: datetime
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
