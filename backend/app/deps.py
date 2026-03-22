import uuid
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole

security = HTTPBearer(auto_error=False)


def get_current_user(
    db: Session = Depends(get_db),
    creds: HTTPAuthorizationCredentials | None = Depends(security),
) -> User:
    if not creds or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    from app.core.security import decode_access_token

    try:
        payload = decode_access_token(creds.credentials)
        uid = uuid.UUID(payload["sub"])
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.get(User, uid)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    if getattr(user, "access_expires_at", None):
        if user.access_expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Доступ к платформе истёк. Обратитесь к администратору.",
            )
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return user
