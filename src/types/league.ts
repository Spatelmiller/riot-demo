/**
 * League API types
 */

export interface MiniSeriesDto {
  losses: number;
  progress: string;
  target: number;
  wins: number;
}

export interface LeagueEntryDto {
  leagueId: string;
  puuid: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries?: MiniSeriesDto;
}
