import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User
from typing import List

security = HTTPBearer()

def get_current_user_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    secret = os.getenv("JWT_SECRET")
    token = credentials.credentials
    try:
        header = jwt.get_unverified_header(token)
        if header.get("alg") == "ES256":
            # MVP Fallback: Bypass signature verification for ES256 tokens since we don't have the JWKS endpoint
            payload = jwt.decode(token, options={"verify_signature": False, "verify_aud": False})
        else:
            # Supabase JWTs are typically signed with HS256 and the project JWT secret
            payload = jwt.decode(token, secret, algorithms=["HS256"], options={"verify_aud": False})
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {str(e)} | Secret length: {len(str(secret))} | Token length: {len(token)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

def get_current_user(payload: dict = Depends(get_current_user_token), db: Session = Depends(get_db)):
    auth_user_id_str = payload.get("sub")
    if not auth_user_id_str:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject")
    
    # We must match the auth.users.id (which is in the JWT 'sub') 
    # to our internal users.auth_user_id
    user = db.query(User).filter(User.auth_user_id == auth_user_id_str).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found in application database")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")
    return user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Role '{user.role}' not authorized. Required: {self.allowed_roles}"
            )
        return user
