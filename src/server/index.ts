/**
 * Express server for handling Riot API requests
 * Provides secure server-side API access
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RiotClient } from '../api/riot-client.js';
import { RiotIdParser } from '../utils/riot-id-parser.js';
import { PlatformDetector } from '../utils/platform-detector.js';
import { handleApiError } from '../api/error-handler.js';
import type { LeagueEntryDto } from '../types/league.js';

dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

app.use(cors());
app.use(express.json());


//middleware for req and responses
app.use((req, res, next) => {
  console.log(`\n🔍 ${req.method} ${req.path}`);
  console.log('📥 Query:', req.query);
  console.log('📥 Body:', req.body);
  
  const originalSend = res.json;
  res.json = function(data) {
    console.log('📤 Response:', JSON.stringify(data, null, 2));
    return originalSend.call(this, data);
  };
  
  next();
});

//init riot client 
const apiKey = process.env['RIOT_API_KEY'];
if (!apiKey) {
  console.error('❌ RIOT_API_KEY environment variable is required');
  process.exit(1);
}

const riotClient = new RiotClient(apiKey);

/**
 * GET /api/account
 * Get account information by Riot ID
 * Query parameters: riotId (required), region (optional)
 */
app.get('/api/account', async (req, res) => {
  try {
    const { riotId, region = 'americas' } = req.query;

    if (!riotId || typeof riotId !== 'string') {
      return res.status(400).json({
        error: 'Missing Riot ID',
        message: 'Please provide riotId as a query parameter',
        example: '/api/account?riotId=Faker%235555'
      });
    }

    console.log('🔍 GET /api/account - Request received');
    console.log('📥 Query params:', req.query);
    console.log('📥 Received riotId:', riotId);

    if (!RiotIdParser.isValid(riotId)) {
      return res.status(400).json({
        error: 'Invalid Riot ID format',
        message: 'Expected format: "gameName#tagLine"',
        received: riotId,
        suggestion: 'Try: /api/account?riotId=Samir%232468'
      });
    }

    const { gameName, tagLine } = RiotIdParser.parse(riotId);

    const validRegions = ['americas', 'europe', 'asia'];
    if (!validRegions.includes(region as string)) {
      return res.status(400).json({
        error: 'Invalid region',
        message: 'Valid regions: americas, europe, asia',
        received: region
      });
    }

    //Get PUUID
    const account = await riotClient.getAccountByRiotId(gameName, tagLine, region as string);
    console.log('📥 Account response:', JSON.stringify(account, null, 2));

    //Determine platform 
    const platform = PlatformDetector.getBestPlatform(riotId, region as any);
    console.log('🎯 Using platform:', platform);

    // Get Summoner info
    const summonerInfo = await riotClient.getSummonerByPuuid(account.puuid, platform);
    console.log('📥 Summoner response:', JSON.stringify(summonerInfo, null, 2));

    // Get league entries (ranked stats) 
    let leagueEntries: LeagueEntryDto[] = [];
    let soloDuo: LeagueEntryDto | null = null;
    let flex: LeagueEntryDto | null = null;
    
    try {
      const encryptedPUUID = summonerInfo.puuid;
      console.log('🔍 Using encrypted PUUID for League-V4:', encryptedPUUID);
      
      leagueEntries = await riotClient.getLeagueEntriesbyEncryptedPUUID(encryptedPUUID, platform) as LeagueEntryDto[];
      console.log('📥 League entries response:', JSON.stringify(leagueEntries, null, 2));

      // Process league entries to separate Solo/Duo and Flex
      soloDuo = leagueEntries.find(entry => entry.queueType === 'RANKED_SOLO_5x5') || null;
      flex = leagueEntries.find(entry => entry.queueType === 'RANKED_FLEX_SR') || null;
    } catch (error: unknown) {
      console.log('⚠️ League-V4 API not available (permission or other issue):', (error as Error).message);
    }

    return res.json({
      success: true,
      data: {
        // Account info
        puuid: account.puuid,
        gameName: account.gameName,
        tagLine: account.tagLine,
        
        // Profile info
        summonerInfo: {
          id: summonerInfo.id || summonerInfo.puuid, // Use puuid as fallback for id
          accountId: summonerInfo.accountId || summonerInfo.puuid, // Use puuid as fallback
          puuid: summonerInfo.puuid,
          name: summonerInfo.name || account.gameName, // Use account gameName as fallback
          profileIconId: summonerInfo.profileIconId,
          summonerLevel: summonerInfo.summonerLevel,
          revisionDate: summonerInfo.revisionDate
        },
        
        // Ranked stats
        rankedStats: {
          soloDuo: soloDuo ? {
            tier: soloDuo.tier,
            rank: soloDuo.rank,
            leaguePoints: soloDuo.leaguePoints,
            wins: soloDuo.wins,
            losses: soloDuo.losses,
            winRate: Math.round((soloDuo.wins / (soloDuo.wins + soloDuo.losses)) * 100)
          } : null,
          flex: flex ? {
            tier: flex.tier,
            rank: flex.rank,
            leaguePoints: flex.leaguePoints,
            wins: flex.wins,
            losses: flex.losses,
            winRate: Math.round((flex.wins / (flex.wins + flex.losses)) * 100)
          } : null
        }
      }
    });

  } catch (error) {
    handleApiError(error, res);
  }
});

/**
 * GET /api/debug
 * Debug endpoint to see what's happening
 */
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint - check server console for detailed logs',
    instructions: [
      '1. Make a request to /api/account?riotId=Samir%232468',
      '2. Watch the server console for detailed logs',
      '3. You\'ll see the Riot API request/response details'
    ],
    testUrl: '/api/account?riotId=Samir%232468',
    note: 'This follows REST conventions - GET for retrieving data, just like the Riot API'
  });
});

/**
 * GET /api/health (health check endpoint)
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET /
 * API documentation
 */
app.get('/', (req, res) => {
  res.json({
    name: 'LoL Stats Checker API',
    version: '1.0.0',
    description: 'Server-side Riot API proxy for League of Legends stats',
    endpoints: {
      'GET /api/health': 'Health check',
      'GET /api/account?riotId=gameName%23tagLine': 'Get account by Riot ID',
      'GET /api/debug': 'Debug endpoint with instructions'
    },
    examples: {
      account: {
        url: '/api/account?riotId=Faker%235555',
        description: 'Get account for Faker with tag 5555',
        note: 'Use %23 instead of # in URLs due to URL fragment handling'
      },
      withRegion: {
        url: '/api/account?riotId=Faker%235555&region=americas',
        description: 'Get account with specific region'
      }
    }
  });
});

app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LoL Stats Checker API running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🎮 Example: http://localhost:${PORT}/api/account?riotId=Faker#5555`);
});

export default app;
