import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Player {
  id: string;
  name: string;
  email: string;
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

export interface Team {
  id: string;
  name: string;
  player1_id: string;
  player2_id: string;
  elo_rating: number;
  matches_played: number;
  matches_won: number;
  created_at: string;
}

export interface Match {
  id: string;
  match_type: 'singles' | 'teams';
  player1_id?: string;
  player2_id?: string;
  team1_id?: string;
  team2_id?: string;
  score1: number;
  score2: number;
  winner_id?: string;
  winner_team_id?: string;
  elo_change: number;
  played_at: string;
  created_at: string;
}
