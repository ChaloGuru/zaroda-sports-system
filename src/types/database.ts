export type CompetitionLevel = 'zone' | 'subcounty' | 'county' | 'region' | 'national';
export type GameCategory = 'ball_games' | 'athletics' | 'music' | 'other';
export type Gender = 'boys' | 'girls';
export type SchoolLevel = 'primary' | 'junior_secondary';

export interface School {
  id: string;
  name: string;
  zone: string;
  subcounty: string;
  county: string;
  region: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  name: string;
  category: GameCategory;
  level: CompetitionLevel;
  gender: Gender;
  school_level: SchoolLevel;
  description?: string;
  is_timed: boolean;
  max_qualifiers: number;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  school_id: string;
  game_id: string;
  gender: Gender;
  time_taken?: number;
  position?: number;
  score?: number;
  is_qualified: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  school?: School;
  game?: Game;
}

export interface Admin {
  id: string;
  username: string;
  email?: string;
  created_at: string;
}

export const CATEGORY_LABELS: Record<GameCategory, string> = {
  ball_games: 'Ball Games',
  athletics: 'Athletics',
  music: 'Music',
  other: 'Other Games',
};

export const LEVEL_LABELS: Record<CompetitionLevel, string> = {
  zone: 'Zone',
  subcounty: 'Sub-County',
  county: 'County',
  region: 'Region',
  national: 'National',
};

export const GENDER_LABELS: Record<Gender, string> = {
  boys: 'Boys',
  girls: 'Girls',
};

export const SCHOOL_LEVEL_LABELS: Record<SchoolLevel, string> = {
  primary: 'Primary',
  junior_secondary: 'Junior Secondary',
};

export const CATEGORY_ICONS: Record<GameCategory, string> = {
  ball_games: '⚽',
  athletics: '🏃',
  music: '🎵',
  other: '🎯',
};

export const TEAM_NAME_BY_LEVEL: Record<CompetitionLevel, string> = {
  zone: 'School',
  subcounty: 'Zone',
  county: 'Sub-County',
  region: 'County',
  national: 'Region',
};
