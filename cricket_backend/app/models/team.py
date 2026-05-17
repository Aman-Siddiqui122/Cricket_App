from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,
    ForeignKey,
    Date
)

from sqlalchemy.orm import relationship
from datetime import date
from app.core.database import Base


class Team(Base):
    __tablename__ = "teams"

    # =====================================================
    # BASIC INFO
    # =====================================================

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(100),
        nullable=False,
        unique=True
    )

    admin_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    home_ground_id = Column(
        Integer,
        ForeignKey("grounds.id", ondelete="SET NULL"),
        nullable=True
    )

    contact_number = Column(
        String(20),
        nullable=True
    )

    jazzcash_number = Column(
        String(20),
        nullable=True
    )

    # =====================================================
    # SUBSCRIPTION
    # =====================================================

    subscription_status = Column(
        Enum(
            "trial",
            "active",
            "expired",
            name="subscription_status"
        ),
        default="trial",
        nullable=False
    )

    subscription_start = Column(
        Date,
        default=date.today,
        nullable=False
    )

    subscription_end = Column(
        Date,
        nullable=True
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    admin = relationship(
        "User",
        back_populates="teams_admin"
    )

    players = relationship(
        "Player",
        back_populates="team",
        cascade="all, delete-orphan"
    )

    home_ground = relationship(
        "Ground"
    )

    # =====================================================
    # HELPERS
    # =====================================================

    @property
    def players_count(self):
        return len(self.players) if self.players else 0

    @players_count.setter
    def players_count(self, value):
        self._players_count = value

    def is_active(self):
        """
        Check if team subscription is active
        """

        if not self.subscription_end:
            return False

        today = date.today()

        # Trial still valid
        if self.subscription_status == "trial":
            return self.subscription_end >= today

        # Paid subscription valid
        if self.subscription_status == "active":
            return self.subscription_end >= today

        return False

    def is_expired(self):
        """
        Check if subscription expired
        """

        if not self.subscription_end:
            return True

        return self.subscription_end < date.today()

    def __repr__(self):
        return f"<Team id={self.id} name='{self.name}'>"