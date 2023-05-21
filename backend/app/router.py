from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
import os
from dependencies import get_api_key, get_db
from models import User, Appointment as ModelAppointment
from schemas import Appointment, Login
from datetime import datetime
from sqlalchemy import func

router = APIRouter()


@router.post("/login")
def login(credentials: Login, db: Session = Depends(get_db)):
    response = {"success": False}
    if credentials:
        user = User.authenticate(
            db, username=credentials.username.lower(), password=credentials.password
        )
        if user:
            response["success"] = True
            response["token"] = user.api_key
            response["user"] = user.to_sanitized_dict()
        else:
            response["error"] = "Credentials are incorrect"
    else:
        response["error"] = "Username and Password fields are mandatory"
    return response


@router.get("/version")
def version():
    return {"version": os.environ.get("APP_VERSION")}


@router.post("/appointments")
def appointments_post(
    new_appointment: Appointment,
    user: User = Depends(get_api_key),
    db: Session = Depends(get_db),
):
    response = {"success": False}
    if new_appointment:
        appointment = ModelAppointment.create(
            db,
            user_id=user.id,
            description=new_appointment.description,
            appointment_datetime=new_appointment.appointment_datetime,
        )
        if appointment:
            response["success"] = True
    else:
        response["error"] = "Message field is mandatory"
    return response


@router.get("/appointments")
def appointments_get(
    user: User = Depends(get_api_key),
    date: str = Query(
        None, description="Fecha para filtrar los appointments en formato 'YYYY-MM-DD'"
    ),
    db: Session = Depends(get_db),
):
    response = {"success": True, "appointments": []}

    appointments_query = db.query(ModelAppointment).filter_by(user_id=user.id)
    if date:
        try:
            filter_date = datetime.strptime(date, "%Y-%m-%d").date()
            appointments_query = appointments_query.filter(
                func.date(ModelAppointment.appointment_datetime) == filter_date
            )
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Fecha proporcionada en formato incorrecto. Debe ser 'YYYY-MM-DD'",
            )

    response["appointments"] = appointments_query.all()

    return response


@router.get("/")
def index_method_not_allowed():
    return {"detail": "Method Now Allowed", "message": "Please, use POST method"}
