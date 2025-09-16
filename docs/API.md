# API Documentation

## Riot Games API Integration

This document describes how the LoL Stats Checker integrates with the Riot Games API.

### Endpoints Used

1. **Account-V1** - Get PUUID from Riot ID
2. **Summoner-V4** - Get summoner profile information  
3. **League-V4** - Get ranked statistics

### Authentication

All requests require a valid Riot API key passed via the `X-Riot-Token` header.

### Rate Limiting

The application handles rate limiting with exponential backoff and retry logic.

### Error Handling

Comprehensive error handling for:
- Invalid API keys
- Player not found
- Rate limit exceeded
- Network errors
