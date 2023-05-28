from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, status
from sqlalchemy.orm import Session
import os
from dependencies import get_api_key, get_db
from models import User, Appointment as ModelAppointment
from schemas import Appointment, Invoice, Login
from datetime import datetime
from sqlalchemy import func
from dotenv import load_dotenv
from odf.opendocument import OpenDocumentText
from odf.text import P
import calendar
from datetime import timedelta
from db_importer import process_csv
from fastapi.responses import FileResponse

load_dotenv()

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
            ModelAppointment.update(db, id, updated_appointment, user.id)
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
            response["success"] = ModelAppointment.delete(db, id, user.id)
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


@router.post("/import-db")
async def upload_csv(
    file: UploadFile, user: User = Depends(get_api_key), db: Session = Depends(get_db)
):
    response = {"success": False}

    response["error"] = "Feature disabled by admin"
    return response
    try:
        contents = await file.read()
        rows = process_csv(contents, user.id, db, ModelAppointment)
        if rows:
            response["success"] = True
            response["processed_rows"] = len(rows)
            return response
        else:
            return response
    except Exception as error:
        print(error)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se ha podido procesar el archivo subido: {str(error)}",
        )


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


from odf import text, teletype, userfield, table
from odf.table import Table, TableColumn, TableRow, TableCell
from odf.style import (
    Style,
    TableProperties,
    TableRowProperties,
    TableColumnProperties,
    TableCellProperties,
)
from odf.opendocument import load, OpenDocumentText


def table():
    dest_file = "temp.odt"
    doc = OpenDocumentText()

    # table styling - Its like CSS in html
    table_style = Style(name="table-style", family="table")
    table_style.addElement(TableProperties(align="margins"))
    doc.automaticstyles.addElement(table_style)

    table_cell_style = Style(name="table-cell-style", family="table-cell")
    table_cell_style.addElement(TableCellProperties(border="0.05pt solid #000000"))
    doc.automaticstyles.addElement(table_cell_style)

    table_column_style = Style(name="table-column-style", family="table-column")
    table_column_style.addElement(TableColumnProperties(columnwidth="0.2in"))
    doc.automaticstyles.addElement(table_column_style)

    table_row_style = Style(name="table-row-style", family="table-row")
    table_row_style.addElement(TableRowProperties(useoptimalrowheight=False))
    doc.automaticstyles.addElement(table_row_style)
    # --styling ends here--

    # create table
    doc_table = Table(name="xyz-table", stylename="table-style")
    # add 11 columns to the table
    table_column = TableColumn(
        numbercolumnsrepeated="11", stylename="table-column-style"
    )
    doc_table.addElement(table_column)
    """
    #   or you can do the followig for the same as above
    for i in range(11):
        table_column = TableColumn(stylename="table-column-style")
        doc_table.addElement(table_column)
    """
    # add data of 10 rows in the table
    for i in range(10):
        table_row = TableRow()
        doc_table.addElement(table_row)
        # PUT A TO K IN THE CELLS
        data = ("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K")
        for i in list(data):
            column_data = TableCell(valuetype="string", stylename="table-cell-style")
            table_row.addElement(column_data)
            column_data.addElement(text.P(text=i))
    doc.text.addElement(doc_table)
    doc.save(dest_file)
    # print(dir(doc))


@router.post("/generate-pdf")
async def generate_pdf(invoice: Invoice, user: User = Depends(get_api_key)):
    print(invoice)
    table()

    return FileResponse("temp.odt", filename="document.odt")
