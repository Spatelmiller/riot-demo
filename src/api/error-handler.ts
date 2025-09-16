
import type { Response } from 'express';
import { RiotApiError, RateLimitError, PlayerNotFoundError, InvalidApiKeyError } from './errors.js';

/**
 * Convert custom error types to HTTP responses
 * @param error - Custom error instance
 * @param res - Express response object
 */
export function handleApiError(error: any, res: Response): void {
  console.error('API Error:', error);

  if (error instanceof InvalidApiKeyError) {
    res.status(401).json({
      error: 'Invalid API key',
      message: 'Please check your RIOT_API_KEY environment variable'
    });
  } else if (error instanceof PlayerNotFoundError) {
    res.status(404).json({
      error: 'Player not found',
      message: error.message
    });
  } else if (error instanceof RateLimitError) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Please try again in ${error.retryAfter} seconds`,
      retryAfter: error.retryAfter
    });
  } else if (error instanceof RiotApiError) {
    res.status(error.statusCode).json({
      error: 'Riot API error',
      message: error.message,
      statusCode: error.statusCode
    });
  } else {
    // Generic error for unexpected errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}
