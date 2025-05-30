# app/repository/user_repository.py
from repository.database import async_session_maker
from pydantic import EmailStr
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from core.config import Settings
from utils.password_utils import get_password_hash


class UserRepository:
    async def find_user_by_email(cls, email: EmailStr) -> dict | None:
        """Find user by email."""
        async with async_session_maker() as session:
            query = text(f"""
                SELECT id, email, name 
                FROM {Settings.DB_SCHEMA}.user 
                WHERE email = :email
            """)
            result = await session.execute(query.params(email=email))
            row = result.fetchone()
            print(row)
            return {"user_id": row[0], "email": row[1], "name": row[2]} if row else None
        

    async def find_user_by_login(cls, name: str) -> dict | None:
        """Find user by email."""
        async with async_session_maker() as session:
            query = text(f"""
                SELECT id, email, name 
                FROM {Settings.DB_SCHEMA}.user 
                WHERE name = :name
            """)
            result = await session.execute(query.params(name=name))
            row = result.fetchone()
            return {"user_id": row[0], "email": row[1], "name": row[2]} if row else None


    async def find_password_by_email(cls, email: EmailStr) -> str | None:
        """Get password hash by email."""
        async with async_session_maker() as session:
            query = text(f"""
                SELECT "hashedPassword" 
                FROM {Settings.DB_SCHEMA}.user 
                WHERE email = :email
            """)
            result = await session.execute(query.params(email=email))
            row = result.fetchone()
            return row[0] if row else None
        

    async def find_password_by_login(cls, name: str) -> str | None:
        """Get password hash by email."""
        async with async_session_maker() as session:
            query = text(f"""
                SELECT "hashedPassword" 
                FROM {Settings.DB_SCHEMA}.user 
                WHERE name = :name
            """)
            result = await session.execute(query.params(name=name))
            row = result.fetchone()
            return row[0] if row else None
        
    
    async def find_email_by_login(cls, name: str) -> str | None:
        """Get password hash by email."""
        async with async_session_maker() as session:
            query = text(f"""
                SELECT email 
                FROM {Settings.DB_SCHEMA}.user 
                WHERE name = :name
            """)
            result = await session.execute(query.params(name=name))
            row = result.fetchone()
            return row[0] if row else None


    async def does_user_exist(cls, email: EmailStr) -> bool:
        """Check if a user exists by email."""
        async with async_session_maker() as session:
            query = text(f"SELECT 1 FROM {Settings.DB_SCHEMA}.user WHERE email = :email")
            result = await session.execute(query.params(email=email))
            return result.scalar() is not None
        
    
    async def does_user_exist_login(cls, name: str) -> bool:
        """Check if a user exists by email."""
        async with async_session_maker() as session:
            query = text(f"SELECT 1 FROM {Settings.DB_SCHEMA}.user WHERE name = :name")
            result = await session.execute(query.params(name=name))
            return result.scalar() is not None


    async def create_user(cls, email: EmailStr, name: str, password: str) -> None:
        """Create a new user."""
        async with async_session_maker() as session:
            query = text(f"""
                INSERT INTO {Settings.DB_SCHEMA}.user (email, name, hashedPassword) 
                VALUES (:email, :name, :password)
            """)
            await session.execute(query.params(email=email, name=name, password=password))
            await session.commit()

    async def update_password(email: str, new_password: str) -> None:
        """Update a user's password."""
        async with async_session_maker() as session:
            hashed_password = get_password_hash(new_password)
            query = text(f"""
                UPDATE {Settings.DB_SCHEMA}.user 
                SET hashedPassword = :new_password 
                WHERE email = :email
            """)
            await session.execute(query.params(email=email, new_password=hashed_password))
            await session.commit()


    async def find_user_data_for_jwt(cls, email: EmailStr) -> dict | None:
        """Get user data needed for JWT payload."""
        async with async_session_maker() as session:
            query = text(f"""
                SELECT id, name, email
                FROM {Settings.DB_SCHEMA}.user
                WHERE email = :email
            """)
            result = await session.execute(query.params(email=email))
            row = result.fetchone()
            return {
                "user_id": row[0],
                "name": row[1],
                "email": row[2]
            } if row else None
