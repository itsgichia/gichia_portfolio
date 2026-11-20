"""Single-admin authentication with signed, expiring tokens.

Set ADMIN_PASSWORD and SECRET_KEY as environment variables (never in code).
"""

import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import time

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

log = logging.getLogger(__name__)

TOKEN_TTL_SECONDS = 12 * 60 * 60
_bearer = HTTPBearer(auto_error=False)

_SECRET = os.getenv("SECRET_KEY")
if not _SECRET:
    _SECRET = secrets.token_hex(32)
    log.warning("SECRET_KEY not set: admin sessions will end when the server restarts.")


def admin_enabled() -> bool:
    return bool(os.getenv("ADMIN_PASSWORD"))


def check_password(password: str) -> bool:
    expected = os.getenv("ADMIN_PASSWORD", "")
    return bool(expected) and hmac.compare_digest(password.encode(), expected.encode())


def _sign(payload: bytes) -> str:
    return hmac.new(_SECRET.encode(), payload, hashlib.sha256).hexdigest()


def issue_token() -> str:
    payload = base64.urlsafe_b64encode(json.dumps({"sub": "admin", "exp": int(time.time()) + TOKEN_TTL_SECONDS}).encode())
    return f"{payload.decode()}.{_sign(payload)}"


def verify_token(token: str) -> bool:
    try:
        payload_b64, sig = token.split(".", 1)
        if not hmac.compare_digest(sig, _sign(payload_b64.encode())):
            return False
        payload = json.loads(base64.urlsafe_b64decode(payload_b64.encode()))
        return payload.get("sub") == "admin" and payload.get("exp", 0) > time.time()
    except Exception:
        return False


def require_admin(creds: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> bool:
    if not creds or not verify_token(creds.credentials):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not signed in or session expired")
    return True
