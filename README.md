# League of Legends Player Lookup

A full-stack application for looking up League of Legends players using the Riot Games API. Features a secure backend API and a clean, modern frontend.

## 🚀 Features

### Backend API
- **Secure API Proxy**: Protects your Riot API key from client exposure
- **Riot ID Validation**: Handles URL encoding and validation for Riot IDs
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **RESTful Design**: Clean API endpoints following REST conventions
- **TypeScript**: Full type safety throughout the application
- **Data Dragon Integration**: Backend proxy for profile icons with caching

### Frontend UI
- **Modern Design**: Clean, responsive UI with Tailwind CSS
- **Real-time Search**: Instant player lookup with loading states
- **Form Validation**: Client-side validation with helpful error messages
- **Player Information**: Complete player data including profile and ranked stats
- **Mobile Responsive**: Works perfectly on all device sizes
- **No Build Process**: Simple HTML/CSS/JS - works with any Node.js version

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HTML Frontend │    │   Express API   │    │   Riot API      │
│   (Port 5173)   │◄──►│   (Port 3000)   │◄──►│   (Port 443)    │
│                 │    │                 │    │                 │
│   - Search Form │    │   - Account API │    │   - Account API │
│   - Player Card │    │   - Icon Proxy  │    │   - Summoner API│
│   - Ranked Stats│    │   - Error Handle│    │   - League API  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **Axios** for HTTP requests
- **CORS** for cross-origin requests

### Frontend
- **Vanilla HTML/CSS/JavaScript** - no build process needed
- **Tailwind CSS** via CDN for styling
- **Modern ES6+ JavaScript** with class-based architecture
- **Responsive design** with mobile-first approach

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Riot Games API key

### 1. Clone and Install
```bash
git clone <repository-url>
cd riot-demo
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
RIOT_API_KEY=your_riot_api_key_here
PORT=3000
```

### 3. Run the Application

#### Option A: Run Both Servers
```bash
npm run dev:all
```

#### Option B: Run Separately
```bash
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend
npm run frontend
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000

## 📚 API Endpoints

### GET /api/account
Get complete player information by Riot ID.

**Query Parameters:**
- `riotId` (required): Player's Riot ID (e.g., "PlayerName#1234")
- `region` (optional): Region to search (americas, europe, asia)

**Example:**
```
GET /api/account?riotId=Troublemaker%230525&region=americas
```

**Response:**
```json
{
  "success": true,
  "data": {
    "puuid": "abc123...",
    "gameName": "Troublemaker",
    "tagLine": "0525",
    "summonerInfo": {
      "summonerLevel": 855,
      "profileIconId": 6883,
      "revisionDate": 1757997910111
    },
    "rankedStats": {
      "soloDuo": {
        "tier": "PLATINUM",
        "rank": "I",
        "leaguePoints": 10,
        "wins": 44,
        "losses": 47,
        "winRate": 48
      },
      "flex": {
        "tier": "EMERALD",
        "rank": "IV",
        "leaguePoints": 20,
        "wins": 95,
        "losses": 90,
        "winRate": 51
      }
    }
  }
}
```

### GET /api/icon/:iconId
Get profile icon from Data Dragon with caching.

**Example:**
```
GET /api/icon/6883
```

### GET /api/health
Health check endpoint.

## 🎨 Frontend Features

### Search Form
- Riot ID input with validation
- Region selection dropdown
- Real-time form validation
- Loading states and error handling

### Player Card
- **Basic Information**: PUUID, Riot ID
- **Profile Information**: Summoner level, profile icon, last updated
- **Ranked Statistics**: Solo/Duo and Flex 5v5 ranks with LP, wins, losses, win rates
- **Responsive Design**: Works on all screen sizes

### UI States
- **Loading**: Animated spinner during API calls
- **Error**: Clear error messages with helpful feedback
- **Success**: Complete player information display
- **Empty States**: "No ranked stats" when appropriate

## 🔧 Development

### Backend Development
```bash
npm run server:dev    
npm run build         
npm test             
```

### Frontend Development
```bash
npm run frontend     # Start frontend server
# No build process needed - just edit HTML/CSS/JS files
```

### E2E Test Flow
```bash
npm run dev:all
# Navigate to localhost:5173
# Mark region and search player in searchbar Ex: Samir#2468
```


### Project Structure
```
riot-demo/
├── src/                    # Backend source code
│   ├── api/               # API client and routing
│   ├── server/            # Express server
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── frontend-simple/       # Simple HTML frontend
│   ├── index.html         # Main HTML file with all functionality
│   └── server.js          # Simple HTTP server
├── dist/                  # Compiled backend
└── package.json
```

## 🎯 Key Improvements

### Frontend Architecture
- **Class-based JavaScript**: Clean, maintainable code structure
- **Proper State Management**: Consistent UI state handling
- **Error Boundaries**: Comprehensive error handling and recovery
- **Data Cleanup**: Proper cleanup between searches
- **Profile Icon Loading**: Reliable icon loading with fallbacks

### Backend Enhancements
- **Data Dragon Proxy**: Backend handles icon requests with caching
- **Parallel Queries**: Efficient cross-platform data fetching
- **Comprehensive Data**: Complete player information including ranked stats
- **Error Handling**: Robust error handling with proper HTTP status codes

## 🛡️ Security

- **API Key Protection**: Riot API key is never exposed to the client
- **Input Validation**: Both client and server-side validation
- **Error Handling**: Secure error messages without sensitive data
- **CORS Configuration**: Proper cross-origin request handling
- **Data Dragon Proxy**: No direct external API calls from frontend

## 🚀 Performance

- **Backend Icon Caching**: 24-hour cache headers for profile icons
- **Parallel API Calls**: Efficient data fetching across platforms
- **Optimized UI**: Smooth loading states and transitions
- **No Build Process**: Instant development and deployment

## 📱 Recommended Usage

1. **Start the servers** using `npm run dev:all`
2. **Open** http://localhost:5173 in your browser
3. **Enter a Riot ID** (e.g., "Troublemaker#0525")
4. **Select a region** (Americas, Europe, or Asia)
5. **Click Search** to see complete player information
6. **View ranked stats** for both Solo/Duo and Flex 5v5 queues

The application provides a complete League of Legends player lookup experience with modern UI and robust backend functionality!