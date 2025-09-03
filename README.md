# RS3 Shooting Star Live Map

A live map for tracking RuneScape 3 shooting stars with real-time Discord integration.

## Features

- Interactive map showing star locations across RS3 regions
- Real-time updates via Discord bot integration
- Prediction tracking with ETA windows
- Local browser storage for prototype data
- WebSocket integration for live feeds

## Project Structure

```
rs3-stars/
├─ web/               # React frontend (deployed to GitHub Pages)
│  ├─ package.json
│  ├─ vite.config.ts
│  └─ src/...
├─ relay/             # Discord → WebSocket relay (deployed to Railway/Render)
│  ├─ package.json
│  ├─ .env.example
│  └─ server.js
└─ README.md
```

## Quick Start

### 1. Discord Relay Setup

```bash
cd relay
npm install
cp .env.example .env
# Edit .env with your Discord bot token and channel IDs
node server.js
```

### 2. Web Frontend Setup

```bash
cd web
npm install
npm run dev
```

### 3. Connect WebSocket

1. Start the relay server
2. Open the web frontend
3. Paste your WebSocket URL (e.g., `ws://localhost:8080` for local dev)
4. The map will automatically update with Discord announcements

## Deployment

### Web Frontend (GitHub Pages)

```bash
cd web
npm run build
npm run deploy
```

### Relay (Railway/Render/Fly)

1. Push the `relay/` folder to your hosting service
2. Set environment variables: `DISCORD_TOKEN`, `DISCORD_CHANNEL_IDS`, `PORT`
3. Deploy and copy the WSS URL to your frontend

## Discord Bot Setup

1. Create a Discord application at https://discord.com/developers/applications
2. Create a bot and copy the token to `.env`
3. Invite the bot to your server with message reading permissions
4. Add your announcement channel ID to `DISCORD_CHANNEL_IDS`

## Data Format

The relay expects Discord announcements in this format:

```
Size 10 • World 75
Asgarnia • 33 minutes ago (06:51)

Size 8 • World 123
Wilderness • in 15 minutes (07:30)
```

And emits WebSocket events:

```json
{
  "world": 75,
  "size": 10,
  "region": "Asgarnia", 
  "etaISO": "2024-01-01T07:00:00.000Z",
  "status": "current"
}
```
