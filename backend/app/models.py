import binascii
import hashlib
import os
import uuid
from datetime import datetime
from typing import List
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Session, relationship
from fastapi import HTTPException
from dotenv import load_dotenv
import os
from database import Base

load_dotenv()


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


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String)
    appointment_datetime = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __init__(
        self,
        user_id: int,
        description: str,
        appointment_datetime: datetime = None,
        id: str = None,
        created_at: datetime = None,
    ):
        if id:
            self.id = id
        if created_at:
            self.created_at = created_at
        if user_id:
            self.user_id = user_id
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
            user_id=user_id,
            description=description,
            appointment_datetime=parsed_appointment_datetime,
        )
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
        import time

        start_time = time.time()
        join_query = db.query(Appointment).join(User).filter(User.id == user_id)
        response = (
            join_query.filter(func.date(Appointment.appointment_datetime) == date)
            .order_by(func.time(Appointment.appointment_datetime))
            .all()
        )
        end_time = time.time()
        duration_ms = (end_time - start_time) * 1000
        print(f"El método tardó {duration_ms:.2f} ms en ejecutarse")
        return response

    @classmethod
    def get_all(cls, db: Session) -> List["Appointment"]:
        return db.query(cls).all()


class HistoricalAppointment(Base):
    __tablename__ = "historical_appointments"
    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String)
    appointment_datetime = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    migrated_at = Column(DateTime, default=datetime.utcnow)

    def __init__(
        self,
        id: str,
        user_id: int,
        description: str,
        appointment_datetime: datetime,
        created_at: datetime,
    ):
        self.id = id
        self.created_at = created_at
        self.user_id = user_id
        self.description = description
        self.appointment_datetime = appointment_datetime


def move_old_appointments(db: Session):
    date_condition = datetime(year=datetime.now().year, month=1, day=1)
    old_appointments = (
        db.query(Appointment)
        .filter(Appointment.appointment_datetime < date_condition)
        .all()
    )
    affected_rows = 0
    for old_appointment in old_appointments:
        historical_appointment = HistoricalAppointment(
            id=old_appointment.id,
            user_id=old_appointment.user_id,
            description=old_appointment.description,
            appointment_datetime=old_appointment.appointment_datetime,
            created_at=old_appointment.created_at,
        )
        db.add(historical_appointment)
        db.delete(old_appointment)
        affected_rows += 1
    db.commit()
    db.close()
    print("{} rows have been migrated".format(affected_rows))


def create_initial_users(db: Session):
    if not User.exists(db):
        User.create(
            db,
            username=os.getenv("DB_DEFAULT_USER"),
            password=os.getenv("DB_DEFAULT_PASS"),
        ),
        print("Initial users created.")
    else:
        print("There are users in the database, initial users not created.")
