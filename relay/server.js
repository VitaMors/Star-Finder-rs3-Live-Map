import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Client, GatewayIntentBits, Partials, ChannelType } from 'discord.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

httpServer.listen(process.env.PORT || 8080, () =>
  console.log('Relay listening on', process.env.PORT || 8080)
);
app.get('/', (_req, res) => res.send('StarFind relay OK'));

// ---- Discord client
const CHANNEL_IDS = (process.env.DISCORD_CHANNEL_IDS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

// --- helpers
const normRegion = (s) => {
  const t = (s || '').toLowerCase();
  if (t.includes('asg')) return 'Asgarnia';
  if (t.includes('kand')) return 'Kandarin';
  if (t.includes('wilder')) return 'Wilderness';
  if (t.includes('des') || t.includes('kharid') || t.includes('menaph')) return 'Kharidian Desert';
  if (t.includes('mist') || t.includes('varrock') || t.includes('lumb')) return 'Misthalin';
  if (t.includes('pisc') || t.includes('gnome') || t.includes('tir')) return 'Pisc/Gnome/Tirannwn';
  if (t.includes('frem') || t.includes('lunar')) return 'Frem/Lunar';
  if (t.includes('feldip')) return 'Kandarin'; // tweak if you split Feldip differently
  return 'Misthalin';
};

// +X minutes (positive for "in X"), -X for "X minutes ago"
const parseRelMinutes = (s) => {
  if (!s) return null;
  const m = s.match(/(\d+)\s*minutes?\s*(ago|in)?/i);
  if (!m) return null;
  const v = Number(m[1]);
  if (/ago/i.test(m[2] || s)) return -v;
  if (/in/i.test(m[2] || s)) return v;
  return null;
};

function parseAnnouncementText(txt) {
  const lines = txt.split('\n').map(x => x.trim()).filter(Boolean);
  const items = [];
  for (let i = 0; i < lines.length; i++) {
    const a = lines[i];
    const b = lines[i + 1] || '';

    // "Size 10 • World 75"
    const mw = a.match(/Size\s+(\d{1,2})\s*[•|-]\s*World\s*(\d{1,3})/i);
    if (!mw) continue;
    const size = Number(mw[1]);
    const world = Number(mw[2]);

    // Next line usually like: "Asgarnia • 33 minutes ago (06:51)"
    const parts = b.split('•').map(s => s.trim());
    const regionRaw = parts[0] || '';
    const region = normRegion(regionRaw);
    const relStr = parts[1] || ''; // "33 minutes ago (06:51)"
    const relMin = parseRelMinutes(relStr);

    const now = new Date();
    const eta = new Date(now.getTime() + (relMin ?? 0) * 60000);

    items.push({
      world,
      size,
      region,
      etaISO: eta.toISOString(),
      status: relMin != null && relMin <= 0 ? 'current' : 'upcoming'
    });
  }
  return items;
}

client.on('ready', () => console.log('Discord bot ready as', client.user.tag));

client.on('messageCreate', (msg) => {
  try {
    console.log('📩 Message received:', {
      channelId: msg.channelId,
      content: msg.content?.substring(0, 100) + '...',
      isTargetChannel: CHANNEL_IDS.includes(msg.channelId),
      channelType: msg.channel?.type
    });
    
    if (!CHANNEL_IDS.includes(msg.channelId)) return;
    if (![ChannelType.GuildAnnouncement, ChannelType.GuildText].includes(msg.channel.type)) return;
    
    console.log('🎯 Processing message in target channel...');

    // Merge message content + embeds into plain text
    let text = msg.content || '';
    for (const e of msg.embeds || []) {
      if (e.title) text += `\n${e.title}`;
      if (e.description) text += `\n${e.description}`;
      for (const f of e.fields || []) text += `\n${f.name}\n${f.value}`;
      if (e.footer?.text) text += `\n${e.footer.text}`;
    }

    console.log('📝 Full text to parse:', text);
    const items = parseAnnouncementText(text);
    console.log('📊 Parsed items:', items);
    if (!items.length) return;

    // One combined event is easiest for the client
    io.emit('wave_set', items);

    // Optional split events
    io.emit('wave_upcoming', items.filter(i => i.status === 'upcoming'));
    io.emit('wave_current',  items.filter(i => i.status === 'current'));
  } catch (e) {
    console.error('parse error', e);
  }
});

client.on('error', console.error);

client.login(process.env.DISCORD_TOKEN);
