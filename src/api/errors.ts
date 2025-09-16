
export class RiotApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RiotApiError';
  }
}

export class RateLimitError extends RiotApiError {
  constructor(retryAfter: number) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds`, 429, retryAfter);
    this.name = 'RateLimitError';
  }
}

export class PlayerNotFoundError extends RiotApiError {
  constructor(riotId: string) {
    super(`Player not found: ${riotId}`, 404);
    this.name = 'PlayerNotFoundError';
  }
}

export class InvalidApiKeyError extends RiotApiError {
  constructor() {
    super('Invalid API key', 401);
    this.name = 'InvalidApiKeyError';
  }
}
