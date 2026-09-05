from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# If no DB URL is provided, we can fallback to SQLite for local development or just error out.
# For HMS MVP, we assume a Postgres URL from Supabase is expected.
# We'll put a dummy sqlite URL to allow the app to boot if not configured, or just leave it.

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./test.db"
    print("WARNING: DATABASE_URL not set in environment. Falling back to SQLite for local testing.")

# For postgres, we use the synchronous psycopg driver
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(
    DATABASE_URL, 
    # connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
