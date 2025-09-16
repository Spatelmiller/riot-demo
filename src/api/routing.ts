/**
 * API Routing utilities
 * 
 * Handles platform and regional routing for Riot API endpoints
 */

import type { Platform, Region } from '../types/index.js';

export class ApiRouting {
  /**
   * Get region from platform
   * @param platform - Platform identifier
   * @returns Corresponding region
   */
  static getRegionFromPlatform(platform: Platform): Region {
    const platformToRegion: Record<Platform, Region> = {
      'na1': 'americas',
      'br1': 'americas',
      'la1': 'americas',
      'la2': 'americas',
      'euw1': 'europe',
      'eun1': 'europe',
      'tr1': 'europe',
      'ru': 'europe',
      'kr': 'asia',
      'jp1': 'asia',
      'oc1': 'asia'
    };

    return platformToRegion[platform];
  }

  /**
   * Get regional API base URL
   * @param region - Region identifier
   * @returns Base URL for regional endpoints
   */
  static getRegionalBaseUrl(region: Region): string {
    const regionUrls: Record<Region, string> = {
      'americas': 'https://americas.api.riotgames.com',
      'europe': 'https://europe.api.riotgames.com',
      'asia': 'https://asia.api.riotgames.com',
      'sea': 'https://sea.api.riotgames.com'
    };

    return regionUrls[region];
  }

  /**
   * Get platform API base URL
   * @param platform - Platform identifier
   * @returns Base URL for platform endpoints
   */
  static getPlatformBaseUrl(platform: Platform): string {
    const platformUrls: Record<Platform, string> = {
      'na1': 'https://na1.api.riotgames.com',
      'br1': 'https://br1.api.riotgames.com',
      'la1': 'https://la1.api.riotgames.com',
      'la2': 'https://la2.api.riotgames.com',
      'euw1': 'https://euw1.api.riotgames.com',
      'eun1': 'https://eun1.api.riotgames.com',
      'tr1': 'https://tr1.api.riotgames.com',
      'ru': 'https://ru.api.riotgames.com',
      'kr': 'https://kr.api.riotgames.com',
      'jp1': 'https://jp1.api.riotgames.com',
      'oc1': 'https://oc1.api.riotgames.com'
    };

    return platformUrls[platform];
  }

  /**
   * Get default region for Account V1 API
   * @returns Default region (americas)
   */
  static getDefaultRegion(): Region {
    return 'americas';
  }
}
