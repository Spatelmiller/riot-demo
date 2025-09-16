/**
 * Utilities for parsing and validating Riot IDs
 */

import type { RiotId } from '../types/index.js';

export class RiotIdParser {
  /**
   * Parse a Riot ID string into gameName and tagLine
   * @param riotId - Riot ID in format "gameName#tagLine" or URL-encoded "gameName%23tagLine"
   * @returns Parsed RiotId object
   * @throws Error if format is invalid
   */
  static parse(riotId: string): RiotId {
    const decodedRiotId = decodeURIComponent(riotId);
    
    if (!this.isValid(decodedRiotId)) {
      throw new Error(`Invalid Riot ID format: ${decodedRiotId}. Expected format: "gameName#tagLine"`);
    }

    const [gameName, tagLine] = decodedRiotId.split('#');
    return {
      gameName: gameName!.trim(),
      tagLine: tagLine!.trim()
    };
  }

  /**
   * Validate Riot ID format
   * @param riotId - Riot ID string to validate (can be URL-encoded)
   * @returns true if valid format
   */
  static isValid(riotId: string): boolean {
    if (!riotId || typeof riotId !== 'string') {
      return false;
    }

    const decodedRiotId = decodeURIComponent(riotId);

    const hashCount = (decodedRiotId.match(/#/g) || []).length;
    if (hashCount !== 1) {
      return false;
    }

    const [gameName, tagLine] = decodedRiotId.split('#');
    
    if (!gameName?.trim() || !tagLine?.trim()) {
      return false;
    }

    return true;
  }
}
