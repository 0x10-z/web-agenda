from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os
from dependencies import get_api_key, get_db
from models import User

router = APIRouter()


class Login(BaseModel):
    username: str
    password: str


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


class RequestMessage(BaseModel):
    message: str


@router.post("/appointments")
def index(
    request_message: RequestMessage,
    user: User = Depends(get_api_key),
    db: Session = Depends(get_db),
):
    response = {"success": False}
    if request_message:
        pass
    else:
        response["error"] = "Message field is mandatory"
    return response


@router.get("/")
def index_method_not_allowed():
    return {"detail": "Method Now Allowed", "message": "Please, use POST method"}
