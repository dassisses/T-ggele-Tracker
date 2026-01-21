from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import models, database
from datetime import datetime
import uuid
from pydantic import BaseModel
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)

# Pydantic Models for Validation
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
        orm_mode = True

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
        orm_mode = True

class GameSettings(BaseModel):
    kFactor: float

# Logic helpers
def calculate_elo_change(winner_rating, loser_rating, k_factor=32):
    expected_winner = 1 / (1 + 10 ** ((loser_rating - winner_rating) / 400))
    return round(k_factor * (1 - expected_winner))

def get_settings(db: Session):
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

# Endpoints

@app.get("/api/settings", response_model=GameSettings)
def read_settings(db: Session = Depends(database.get_db)):
    s = get_settings(db)
    return GameSettings(kFactor=s.k_factor)

@app.put("/api/settings")
def update_settings(settings: GameSettings, db: Session = Depends(database.get_db)):
    s = get_settings(db)
    s.k_factor = settings.kFactor
    db.commit()
    return {"ok": True}

@app.get("/api/players", response_model=List[PlayerResponse])
def get_players(db: Session = Depends(database.get_db)):
    return db.query(models.Player).all()

@app.post("/api/players", response_model=PlayerResponse)
def create_player(player: PlayerCreate, db: Session = Depends(database.get_db)):
    now = datetime.now().isoformat()
    db_player = models.Player(
        id=str(uuid.uuid4()),
        name=player.name,
        created_at=now,
        updated_at=now,
        avatar_url="",
        elo_rating=1500,
        matches_played=0,
        matches_won=0,
        matches_lost=0,
        goals_scored=0,
        goals_conceded=0,
        current_streak=0,
        best_streak=0
    )
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

@app.delete("/api/players/{player_id}")
def delete_player(player_id: str, db: Session = Depends(database.get_db)):
    db_player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if db_player:
        db.delete(db_player)
        db.commit()
    return {"ok": True}

@app.get("/api/matches", response_model=List[MatchResponse])
def get_matches(db: Session = Depends(database.get_db)):
    return db.query(models.Match).order_by(models.Match.created_at.desc()).all()

@app.post("/api/matches")
def create_match(payload: NewMatchPayload, db: Session = Depends(database.get_db)):
    match_type = payload.matchType
    team1_ids = payload.team1Ids
    team2_ids = payload.team2Ids
    score1 = payload.score1
    score2 = payload.score2

    # Basic validations
    size_check = {
        '1v1': [1, 1],
        '2v2': [2, 2],
        '2v1': [2, 1],
    }
    
    if match_type not in size_check:
        raise HTTPException(400, "Invalid match type")
        
    req1, req2 = size_check[match_type]
    if len(team1_ids) != req1 or len(team2_ids) != req2:
        raise HTTPException(400, "Incorrect team sizes")

    all_ids = team1_ids + team2_ids
    if len(set(all_ids)) != len(all_ids):
        raise HTTPException(400, "Duplicate players in match")
        
    if score1 == score2:
        raise HTTPException(400, "Draws are not allowed")

    # Fetch players
    players = db.query(models.Player).filter(models.Player.id.in_(all_ids)).all()
    players_map = {p.id: p for p in players}
    
    if len(players) != len(all_ids):
        raise HTTPException(400, "One or more players not found")

    settings = get_settings(db)
    k_factor = settings.k_factor

    # Determine winner
    winner_ids = team1_ids if score1 > score2 else team2_ids
    loser_ids = team2_ids if score1 > score2 else team1_ids

    # Calculate Elo
    def get_avg_elo(ids):
        return sum(players_map[uid].elo_rating for uid in ids) / len(ids)

    winner_avg = get_avg_elo(winner_ids)
    loser_avg = get_avg_elo(loser_ids)
    
    base_elo_change = calculate_elo_change(winner_avg, loser_avg, k_factor)
    
    now = datetime.now().isoformat()
    
    # Analyze structure for multipliers (2v1 logic)
    single_team_id = team1_ids[0] if len(team1_ids) == 1 else (team2_ids[0] if len(team2_ids) == 1 else None)
    pair_ids = team1_ids if len(team1_ids) == 2 else (team2_ids if len(team2_ids) == 2 else [])
    single_wins = (single_team_id in winner_ids) if single_team_id else False

    def multiplier_for_player(pid, is_winner_in_match):
        if match_type != '2v1':
            return 1
        is_single = (single_team_id == pid)
        is_pair_member = (pid in pair_ids)
        
        if not is_single and not is_pair_member:
            return 1
            
        if single_wins:
            if is_single and is_winner_in_match: return 2
            if is_pair_member and not is_winner_in_match: return 2
        else:
            # Pair wins
            if is_pair_member and is_winner_in_match: return 0.5
            if is_single and not is_winner_in_match: return 0.5
        return 1

    # Update players
    for pid in all_ids:
        p = players_map[pid]
        is_team1 = pid in team1_ids
        is_winner = pid in winner_ids
        
        my_goals = score1 if is_team1 else score2
        opp_goals = score2 if is_team1 else score1
        
        # Streak
        if is_winner:
            new_streak = p.current_streak + 1 if p.current_streak >= 0 else 1
        else:
            new_streak = p.current_streak - 1 if p.current_streak <= 0 else -1
            
        mult = multiplier_for_player(pid, is_winner)
        delta = (1 if is_winner else -1) * base_elo_change * mult
        new_rating = max(0, p.elo_rating + delta)
        
        p.elo_rating = new_rating
        p.matches_played += 1
        p.matches_won += (1 if is_winner else 0)
        p.matches_lost += (0 if is_winner else 1)
        p.goals_scored += my_goals
        p.goals_conceded += opp_goals
        p.current_streak = new_streak
        p.best_streak = max(p.best_streak, new_streak) if is_winner else p.best_streak
        p.updated_at = now

    new_match = models.Match(
        id=str(uuid.uuid4()),
        match_type=match_type,
        team1_ids=team1_ids,
        team2_ids=team2_ids,
        score1=score1,
        score2=score2,
        winner_ids=winner_ids,
        elo_change=base_elo_change,
        played_at=now,
        created_at=now
    )
    db.add(new_match)
    db.commit()
    
    return {"ok": True}

# Static Files & SPA serving
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(BASE_DIR, "frontend", "dist")

if os.path.exists(DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

    @app.get("/{catchall:path}")
    def serve_react_app(catchall: str):
        # Allow API calls to pass through if they weren't matched above
        if catchall.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Check if file exists (favicon, etc)
        file_path = os.path.join(DIST_DIR, catchall)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Fallback to index.html for SPA
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
