import os

import uvicorn
from fastapi import FastAPI, Request
#from fastapi.middleware.cors import CORSMiddleware
from starlette_csrf import CSRFMiddleware
from starlette.middleware.cors import CORSMiddleware

from database import Base, SessionLocal, engine
from models import create_initial_users
from router import router
from middleware import custom_csrf_middleware, db_session_middleware

app = FastAPI()

# This must be before add_middleware
app.include_router(router)

origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
print("ORIGINS: {}".format(origins))
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(CSRFMiddleware, secret="__CHANGE_ME__")
#app.middleware("http")(custom_csrf_middleware)
app.middleware("http")(db_session_middleware)

# @app.middleware("http")
# async def db_session_middleware(request: Request, call_next):
#     response = JSONResponse({"message": "Internal server error"}, status_code=500)

#     try:
#         request.state.db = SessionLocal()
#         response = await call_next(request)
#     finally:
#         request.state.db.close()

#     return response


Base.metadata.create_all(bind=engine)
create_initial_users(SessionLocal())
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=80)