export interface Player {
  id: string;
  name: string;
  avatar_url?: string;
  elo_rating: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  goals_scored: number;
  goals_conceded: number;
  current_streak: number;
  best_streak: number;
  created_at: string;
  updated_at: string;
}

export type MatchType = '1v1' | '2v2' | '2v1';

export interface Match {
  id: string;
  match_type: MatchType;
  team1_ids: string[];
  team2_ids: string[];
  score1: number;
  score2: number;
  winner_ids: string[];
  elo_change: number;
  played_at: string;
  created_at: string;
}


export interface NewMatchPayload {
  matchType: MatchType;
  team1Ids: string[];
  team2Ids: string[];
  score1: number;
  score2: number;
}

export interface Rank {
  id: string;
  name: string;
  min_elo: number;
  color: string;
  order: number;
}

export interface SeasonArchive {
  id: string;
  name: string;
  archived_at: string;
}

export interface EloConfig {
  goal_diff_bonus_percent: number;
  underdog_bonus_percent: number;
  underdog_loss_divider: number;
  match_type_1v1_mult: number;
  match_type_2v2_mult: number;
  match_type_2v1_mult: number;
}

export interface GameSettings {
  kFactor: number;
  adminPassword?: string;
  eloConfig?: EloConfig;
}

