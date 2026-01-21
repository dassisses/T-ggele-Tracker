
# Ranks Endpoints
@app.get("/api/ranks", response_model=List[RankResponse])
def get_ranks(db: Session = Depends(database.get_db)):
    return db.query(models.Rank).order_by(models.Rank.min_elo.asc()).all()

@app.post("/api/ranks")
def create_rank(rank: RankCreate, db: Session = Depends(database.get_db)):
    new_rank = models.Rank(
        id=str(uuid.uuid4()),
        name=rank.name,
        min_elo=rank.min_elo,
        color=rank.color,
        order=rank.min_elo # Use min_elo as order for simplicity
    )
    db.add(new_rank)
    db.commit()
    return {"ok": True}

@app.delete("/api/ranks/{rank_id}")
def delete_rank(rank_id: str, db: Session = Depends(database.get_db)):
    db.query(models.Rank).filter(models.Rank.id == rank_id).delete()
    db.commit()
    return {"ok": True}

# Season Archive Endpoints
@app.get("/api/seasons", response_model=List[SeasonArchiveResponse])
def get_seasons(db: Session = Depends(database.get_db)):
    return db.query(models.SeasonArchive).order_by(models.SeasonArchive.archived_at.desc()).all()

class ArchiveSeasonPayload(BaseModel):
    name: str

@app.post("/api/seasons/archive")
def archive_season(payload: ArchiveSeasonPayload, db: Session = Depends(database.get_db)):
    # 1. Fetch current state
    players = db.query(models.Player).all()
    matches = db.query(models.Match).all()
    
    # Convert to list of dicts for JSON storage
    players_data = []
    for p in players:
        p_dict = {c.name: getattr(p, c.name) for c in p.__table__.columns}
        players_data.append(p_dict)
        
    matches_data = []
    for m in matches:
        m_dict = {c.name: getattr(m, c.name) for c in m.__table__.columns}
        matches_data.append(m_dict)
        
    # 2. Create Archive
    now = datetime.now().isoformat()
    archive = models.SeasonArchive(
        id=str(uuid.uuid4()),
        name=payload.name,
        archived_at=now,
        player_snapshot=players_data,
        match_snapshot=matches_data
    )
    db.add(archive)
    
    # 3. Reset Current State
    # Reset players stats
    for p in players:
        p.elo_rating = 1500
        p.matches_played = 0
        p.matches_won = 0
        p.matches_lost = 0
        p.goals_scored = 0
        p.goals_conceded = 0
        p.current_streak = 0
        p.best_streak = 0
        p.updated_at = now
        
    # Delete all matches
    db.query(models.Match).delete()
    
    db.commit()
    return {"ok": True}

@app.get("/api/seasons/{archive_id}/players")
def get_archived_players(archive_id: str, db: Session = Depends(database.get_db)):
    season = db.query(models.SeasonArchive).filter(models.SeasonArchive.id == archive_id).first()
    if not season:
        raise HTTPException(404, "Season not found")
    return season.player_snapshot

@app.get("/api/seasons/{archive_id}/matches")
def get_archived_matches(archive_id: str, db: Session = Depends(database.get_db)):
    season = db.query(models.SeasonArchive).filter(models.SeasonArchive.id == archive_id).first()
    if not season:
        raise HTTPException(404, "Season not found")
    return season.match_snapshot
