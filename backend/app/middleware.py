from fastapi import Request, Response
import secrets
from fastapi.responses import JSONResponse
from database import SessionLocal


async def custom_csrf_middleware(request: Request, call_next):
    if request.method in ("GET", "HEAD", "OPTIONS"):
        # No es necesario generar o agregar un token CSRF en respuestas para solicitudes seguras
        return await call_next(request)
    
    # request: pre-middleware
    # Generar un nuevo token CSRF
    # check if csrf is valid?
    # Llamar a la función de siguiente llamada (call_next) para continuar con el procesamiento normal
    response = await call_next(request)

    # Agregar el token CSRF en la cabecera de la respuesta
    new_csrf_token = secrets.token_hex(32)
    response.headers.append("X-CSRF-TOKEN", new_csrf_token)
    return response

async def db_session_middleware(request: Request, call_next):
    response = JSONResponse({"message": "Internal server error"}, status_code=500)

    try:
        request.state.db = SessionLocal()
        response = await call_next(request)
    finally:
        request.state.db.close()

    return response