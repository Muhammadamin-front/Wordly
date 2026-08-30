"""Central role policy. Authorization always happens in the API, never in UI guards."""

from typing import Final, FrozenSet

LEARNER: Final = "learner"
TEACHER: Final = "teacher"
SUPPORT: Final = "support"
CONTENT_MANAGER: Final = "content_manager"
ADMIN: Final = "admin"
SUPER_ADMIN: Final = "super_admin"

ALL_ROLES: Final[FrozenSet[str]] = frozenset(
    {LEARNER, TEACHER, SUPPORT, CONTENT_MANAGER, ADMIN, SUPER_ADMIN}
)
ADMIN_ROLES: Final[FrozenSet[str]] = frozenset({ADMIN, SUPER_ADMIN})
SUPPORT_ROLES: Final[FrozenSet[str]] = frozenset({SUPPORT, ADMIN, SUPER_ADMIN})
CONTENT_ROLES: Final[FrozenSet[str]] = frozenset({CONTENT_MANAGER, ADMIN, SUPER_ADMIN})
