from fastapi import APIRouter, HTTPException, Depends, Query, Path
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


@router.put("/appointments/{id}")
def appointments_update(
    id: str,
    updated_appointment: Appointment,
    user: User = Depends(get_api_key),
    db: Session = Depends(get_db),
):
    response = {"success": False}
    if updated_appointment:
        try:
            ModelAppointment.update_appointment(db, id, updated_appointment, user.id)
            response["success"] = True
            response["appointments"] = ModelAppointment.get_all(db)
        except HTTPException as e:
            response["error"] = str(e.detail)
    else:
        response["error"] = "Invalid appointment data"
    return response


@router.delete("/appointments/{id}")
def appointments_update(
    id: str,
    user: User = Depends(get_api_key),
    db: Session = Depends(get_db),
):
    response = {"success": False}
    if id:
        try:
            response["success"] = ModelAppointment.delete_appointment(db, id, user.id)
            response["appointments"] = ModelAppointment.get_all(db)
        except HTTPException as e:
            response["error"] = str(e.detail)
    else:
        response["error"] = "Invalid appointment data"
    return response


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
            response["appointments"] = ModelAppointment.get_all(db)
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
            # response["appointments"] = appointments_query.all()

            response["appointments"] = ModelAppointment.get_by_date(db, date, user.id)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Fecha proporcionada en formato incorrecto. Debe ser 'YYYY-MM-DD'",
            )

    return response


import calendar
from datetime import timedelta


def get_month_appointments(month: int, year: int, user, db):
    appointments_by_day = []

    _, num_days = calendar.monthrange(year, month)
    start_date = datetime(year, month, 1).date()

    for day in range(1, num_days + 1):
        current_date = start_date + timedelta(days=day - 1)
        appointments_count = ModelAppointment.get_by_date(db, current_date, user.id)
        appointments_by_day.append(
            {"month": month, "day": day, "appointments": len(appointments_count)}
        )

    return appointments_by_day


@router.get("/appointments/monthly/{year}/{month}")
def get_monthly_appointments(
    year: int,
    month: int,
    user: User = Depends(get_api_key),
    db: Session = Depends(get_db),
):
    print("{}/{}".format(year, month))
    if not (1 <= month <= 12):
        raise HTTPException(
            status_code=400, detail="Mes inválido. Debe estar entre 1 y 12."
        )

    appointments_by_day = get_month_appointments(month, year, user, db)
    return appointments_by_day


@router.get("/")
def index_method_not_allowed():
    return {"detail": "Method Now Allowed", "message": "Please, use POST method"}
