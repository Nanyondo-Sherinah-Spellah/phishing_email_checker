   
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


# Locate the backend directory.
BASE_DIR = Path(__file__).resolve().parents[2]

# Store the SQLite database in the backend directory.
DATABASE_PATH = BASE_DIR / "phishing_checker.db"

# Create the database connection URL.
DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"


# Configure the SQLAlchemy engine.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


# Create a reusable database session factory.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# Base class for all database models.
class Base(DeclarativeBase):
    pass


# Provide a database session to FastAPI endpoints.
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
