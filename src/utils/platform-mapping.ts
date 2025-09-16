/**
 * Platform Mapping
 * 
 * Utilities for platform mapping and detection
 */

import type { Platform, Region } from '../types/index.js';

/**
 * Platform mapping for regions
 */
export const REGION_PLATFORMS: Record<Region, Platform[]> = {
  'americas': ['na1', 'br1', 'la1', 'la2'], 
  'europe': ['euw1', 'eun1', 'tr1', 'ru', 'me1'],
  'asia': ['kr', 'jp1', 'oc1', 'sg2', 'tw2', 'vn2'] // ph2 and th2 from blogpost are not supported anymore
};

/**
 * Get all platforms for a region
 * @param region - Region identifier
 * @returns Array of platforms for the region
 */
export function getPlatformsForRegion(region: Region): Platform[] {
  return REGION_PLATFORMS[region];
}
