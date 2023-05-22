from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

def create_folder_if_not_exists():
    db_path="db"
    if not os.path.exists(db_path):
        os.mkdir(db_path)

SQLALCHEMY_DATABASE_URL = "sqlite:///./db/database.sqlite"

create_folder_if_not_exists()

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
