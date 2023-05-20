from fastapi import Depends, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


api_key_name = "Authorization"
api_key_header = APIKeyHeader(name=api_key_name, auto_error=False)


async def get_api_key(
    api_key_header: str = Security(api_key_header), db: Session = Depends(get_db)
):
    try:
        if not api_key_header:
            raise_http_exception()

        scheme, token = api_key_header.split()
        if scheme.lower() != "bearer":
            raise_http_exception()

    except ValueError:
        raise_http_exception()

    user = db.query(User).filter(User.api_key == token).first()
    if not user:
        raise HTTPException(status_code=403, detail="Invalid API key")

    print("User {} made a request".format(user.username))
    return user


def raise_http_exception():
    raise HTTPException(
        status_code=401,
        detail="Invalid Authorization header",
        headers={"WWW-Authenticate": "Bearer"},
    )