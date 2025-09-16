# League of Legends Player Lookup

A full-stack application for looking up League of Legends players using the Riot Games API. Features a secure backend API and a modern React frontend.

## 🚀 Features

### Backend API
- **Secure API Proxy**: Protects your Riot API key from client exposure
- **Riot ID Validation**: Handles URL encoding and validation for Riot IDs
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **RESTful Design**: Clean API endpoints following REST conventions
- **TypeScript**: Full type safety throughout the application

### Frontend UI
- **Modern Design**: Clean, responsive UI with Tailwind CSS (via CDN)
- **Real-time Search**: Instant player lookup with loading states
- **Form Validation**: Client-side validation with helpful error messages
- **Extensible Architecture**: Ready for profile info and ranked stats
- **Mobile Responsive**: Works perfectly on all device sizes
- **No Build Process**: Simple HTML/CSS/JS - works with any Node.js version

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │   Express API   │    │   Riot API      │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (External)    │
│   Port 5173     │    │   Port 3000     │    │   Port 443      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **Axios** for HTTP requests
- **CORS** for cross-origin requests
- **dotenv** for environment variables

### Frontend
- **Vanilla HTML/CSS/JavaScript** - no build process needed
- **Tailwind CSS** via CDN for styling
- **Modern ES6+ JavaScript** with async/await
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
Get player account information by Riot ID.

**Query Parameters:**
- `riotId` (required): Player's Riot ID (e.g., "PlayerName#1234")
- `region` (optional): Region to search (americas, europe, asia)

**Example:**
```
GET /api/account?riotId=Samir%232468&region=americas
```

**Response:**
```json
{
  "success": true,
  "data": {
    "puuid": "abc123...",
    "gameName": "Samir",
    "tagLine": "2468"
  }
}
```

### GET /api/health
Health check endpoint.

### GET /api/debug
Debug endpoint with instructions.

## 🎨 UI Components

### SearchForm
- Riot ID input with validation
- Region selection dropdown
- Real-time form validation
- Loading states

### PlayerCard
- Displays basic player information
- Shows PUUID and Riot ID
- Ready for profile and ranked stats extensions
- Responsive design


## 🔧 Development

### Backend Development
```bash
npm run server:dev    # Start with hot reload
npm run build         # Build TypeScript
npm test             # Run tests
```

### Frontend Development
```bash
npm run frontend     # Start frontend server
# No build process needed - just edit HTML/CSS/JS files
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
│   ├── index.html         # Main HTML file
│   └── server.js          # Simple HTTP server
├── dist/                  # Compiled backend
└── package.json
```

## 🔮 Future Extensions

The application is designed to easily add:

### Profile Information
- Summoner level
- Profile icon
- Last updated timestamp
- Account creation date

### Ranked Statistics
- Solo/Duo rank and LP
- Flex 5v5 rank and LP
- Win/loss records
- Win rates
- Promotional series status

### Additional Features
- Match history
- Champion statistics
- Recent games
- Leaderboards

## 🛡️ Security

- **API Key Protection**: Riot API key is never exposed to the client
- **Input Validation**: Both client and server-side validation
- **Error Handling**: Secure error messages without sensitive data
- **CORS Configuration**: Proper cross-origin request handling