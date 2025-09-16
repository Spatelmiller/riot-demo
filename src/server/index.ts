/**
 * Express server for handling Riot API requests
 * Provides secure server-side API access
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RiotClient } from '../api/riot-client.js';
import { RiotIdParser } from '../utils/riot-id-parser.js';
import { 
  querySummonerAcrossPlatforms, 
  queryLeagueEntriesAcrossPlatforms 
} from '../utils/parallel-queries.js';
import { handleApiError } from '../api/error-handler.js';
import { CacheService } from '../services/cache.js';
import type { LeagueEntryDto } from '../types/league.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


//middleware for req and responses
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] 🔍 ${req.method} ${req.path}`);
  console.log(`[${timestamp}] 📥 Query:`, req.query);
  console.log(`[${timestamp}] 📥 Body:`, req.body);
  
  const originalSend = res.json;
  res.json = function(data) {
    console.log(`[${timestamp}] 📤 Response:`, JSON.stringify(data, null, 2));
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

    // Check cache first
    const cacheKey = `${riotId}:${region}`;
    const cachedData = CacheService.getCachedAccount(riotId, region as string);
    
    if (cachedData) {
      console.log('✅ Cache HIT for account:', cacheKey);
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    console.log('❌ Cache MISS for account:', cacheKey);

    //Get PUUID
    const account = await riotClient.getAccountByRiotId(gameName, tagLine, region as string);
    console.log('📥 Account response:', JSON.stringify(account, null, 2));

    // Get Summoner info across all platforms in parallel
    console.log('🔄 Querying summoner data across all platforms for region:', region);
    const summonerResult = await querySummonerAcrossPlatforms(account.puuid, region as any, riotClient);
    const summonerInfo = summonerResult.data;
    console.log('📥 Summoner response from platform', summonerResult.platform, ':', JSON.stringify(summonerInfo, null, 2));

    // Get league entries (ranked stats) across all platforms in parallel
    let leagueEntries: LeagueEntryDto[] = [];
    let soloDuo: LeagueEntryDto | null = null;
    let flex: LeagueEntryDto | null = null;
    let leagueResult: any = null;
    
    try {
      const encryptedPUUID = summonerInfo.puuid;
      console.log('🔄 Querying league entries across all platforms for region:', region);
      
      leagueResult = await queryLeagueEntriesAcrossPlatforms(encryptedPUUID, region as any, riotClient);
      leagueEntries = leagueResult.data;
      console.log('📥 League entries response from platform', leagueResult.platform, ':', JSON.stringify(leagueEntries, null, 2));
      console.log('🔍 League entries length:', leagueEntries.length);

      // Process league entries to separate Solo/Duo and Flex
      soloDuo = leagueEntries.find(entry => entry.queueType === 'RANKED_SOLO_5x5') || null;
      flex = leagueEntries.find(entry => entry.queueType === 'RANKED_FLEX_SR') || null;
      console.log('🔍 Processed soloDuo:', soloDuo ? 'found' : 'null');
      console.log('🔍 Processed flex:', flex ? 'found' : 'null');
    } catch (error: unknown) {
      console.log('⚠️ League-V4 API not available on any platform:', (error as Error).message);
    }

    const responseData = {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,

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
      },
      
      // Platform info
      platform: {
        summoner: summonerResult.platform,
        league: leagueResult ? leagueResult.platform : 'none'
      }
    };

    // Cache the response
    CacheService.cacheAccount(riotId, region as string, responseData);
    console.log('💾 Cached account data for:', cacheKey);

    return res.json({
      success: true,
      data: responseData,
      cached: false
    });

  } catch (error) {
    return handleApiError(error, res);
  }
});

/**
 * GET /api/icon/:iconId
 * Get profile icon from Data Dragon with caching
 */
app.get('/api/icon/:iconId', async (req, res) => {
  try {
    const { iconId } = req.params;
    
    if (!iconId || isNaN(Number(iconId))) {
      return res.status(400).json({
        error: 'Invalid icon ID',
        message: 'Icon ID must be a number'
      });
    }

    // Check cache first
    const cachedIconData = CacheService.getCachedIcon(Number(iconId));
    
    if (cachedIconData) {
      console.log('✅ Cache HIT for icon:', iconId);
      res.set({
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      });
      res.send(cachedIconData);
      return;
    }

    console.log('❌ Cache MISS for icon:', iconId);

    // Get latest Data Dragon version
    let dataDragonVersion = '14.18.1';
    try {
      const versionResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
      const versions = await versionResponse.json() as string[];
      dataDragonVersion = versions[0] || '14.18.1';
    } catch (error) {
      console.log('⚠️ Failed to fetch Data Dragon version, using fallback:', dataDragonVersion);
    }

    // Try multiple versions for better reliability
    const versions = [dataDragonVersion, '15.18.1', '14.18.1', '14.17.1', '14.16.1'];
    
    for (const version of versions) {
      try {
        const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`;
        const iconResponse = await fetch(iconUrl);
        
        if (iconResponse.ok) {
          // Get the image data as buffer
          const imageBuffer = await iconResponse.arrayBuffer();
          const imageData = Buffer.from(imageBuffer);
          
          // Cache the image data
          CacheService.cacheIcon(Number(iconId), imageData);
          console.log('💾 Cached icon data for:', iconId);
          
          // Set appropriate headers for caching
          res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            'Access-Control-Allow-Origin': '*'
          });
          
          // Send the image data
          res.send(imageData);
          return;
        }
      } catch (error) {
        console.log(`⚠️ Failed to fetch icon with version ${version}:`, (error as Error).message);
        continue;
      }
    }

    // If all versions fail, return 404
    return res.status(404).json({
      error: 'Icon not found',
      message: `Profile icon ${iconId} not found in any Data Dragon version`
    });

  } catch (error) {
    console.error('Icon fetch error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch profile icon'
    });
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
 * GET /api/cache/stats (cache statistics endpoint)
 */
app.get('/api/cache/stats', (req, res) => {
  const stats = CacheService.getStats();
  const keys = CacheService.getKeys();
  
  res.json({
    cache: {
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.hits + stats.misses > 0 ? 
        ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) + '%' : '0%',
      keyCount: keys.length,
      sampleKeys: keys.slice(0, 10) // Show first 10 keys as sample
    },
    timestamp: new Date().toISOString()
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
      'GET /api/icon/:iconId': 'Get profile icon from Data Dragon',
      'GET /api/cache/stats': 'Get cache statistics',
      'GET /api/debug': 'Debug endpoint with instructions'
    },
    examples: {
      account: {
        url: '/api/account?riotId=Samir%232468',
        description: 'Get account for Samir with tag 2468',
        note: 'Use %23 instead of # in URLs due to URL fragment handling'
      },
      withRegion: {
        url: '/api/account?riotId=Samir%232468&region=americas',
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
