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

export interface Match {
  id: string;
  match_type: 'singles' | 'teams';
  player1_id?: string;
  player2_id?: string;
  score1: number;
  score2: number;
  winner_id?: string;
  elo_change: number;
  played_at: string;
  created_at: string;
}

export interface NewMatchPayload {
  player1Id: string;
  player2Id: string;
  score1: number;
  score2: number;
}
