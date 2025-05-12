from dataclasses import dataclass, field
from dotenv import load_dotenv
import os

load_dotenv()


@dataclass
class ProjectManagementSettings:
    DB_HOST: str = os.environ.get("DB_HOST")
    DB_PORT: str = os.environ.get("DB_PORT")
    DB_USER: str = os.environ.get("DB_USER")
    DB_PASSWORD: str = os.environ.get("DB_PASS")
    DB_NAME: str = os.environ.get("DB_NAME")
    DB_SCHEMA: str = os.environ.get("DB_SCHEMA")

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    ALGORITHM: str = os.environ.get("ALGORITHM")
    SECRET_KEY: str = os.environ.get("SECRET_KEY")


@dataclass
class Settings:
    project_management_setting: ProjectManagementSettings = field(default_factory=ProjectManagementSettings)

settings = Settings()
print(settings.project_management_setting.DATABASE_URL)

RENOVATION_FILE_PATH = './sql/renovation/'
RECOMMENDATION_FILE_PATH = './sql/recommendation'
