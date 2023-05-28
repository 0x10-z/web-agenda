import csv
import io
from typing import List
from datetime import datetime
from models import Appointment
from sqlalchemy.orm import Session


def clean_row(row: dict) -> dict:
    """
    Limpia una fila del archivo CSV y retorna un diccionario con los valores limpios.
    """
    id = f"00000000-0000-0000-0000-{row['eventId'].zfill(12)}"
    dt_format = "%Y-%m-%d %H:%M:%S"
    appointment_datetime = datetime.strptime(row["dateTime"], dt_format)
    description = f"{row['description']}. {row['name'].replace('namedefault', '')}"
    created_on = (
        datetime.strptime(row["dateTime"], dt_format)
        if not row["created_on"]
        else datetime.strptime(row["created_on"], dt_format)
    )
    return dict(
        id=id,
        appointment_datetime=appointment_datetime,
        description=description,
        created_on=created_on,
    )


def process_csv(
    contents: bytes, user_id: int, db: Session, model: Appointment
) -> List[dict]:
    """
    Procesa los datos del archivo CSV y los inserta en la base de datos.
    """
    file_content = io.StringIO(contents.decode("ISO-8859-1"), newline="")
    csv_reader = csv.DictReader(file_content)
    rows = []
    for i, row in enumerate(csv_reader):
        if i == 0:
            column_names = ", ".join(row.keys())
            print(f"Columnas: {column_names}")
        else:
            cleaned_row = clean_row(row)
            print(cleaned_row)
            appointment = model(
                id=cleaned_row["id"],
                appointment_datetime=cleaned_row["appointment_datetime"],
                description=cleaned_row["description"],
                created_at=cleaned_row["created_on"],
                user_id=user_id,
            )
            db.add(appointment)
            rows.append(cleaned_row)
    db.commit()
    print(f"Procesadas {i} filas en total.")
    return rows
