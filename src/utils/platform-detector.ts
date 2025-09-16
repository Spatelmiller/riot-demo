/**
 * Platform Detection
 * 
 * Utilities for detecting the correct platform based on region or other factors
 */

import type { Platform, Region } from '../types/index.js';

export class PlatformDetector {
  /**
   * Get a default platform from region
   * @param region - Region identifier
   * @returns Default platform for the region
   */
  static getPlatformFromRegion(region: Region): Platform {
    const regionToPlatform: Record<Region, Platform> = {
      'americas': 'na1',  // Default to na1 for Americas
      'europe': 'euw1',   // Default to euw1 for Europe
      'asia': 'kr',       // Default to kr for Asia
      'sea': 'oc1'        // Default to oc1 for SEA
    };

    return regionToPlatform[region];
  }

  /**
   * Get platform from Riot ID tag line (if it contains region info)
   * @param riotId - Riot ID string
   * @returns Platform or null if not detectable
   */
  static getPlatformFromRiotId(riotId: string): Platform | null {
    const tagLine = riotId.split('#')[1]?.toLowerCase();
    
    if (!tagLine) return null;

    // Common tag line patterns that indicate region
    const tagToPlatform: Record<string, Platform> = {
      'na1': 'na1',
      'na': 'na1',
      'euw1': 'euw1',
      'euw': 'euw1',
      'eun1': 'eun1',
      'eun': 'eun1',
      'kr': 'kr',
      'br1': 'br1',
      'br': 'br1',
      'la1': 'la1',
      'la2': 'la2',
      'oc1': 'oc1',
      'oc': 'oc1',
      'tr1': 'tr1',
      'tr': 'tr1',
      'ru': 'ru',
      'jp1': 'jp1',
      'jp': 'jp1'
    };

    return tagToPlatform[tagLine] || null;
  }

  /**
   * Get the best platform for a Riot ID and region
   * @param riotId - Riot ID string
   * @param region - Region identifier
   * @returns Best platform to use
   */
  static getBestPlatform(riotId: string, region: Region): Platform {
    // Try to detect from Riot ID first
    const platformFromId = this.getPlatformFromRiotId(riotId);
    if (platformFromId) {
      return platformFromId;
    }

    // Fall back to region-based detection
    return this.getPlatformFromRegion(region);
  }
}
