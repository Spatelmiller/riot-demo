

export type Platform = 'na1' | 'br1' | 'la1' | 'la2' | 'euw1' | 'eun1' | 'me1' | 'tr1' | 'ru' | 'jp1' | 'kr' | 'oc1' | 'sg2' | 'tw2' | 'vn2';
export type Region = 'americas' | 'europe' | 'asia' 

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
