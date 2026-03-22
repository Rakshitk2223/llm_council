from fastapi import Header, HTTPException
from jose import JWTError, jwt

from app.config import settings


def _extract_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Please login first to use LLM Council",
                "code": "AUTH_REQUIRED",
            },
        )
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Please login first to use LLM Council",
                "code": "AUTH_REQUIRED",
            },
        )
    return parts[1]


def get_current_user(authorization: str | None = Header(default=None)) -> str:
    if settings.auth_disabled:
        return "test-user"

    token = _extract_token(authorization)
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Please login first to use LLM Council",
                "code": "AUTH_REQUIRED",
            },
        ) from exc

    user_id = payload.get("sub") or payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Please login first to use LLM Council",
                "code": "AUTH_REQUIRED",
            },
        )
    return user_id
