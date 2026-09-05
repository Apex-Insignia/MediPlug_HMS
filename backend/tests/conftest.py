import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import uuid
from datetime import datetime

from app.main import app
from app.database.database import Base, get_db
from app.core.auth import get_current_user
from app.models.models import User

# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    # Setup test DB tables before returning client
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    # Teardown
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def override_role(client):
    def _override(role_name: str):
        def override_get_current_user():
            # Mock a user in the test DB or just return a dummy user object
            return User(
                user_id=uuid.uuid4(),
                name=f"Test {role_name}",
                email=f"{role_name.lower()}@test.com",
                role=role_name,
                status="ACTIVE"
            )
        app.dependency_overrides[get_current_user] = override_get_current_user
    
    yield _override
    
    # Restore original dependency
    if get_current_user in app.dependency_overrides:
        del app.dependency_overrides[get_current_user]
