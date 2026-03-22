from cryptography.fernet import Fernet

from libs.models.settings import get_settings


def _fernet() -> Fernet:
    return Fernet(get_settings().credential_key.encode())


def encrypt_secret(value: str) -> str:
    return _fernet().encrypt(value.encode()).decode()


def decrypt_secret(value: str) -> str:
    return _fernet().decrypt(value.encode()).decode()

