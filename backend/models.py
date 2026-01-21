from sqlalchemy import Column, Integer, String, Float, JSON
from database import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    avatar_url = Column(String, nullable=True)
    elo_rating = Column(Float, default=1500.0)
    matches_played = Column(Integer, default=0)
    matches_won = Column(Integer, default=0)
    matches_lost = Column(Integer, default=0)
    goals_scored = Column(Integer, default=0)
    goals_conceded = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    created_at = Column(String)
    updated_at = Column(String)

class Match(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True, index=True)
    match_type = Column(String)
    team1_ids = Column(JSON)
    team2_ids = Column(JSON)
    score1 = Column(Integer)
    score2 = Column(Integer)
    winner_ids = Column(JSON)
    elo_change = Column(Float)
    played_at = Column(String)
    created_at = Column(String)

class Settings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, default=1)
    k_factor = Column(Float, default=32.0)
