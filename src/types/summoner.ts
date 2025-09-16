/**
 * Summoner API types
 */

export interface SummonerDto {
  id?: string;  
  accountId?: string;  
  puuid: string;
  name?: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}
