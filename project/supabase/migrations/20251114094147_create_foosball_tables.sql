/*
  # Foosball Tracker Database Schema

  ## Overview
  Complete database schema for tracking foosball matches, players, teams, and rankings.
  Implements an Elo-based ranking system with comprehensive statistics tracking.

  ## New Tables

  ### 1. `players`
  Core player information and statistics
  - `id` (uuid, primary key) - Unique player identifier
  - `name` (text) - Player display name
  - `email` (text, unique) - Player email for login/identification
  - `avatar_url` (text) - Profile picture URL
  - `elo_rating` (integer) - Current Elo rating (starts at 1500)
  - `matches_played` (integer) - Total matches count
  - `matches_won` (integer) - Total wins
  - `matches_lost` (integer) - Total losses
  - `goals_scored` (integer) - Total goals scored
  - `goals_conceded` (integer) - Total goals conceded
  - `current_streak` (integer) - Current win/loss streak (positive = wins, negative = losses)
  - `best_streak` (integer) - Best winning streak
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `teams`
  Team information for team-based matches
  - `id` (uuid, primary key) - Unique team identifier
  - `name` (text) - Team name
  - `player1_id` (uuid) - First team member reference
  - `player2_id` (uuid) - Second team member reference
  - `elo_rating` (integer) - Team Elo rating
  - `matches_played` (integer) - Total team matches
  - `matches_won` (integer) - Total team wins
  - `created_at` (timestamptz) - Team creation timestamp

  ### 3. `matches`
  Individual match records
  - `id` (uuid, primary key) - Unique match identifier
  - `match_type` (text) - Type: 'singles' or 'teams'
  - `player1_id` (uuid, nullable) - Singles: player 1 or team match player
  - `player2_id` (uuid, nullable) - Singles: player 2 or team match player
  - `team1_id` (uuid, nullable) - Teams: team 1 reference
  - `team2_id` (uuid, nullable) - Teams: team 2 reference
  - `score1` (integer) - Goals scored by player1/team1
  - `score2` (integer) - Goals scored by player2/team2
  - `winner_id` (uuid, nullable) - Winning player reference
  - `winner_team_id` (uuid, nullable) - Winning team reference
  - `elo_change` (integer) - Elo points exchanged in this match
  - `played_at` (timestamptz) - When the match was played
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Public read access for all users (allowing anonymous viewing)
  - Authenticated users can insert/update records

  ## Indexes
  - Players indexed by elo_rating for leaderboard queries
  - Matches indexed by played_at for chronological queries
  - Teams indexed by elo_rating for team leaderboards

  ## Notes
  - Elo rating system: starting rating is 1500
  - K-factor for Elo calculations: 32 (standard value)
  - Streaks: positive numbers = win streak, negative = loss streak
  - Match type determines which ID fields are used (player vs team)
*/

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  elo_rating integer DEFAULT 1500 NOT NULL,
  matches_played integer DEFAULT 0 NOT NULL,
  matches_won integer DEFAULT 0 NOT NULL,
  matches_lost integer DEFAULT 0 NOT NULL,
  goals_scored integer DEFAULT 0 NOT NULL,
  goals_conceded integer DEFAULT 0 NOT NULL,
  current_streak integer DEFAULT 0 NOT NULL,
  best_streak integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  player1_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  player2_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  elo_rating integer DEFAULT 1500 NOT NULL,
  matches_played integer DEFAULT 0 NOT NULL,
  matches_won integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT different_players CHECK (player1_id != player2_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_type text NOT NULL CHECK (match_type IN ('singles', 'teams')),
  player1_id uuid REFERENCES players(id) ON DELETE SET NULL,
  player2_id uuid REFERENCES players(id) ON DELETE SET NULL,
  team1_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  team2_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  score1 integer NOT NULL CHECK (score1 >= 0),
  score2 integer NOT NULL CHECK (score2 >= 0),
  winner_id uuid REFERENCES players(id) ON DELETE SET NULL,
  winner_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  elo_change integer DEFAULT 0 NOT NULL,
  played_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_singles_match CHECK (
    match_type != 'singles' OR (player1_id IS NOT NULL AND player2_id IS NOT NULL AND team1_id IS NULL AND team2_id IS NULL)
  ),
  CONSTRAINT valid_teams_match CHECK (
    match_type != 'teams' OR (team1_id IS NOT NULL AND team2_id IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_elo_rating ON players(elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_teams_elo_rating ON teams(elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_player1 ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2 ON matches(player2_id);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access, authenticated users can insert/update
CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert players"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update players"
  ON players FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view teams"
  ON teams FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view matches"
  ON matches FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (true);