import os
import json
import math
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

import models, database

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)

# Pydantic Models
class PlayerCreate(BaseModel):
    name: str

class PlayerResponse(BaseModel):
    id: str
    name: str
    avatar_url: Optional[str] = None
    elo_rating: float
    matches_played: int
    matches_won: int
    matches_lost: int
    goals_scored: int
    goals_conceded: int
    current_streak: int
    best_streak: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class NewMatchPayload(BaseModel):
    matchType: str
    team1Ids: List[str]
    team2Ids: List[str]
    score1: int
    score2: int

class MatchResponse(BaseModel):
    id: str
    match_type: str
    team1_ids: List[str]
    team2_ids: List[str]
    score1: int
    score2: int
    winner_ids: List[str]
    elo_change: float
    played_at: str
    created_at: str

    class Config:
        from_attributes = True

class EloConfig(BaseModel):
    goal_diff_bonus_percent: int = 0
    underdog_bonus_percent: int = 0
    underdog_loss_divider: float = 1.0
    match_type_1v1_mult: float = 1.0
    match_type_2v2_mult: float = 1.0
    match_type_2v1_mult: float = 1.0

class GameSettings(BaseModel):
    kFactor: float
    adminPassword: Optional[str] = None
    eloConfig: Optional[EloConfig] = None

class RankCreate(BaseModel):
    name: str
    min_elo: int
    color: str

class RankResponse(BaseModel):
    id: str
    name: str
    min_elo: int
    color: str
    order: int
    
    class Config:
        from_attributes = True

class SeasonArchiveResponse(BaseModel):
    id: str
    name: str
    archived_at: str
    
    class Config:
        from_attributes = True

# Logic helpers
def get_settings(db: Session):
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def init_ranks(db: Session):
    if db.query(models.Rank).count() == 0:
        defaults = [
            {"name": "Employed", "min_elo": 0, "color": "gray", "order": 0},
            {"name": "Junior Unemployed", "min_elo": 1200, "color": "blue", "order": 1},
            {"name": "Senior Unemployed", "min_elo": 1400, "color": "green", "order": 2},
            {"name": "Unemployed Grandmaster", "min_elo": 1600, "color": "purple", "order": 3},
            {"name": "Chief of Unemployment", "min_elo": 1800, "color": "gold", "order": 4},
        ]
        for r in defaults:
            db_rank = models.Rank(id=str(uuid.uuid4()), **r)
            db.add(db_rank)
        db.commit()

# Startup event
@app.on_event("startup")
def on_startup():
    db = database.SessionLocal()
    try:
        init_ranks(db)
        # Migrations
        try:
            db.execute("SELECT elo_config FROM settings LIMIT 1")
        except:
            try:
                db.execute("ALTER TABLE settings ADD COLUMN elo_config TEXT")
                db.commit()
                default_conf = json.dumps({
                    "goal_diff_bonus_percent": 0,
                    "underdog_bonus_percent": 0,
                    "underdog_loss_divider": 1.0,
                    "match_type_1v1_mult": 1.0,
                    "match_type_2v2_mult": 1.0,
                    "match_type_2v1_mult": 1.0
                })
                db.execute(f"UPDATE settings SET elo_config = '{default_conf}'")
                db.commit()
            except:
                pass
        get_settings(db)
    finally:
        db.close()

# API Endpoints
@app.get("/api/settings", response_model=GameSettings)
def read_settings(db: Session = Depends(database.get_db)):
    s = get_settings(db)
    conf_dict = s.elo_config if s.elo_config else {}
    if isinstance(conf_dict, str):
        try: conf_dict = json.loads(conf_dict)
        except: conf_dict = {}
            
    elo_conf = EloConfig(
        goal_diff_bonus_percent=conf_dict.get('goal_diff_bonus_percent', 0),
        underdog_bonus_percent=conf_dict.get('underdog_bonus_percent', 0),
        underdog_loss_divider=conf_dict.get('underdog_loss_divider', 1.0),
        match_type_1v1_mult=conf_dict.get('match_type_1v1_mult', 1.0),
        match_type_2v2_mult=conf_dict.get('match_type_2v2_mult', 1.0),
        match_type_2v1_mult=conf_dict.get('match_type_2v1_mult', 1.0)
    )
    return GameSettings(kFactor=s.k_factor, adminPassword=s.admin_password, eloConfig=elo_conf)

@app.put("/api/settings")
def update_settings(settings: GameSettings, db: Session = Depends(database.get_db)):
    s = get_settings(db)
    s.k_factor = settings.kFactor
    if settings.adminPassword: s.admin_password = settings.adminPassword
    if settings.eloConfig: s.elo_config = settings.eloConfig.dict()
    db.commit()
    return {"ok": True}

@app.get("/api/players", response_model=List[PlayerResponse])
def get_players(db: Session = Depends(database.get_db)):
    return db.query(models.Player).all()

@app.post("/api/players", response_model=PlayerResponse)
def create_player(player: PlayerCreate, db: Session = Depends(database.get_db)):
    now = datetime.now().isoformat()
    db_player = models.Player(
        id=str(uuid.uuid4()), name=player.name, created_at=now, updated_at=now,
        avatar_url="", elo_rating=1500, matches_played=0, matches_won=0,
        matches_lost=0, goals_scored=0, goals_conceded=0, current_streak=0, best_streak=0
    )
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

@app.delete("/api/players/{player_id}")
def delete_player(player_id: str, db: Session = Depends(database.get_db)):
    db.query(models.Player).filter(models.Player.id == player_id).delete()
    db.commit()
    return {"ok": True}

@app.get("/api/matches", response_model=List[MatchResponse])
def get_matches(db: Session = Depends(database.get_db)):
    return db.query(models.Match).order_by(models.Match.created_at.desc()).all()

@app.post("/api/matches")
def create_match(payload: NewMatchPayload, db: Session = Depends(database.get_db)):
    match_type = payload.matchType
    team1_ids, team2_ids = payload.team1Ids, payload.team2Ids
    score1, score2 = payload.score1, payload.score2

    if score1 == score2: raise HTTPException(400, "Draws are not allowed")

    players = db.query(models.Player).filter(models.Player.id.in_(team1_ids + team2_ids)).all()
    players_map = {p.id: p for p in players}
    
    settings = get_settings(db)
    conf = settings.elo_config if settings.elo_config else {}
    if isinstance(conf, str):
        try: conf = json.loads(conf)
        except: conf = {}

    k_factor = settings.k_factor
    gd_bonus = conf.get('goal_diff_bonus_percent', 0) / 100.0
    ud_bonus = conf.get('underdog_bonus_percent', 0) / 100.0
    ud_loss_div = max(1.0, conf.get('underdog_loss_divider', 1.0))
    match_mult = conf.get(f'match_type_{match_type}_mult', 1.0)

    winner_ids, loser_ids = (team1_ids, team2_ids) if score1 > score2 else (team2_ids, team1_ids)
    score_diff = abs(score1 - score2)

    def get_avg(ids): return sum(players_map[uid].elo_rating for uid in ids) / len(ids)
    winner_avg, loser_avg = get_avg(winner_ids), get_avg(loser_ids)
    
    expected = 1 / (1 + 10 ** ((loser_avg - winner_avg) / 400))
    base_change = k_factor * (1 - expected)
    if score_diff > 1: base_change *= (1 + (score_diff - 1) * gd_bonus)
    base_change *= match_mult

    points_winner = base_change * (1 + ud_bonus if winner_avg < loser_avg else 1)
    points_loser = base_change / (ud_loss_div if loser_avg < winner_avg else 1)
    
    now = datetime.now().isoformat()
    for pid in (team1_ids + team2_ids):
        p = players_map[pid]
        is_winner = pid in winner_ids
        p.elo_rating = max(0, p.elo_rating + (points_winner if is_winner else -points_loser))
        p.matches_played += 1
        p.matches_won += (1 if is_winner else 0)
        p.matches_lost += (0 if is_winner else 1)
        p.goals_scored += score1 if pid in team1_ids else score2
        p.goals_conceded += score2 if pid in team1_ids else score1
        p.current_streak = (p.current_streak + 1 if p.current_streak >= 0 else 1) if is_winner else (p.current_streak - 1 if p.current_streak <= 0 else -1)
        if is_winner: p.best_streak = max(p.best_streak, p.current_streak)
        p.updated_at = now

    match = models.Match(
        id=str(uuid.uuid4()), match_type=match_type, team1_ids=team1_ids, team2_ids=team2_ids,
        score1=score1, score2=score2, winner_ids=winner_ids, elo_change=points_winner,
        played_at=now, created_at=now
    )
    db.add(match)
    db.commit()
    return {"ok": True}

@app.get("/api/ranks", response_model=List[RankResponse])
def get_ranks(db: Session = Depends(database.get_db)):
    return db.query(models.Rank).order_by(models.Rank.min_elo.asc()).all()

@app.post("/api/ranks")
def create_rank(rank: RankCreate, db: Session = Depends(database.get_db)):
    new_rank = models.Rank(id=str(uuid.uuid4()), name=rank.name, min_elo=rank.min_elo, color=rank.color, order=rank.min_elo)
    db.add(new_rank)
    db.commit()
    return {"ok": True}

@app.delete("/api/ranks/{rank_id}")
def delete_rank(rank_id: str, db: Session = Depends(database.get_db)):
    db.query(models.Rank).filter(models.Rank.id == rank_id).delete()
    db.commit()
    return {"ok": True}

@app.get("/api/seasons", response_model=List[SeasonArchiveResponse])
def get_seasons(db: Session = Depends(database.get_db)):
    return db.query(models.SeasonArchive).order_by(models.SeasonArchive.archived_at.desc()).all()

@app.post("/api/seasons/archive")
def archive_season(payload: Dict[str, str], db: Session = Depends(database.get_db)):
    players, matches = db.query(models.Player).all(), db.query(models.Match).all()
    p_snap = [{c.name: getattr(p, c.name) for c in p.__table__.columns} for p in players]
    m_snap = [{c.name: getattr(m, c.name) for c in m.__table__.columns} for m in matches]
    now = datetime.now().isoformat()
    archive = models.SeasonArchive(
        id=str(uuid.uuid4()), name=payload.get("name", "Archive"), archived_at=now,
        player_snapshot=p_snap, match_snapshot=m_snap
    )
    db.add(archive)
    for p in players:
        p.elo_rating, p.matches_played, p.matches_won, p.matches_lost = 1500, 0, 0, 0
        p.goals_scored, p.goals_conceded, p.current_streak, p.best_streak = 0, 0, 0, 0
        p.updated_at = now
    db.query(models.Match).delete()
    db.commit()
    return {"ok": True}

@app.get("/api/seasons/{archive_id}/players")
def get_archived_players(archive_id: str, db: Session = Depends(database.get_db)):
    season = db.query(models.SeasonArchive).filter(models.SeasonArchive.id == archive_id).first()
    if not season: raise HTTPException(404, "Season not found")
    return season.player_snapshot

@app.get("/api/seasons/{archive_id}/matches")
def get_archived_matches(archive_id: str, db: Session = Depends(database.get_db)):
    season = db.query(models.SeasonArchive).filter(models.SeasonArchive.id == archive_id).first()
    if not season: raise HTTPException(404, "Season not found")
    return season.match_snapshot

# Static Files
frontend_dist_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    if full_path.startswith("api/"): raise HTTPException(404, "API route not found")
    file_path = os.path.join(frontend_dist_path, full_path)
    if os.path.isfile(file_path): return FileResponse(file_path)
    index_file = os.path.join(frontend_dist_path, "index.html")
    if os.path.exists(index_file): return FileResponse(index_file)
    return {"error": "Frontend not found"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
