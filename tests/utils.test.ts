/**
 * Utils Tests
 * 
 * Tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import { RiotIdParser } from '../src/utils/riot-id-parser.js';

describe('RiotIdParser', () => {
  describe('isValid', () => {
    it('should validate correct Riot ID format', () => {
      expect(RiotIdParser.isValid('Samir#2468')).toBe(true);
      expect(RiotIdParser.isValid('Troublemaker#0525')).toBe(true);
      expect(RiotIdParser.isValid('Snowball#0625')).toBe(true);
    });

    it('should reject invalid Riot ID format', () => {
      expect(RiotIdParser.isValid('Faker')).toBe(false); 
      expect(RiotIdParser.isValid('Faker#')).toBe(false);
      expect(RiotIdParser.isValid('#KR1')).toBe(false); 
      expect(RiotIdParser.isValid('Faker#KR1#Extra')).toBe(false); 
      expect(RiotIdParser.isValid('')).toBe(false); 
      expect(RiotIdParser.isValid('F#KR')).toBe(true); 
      expect(RiotIdParser.isValid('Faker#K')).toBe(true); 
    });
  });

  describe('parse', () => {
    it('should parse valid Riot ID correctly', () => {
      const result = RiotIdParser.parse('Faker#KR1');
      expect(result).toEqual({
        gameName: 'Faker',
        tagLine: 'KR1'
      });
    });

    it('should handle whitespace correctly', () => {
      const result = RiotIdParser.parse('  Faker  #  KR1  ');
      expect(result).toEqual({
        gameName: 'Faker',
        tagLine: 'KR1'
      });
    });

    it('should throw error for invalid format', () => {
      expect(() => RiotIdParser.parse('InvalidFormat')).toThrow('Invalid Riot ID format');
    });
  });
});
