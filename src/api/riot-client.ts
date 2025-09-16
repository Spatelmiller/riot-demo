/** 
 * Main client class for making requests to Riot Games API
 * Handles authentication, rate limiting, and error management
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type { AccountDto, SummonerDto, LeagueEntryDto } from '../types/index.js';
import { ApiRouting } from './routing.js';
import { RiotApiError, RateLimitError, PlayerNotFoundError, InvalidApiKeyError } from './errors.js';

export class RiotClient {
  private _client: AxiosInstance;
  private _apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    this._apiKey = apiKey;
    this._client = axios.create({
      headers: {
        'X-Riot-Token': apiKey,
      },
      timeout: 10000, // 10 second timeout
    });

    // Add response interceptor for error handling
    this._client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => this._handleApiError(error)
    );
  }

  /**
   * Get account information by Riot ID using Account V1 API
   * @param gameName - Player's game name
   * @param tagLine - Player's tag line
   * @param region - Region to query (defaults to americas)
   * @returns Account information including PUUID
   */
  async getAccountByRiotId(gameName: string, tagLine: string, region: string = 'americas'): Promise<AccountDto> {
    try {
      const baseUrl = ApiRouting.getRegionalBaseUrl(region as any);
      const url = `${baseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
      
      console.log('🌐 Riot API Request:');
      console.log('📤 URL:', url);
      console.log('📤 Headers:', { 'X-Riot-Token': '***hidden***' });
      
      const response = await this._client.get<AccountDto>(url);
      
      console.log('📥 Riot API Response:');
      console.log('📊 Status:', response.status);
      console.log('📊 Data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.log('❌ Riot API Error:', error);
      if (error instanceof RiotApiError) {
        throw error;
      }
      throw new RiotApiError('Failed to fetch account information', 500);
    }
  }

  /**
   * Get summoner information by PUUID using Summoner-V4 API
   * @param puuid - Player's PUUID
   * @param platform - Platform to query (e.g., na1, euw1, kr)
   * @returns Summoner information including level and profile icon
   */
  async getSummonerByPuuid(puuid: string, platform: string): Promise<SummonerDto> {
    try {
      const baseUrl = ApiRouting.getPlatformBaseUrl(platform as any);
      const url = `${baseUrl}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
      
      console.log('🌐 Summoner-V4 Request:');
      console.log('📤 URL:', url);
      console.log('📤 Headers:', { 'X-Riot-Token': '***hidden***' });
      
      const response = await this._client.get<SummonerDto>(url);
      
      console.log('📥 Summoner-V4 Response:');
      console.log('📊 Status:', response.status);
      console.log('📊 Data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.log('❌ Summoner-V4 Error:', error);
      if (error instanceof RiotApiError) {
        throw error;
      }
      throw new RiotApiError('Failed to fetch summoner information', 500);
    }
  }

  /**
   * Get league entries by PUUID using League-V4 API
   * @param encryptedPUUID - Encrypted PUUID
   * @param platform - Platform to query (e.g., na1, euw1, kr)
   * @returns Array of league entries for ranked stats
   */
  async getLeagueEntriesbyEncryptedPUUID(encryptedPUUID: string, platform: string): Promise<LeagueEntryDto[]> {
    try {
      const baseUrl = ApiRouting.getPlatformBaseUrl(platform as any);
      const url = `${baseUrl}/lol/league/v4/entries/by-puuid/${encryptedPUUID}`;
      
      console.log('🌐 League-V4 Request:');
      console.log('📤 URL:', url);
      console.log('📤 Headers:', { 'X-Riot-Token': '***hidden***' });
      
      const response = await this._client.get<LeagueEntryDto[]>(url);
      
      console.log('📥 League-V4 Response:');
      console.log('📊 Status:', response.status);
      console.log('📊 Data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.log('❌ League-V4 Error:', error);
      if (error instanceof RiotApiError) {
        throw error;
      }
      throw new RiotApiError('Failed to fetch league entries', 500);
    }
  }

  /**
   * Handle API errors and convert to custom error types
   * @param error - Axios error
   * @throws Custom Riot API error
   */
  private _handleApiError(error: AxiosError): never {
    const status = error.response?.status || 500;
    const responseData = error.response?.data as any;
    const message = responseData?.status?.message || error.message;

    // Log detailed error information for debugging
    console.log('🚨 Riot API Error Details:');
    console.log('📊 Status:', status);
    console.log('📊 Response Headers:', error.response?.headers);
    console.log('📊 Response Data:', JSON.stringify(responseData, null, 2));
    console.log('📊 Request URL:', error.config?.url);
    console.log('📊 Request Method:', error.config?.method);

    switch (status) {
      case 400:
        throw new RiotApiError('Bad request: Invalid parameters', 400);
      case 401:
        throw new InvalidApiKeyError();
      case 403:
        console.log('🔒 403 Forbidden - API Key Permission Issue');
        throw new RiotApiError('Forbidden: API key does not have permission', 403);
      case 404:
        throw new PlayerNotFoundError('Player not found');
      case 429:
        const retryAfter = error.response?.headers['retry-after'];
        const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
        throw new RateLimitError(retryAfterSeconds);
      case 500:
        throw new RiotApiError('Internal server error', 500);
      case 502:
        throw new RiotApiError('Bad gateway', 502);
      case 503:
        throw new RiotApiError('Service unavailable', 503);
      case 504:
        throw new RiotApiError('Gateway timeout', 504);
      default:
        throw new RiotApiError(`API request failed: ${message}`, status);
    }
  }
}
