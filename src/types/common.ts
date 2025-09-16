

export type Platform = 'na1' | 'euw1' | 'eun1' | 'kr' | 'br1' | 'la1' | 'la2' | 'oc1' | 'tr1' | 'ru' | 'jp1';
export type Region = 'americas' | 'europe' | 'asia' | 'sea';

export interface RiotId {
  gameName: string;
  tagLine: string;
}

export interface ApiError {
  status: {
    message: string;
    status_code: number;
  };
}

export interface RateLimitInfo {
  retryAfter: number;
  limitType: string;
}
