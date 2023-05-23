FROM python:3.11-alpine

WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY ./app .
COPY ./.env /.env

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80", "--reload"]