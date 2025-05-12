from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from core.config import settings

import psycopg2

schema = settings.project_management_setting.DB_SCHEMA

project_managment_engine = create_async_engine(
    settings.project_management_setting.DATABASE_URL
)
project_managment_session = sessionmaker(project_managment_engine, class_=AsyncSession)

def get_db_connection():
    return psycopg2.connect(
        host=settings.project_management_setting.DB_HOST,
        user=settings.project_management_setting.DB_USER,
        password=settings.project_management_setting.DB_PASSWORD,
        port=settings.project_management_setting.DB_PORT,
        database=settings.project_management_setting.DB_NAME,
    )
