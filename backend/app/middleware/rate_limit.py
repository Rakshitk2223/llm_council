from abc import ABC, abstractmethod
from datetime import date
from typing import Dict

from fastapi import Depends, HTTPException

from app.config import settings
from app.middleware.auth import get_current_user


class RateLimiter(ABC):
    @abstractmethod
    def check_and_increment(self, user_id: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    def get_remaining(self, user_id: str) -> int:
        raise NotImplementedError

    @abstractmethod
    def reset(self, user_id: str) -> None:
        raise NotImplementedError


class InMemoryRateLimiter(RateLimiter):
    def __init__(self) -> None:
        self._store: Dict[str, dict] = {}

    def check_and_increment(self, user_id: str) -> bool:
        today = date.today().isoformat()
        if user_id not in self._store:
            self._store[user_id] = {"date": today, "count": 0}
        user_limit = self._store[user_id]
        if user_limit["date"] != today:
            user_limit["date"] = today
            user_limit["count"] = 0
        if user_limit["count"] >= settings.rate_limit_per_day:
            return False
        user_limit["count"] += 1
        return True

    def get_remaining(self, user_id: str) -> int:
        today = date.today().isoformat()
        if user_id not in self._store:
            return settings.rate_limit_per_day
        user_limit = self._store[user_id]
        if user_limit["date"] != today:
            return settings.rate_limit_per_day
        return max(0, settings.rate_limit_per_day - user_limit["count"])

    def reset(self, user_id: str) -> None:
        if user_id in self._store:
            self._store.pop(user_id, None)


class DatabaseRateLimiter(RateLimiter):
    def __init__(self, db_session):
        self.db = db_session

    def check_and_increment(self, user_id: str) -> bool:
        raise NotImplementedError

    def get_remaining(self, user_id: str) -> int:
        raise NotImplementedError

    def reset(self, user_id: str) -> None:
        raise NotImplementedError


rate_limiter = InMemoryRateLimiter()


def check_rate_limit(user_id: str = Depends(get_current_user)) -> bool:
    if not rate_limiter.check_and_increment(user_id):
        raise HTTPException(
            status_code=429,
            detail={
                "error": "You have reached your daily freemium limit",
                "code": "RATE_LIMIT_EXCEEDED",
            },
        )
    return True


def get_remaining_queries(user_id: str) -> int:
    return rate_limiter.get_remaining(user_id)
