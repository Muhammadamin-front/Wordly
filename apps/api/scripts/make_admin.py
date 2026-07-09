"""Promote a user to admin.  Usage: .venv/bin/python -m scripts.make_admin user@email"""
import asyncio
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from sqlalchemy import update  # noqa: E402

from app.db.session import get_session_factory  # noqa: E402
from app.models.user import User  # noqa: E402


async def main(email: str) -> None:
    async with get_session_factory()() as db:
        result = await db.execute(
            update(User).where(User.email == email.lower()).values(role="admin")
        )
        await db.commit()
        if result.rowcount == 0:
            raise SystemExit("No user with email {}".format(email))
        print("{} is now admin".format(email))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    asyncio.run(main(sys.argv[1]))
