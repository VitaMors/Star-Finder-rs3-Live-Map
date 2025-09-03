# RS3 Star Finder - Discord Relay

This Discord bot relays shooting star announcements from Discord to the web frontend via WebSocket.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your values
   ```

3. **Discord Bot Setup:**
   - Go to https://discord.com/developers/applications
   - Create a new application
   - Go to "Bot" section and create a bot
   - Copy the bot token to your `.env` file
   - Invite the bot to your server with "Read Messages" permission

4. **Get Channel IDs:**
   - Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
   - Right-click your announcement channel and "Copy ID"
   - Add the ID to `DISCORD_CHANNEL_IDS` in `.env`

## Running Locally

```bash
npm start
```

The relay will be available at `ws://localhost:8080`

## Deployment

### Railway
1. Create new project on Railway
2. Connect your GitHub repository 
3. Set environment variables in Railway dashboard
4. Deploy

### Render
1. Create new Web Service on Render
2. Connect your GitHub repository
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add environment variables
6. Deploy

### Fly.io
1. Install flyctl CLI
2. Run `fly launch` in the relay directory
3. Set secrets: `fly secrets set DISCORD_TOKEN=your-token`
4. Deploy with `fly deploy`

## Message Format

The bot expects Discord messages in this format:

```
Size 10 • World 75
Asgarnia • 33 minutes ago (06:51)

Size 8 • World 123  
Wilderness • in 15 minutes (07:30)
```

## WebSocket Events

The relay emits these events:

- `wave_set`: Complete array of current star data
- `wave_upcoming`: Array of upcoming stars
- `wave_current`: Array of currently active stars

Each star object contains:
```json
{
  "world": 75,
  "size": 10,
  "region": "Asgarnia",
  "etaISO": "2024-01-01T07:00:00.000Z",
  "status": "current"
}
```
