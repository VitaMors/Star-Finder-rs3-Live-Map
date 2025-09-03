# RS3 Star Finder - Web Frontend

Interactive map for tracking RuneScape 3 shooting stars with real-time updates.

## Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Connect to relay:**
   - Start the Discord relay (see `../relay/README.md`)
   - Open the website
   - Enter WebSocket URL: `ws://localhost:8080`

## Building

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment to GitHub Pages

1. **Configure repository:**
   - Update `homepage` in `package.json` with your GitHub Pages URL
   - Example: `"homepage": "https://yourusername.github.io/rs3-stars"`

2. **Deploy:**
   ```bash
   npm run deploy
   ```

3. **Enable GitHub Pages:**
   - Go to repository Settings > Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`

## Features

- **Interactive Region Map**: Visual heatmap showing star activity
- **Real-time Updates**: WebSocket integration with Discord bot
- **Local Reports**: Add and manage manual star reports
- **Search & Filter**: Find specific stars by world, region, or notes
- **Auto-promotion**: Upcoming stars automatically become current at ETA
- **Auto-expiry**: Current stars expire after 15 minutes

## WebSocket Connection

The frontend expects these WebSocket events from the relay:

- `wave_set`: Complete star data replacement
- `wave_upcoming`: Upcoming stars only  
- `wave_current`: Current/active stars only

Each star should have this format:
```json
{
  "world": 75,
  "size": 10, 
  "region": "Asgarnia",
  "etaISO": "2024-01-01T07:00:00.000Z",
  "status": "upcoming"
}
```

## Regions

The map supports these RS3 regions:
- Misthalin
- Asgarnia  
- Kandarin
- Wilderness
- Kharidian Desert
- Pisc/Gnome/Tirannwn
- Frem/Lunar
