/**
 * Parallel Platform Queries
 * 
 * Utilities for querying multiple platforms in parallel for summoner and league data
 */

import type { Platform, Region } from '../types/index.js';
import { getPlatformsForRegion } from './platform-mapping.js';
import { RiotClient } from '../api/riot-client.js';
import type { SummonerDto } from '../types/summoner.js';
import type { LeagueEntryDto } from '../types/league.js';
import { PlayerNotFoundError } from '../api/errors.js';

export interface PlatformQueryResult<T> {
  platform: Platform;
  data: T;
}

export interface PlatformQueryError {
  platform: Platform;
  error: Error;
}

/**
 * Query all platforms for a region in parallel and return the first successful result
 * 
 * This function queries all platforms in a region simultaneously because:
 * - Account V1 API doesn't tell us which platform a PUUID belongs to
 * - We need to find the platform that has the player's data
 * - Most platforms will return 404 (expected), one will return data
 * 
 * @param puuid - Player's PUUID
 * @param region - Region to query
 * @param queryFn - Function to execute for each platform
 * @returns Promise resolving to the first successful result
 */
export async function queryPlatformsInParallel<T>(
  puuid: string,
  region: Region,
  queryFn: (puuid: string, platform: Platform) => Promise<T>
): Promise<PlatformQueryResult<T>> {
  const platforms = getPlatformsForRegion(region);
  
  console.log(`🔄 Querying ${platforms.length} platforms in parallel for region ${region}:`, platforms);

  const promises = platforms.map(async (platform: Platform): Promise<PlatformQueryResult<T> | PlatformQueryError> => {
    try {
      console.log(`🌐 Querying platform ${platform}...`);
      const data = await queryFn(puuid, platform);
      console.log(`✅ Platform ${platform} succeeded`);
      return { platform, data };
    } catch (error) {
      console.log(`❌ Platform ${platform} failed:`, (error as Error).message);
      return { platform, error: error as Error };
    }
  });

  const results = await Promise.allSettled(promises);

  // Find the first successful result with actual data
  for (const result of results) {
    if (result.status === 'fulfilled' && 'data' in result.value) {
      const data = (result.value as PlatformQueryResult<T>).data;
      // For league entries, prefer results with actual data
      if (Array.isArray(data) && data.length > 0) {
        console.log(`🎯 Using successful result with data from platform ${(result.value as PlatformQueryResult<T>).platform}`);
        return result.value as PlatformQueryResult<T>;
      }
    }
  }

  // If no platform returned data, use the first successful result (even if empty)
  for (const result of results) {
    if (result.status === 'fulfilled' && 'data' in result.value) {
      console.log(`🎯 Using first successful result from platform ${(result.value as PlatformQueryResult<T>).platform} (no data found)`);
      return result.value as PlatformQueryResult<T>;
    }
  }

  // If no platform succeeded, throw PlayerNotFoundError
  // (Most platforms will return 404, which is expected - we only care if ALL fail)
  throw new PlayerNotFoundError('Player not found on any platform in ' + region);
}

/**
 * Query summoner data across all platforms for a region
 * @param puuid - Player's PUUID
 * @param region - Region to query
 * @param riotClient - Riot API client
 * @returns Promise resolving to summoner data from the first successful platform
 */
export async function querySummonerAcrossPlatforms(
  puuid: string,
  region: Region,
  riotClient: RiotClient
): Promise<PlatformQueryResult<SummonerDto>> {
  return queryPlatformsInParallel(
    puuid,
    region,
    (puuid, platform) => riotClient.getSummonerByPuuid(puuid, platform)
  );
}

/**
 * Query league entries across all platforms for a region
 * @param puuid - Player's PUUID
 * @param region - Region to query
 * @param riotClient - Riot API client
 * @returns Promise resolving to league entries from the first successful platform
 */
export async function queryLeagueEntriesAcrossPlatforms(
  puuid: string,
  region: Region,
  riotClient: RiotClient
): Promise<PlatformQueryResult<LeagueEntryDto[]>> {
  return queryPlatformsInParallel(
    puuid,
    region,
    (puuid, platform) => riotClient.getLeagueEntriesbyEncryptedPUUID(puuid, platform)
  );
}
