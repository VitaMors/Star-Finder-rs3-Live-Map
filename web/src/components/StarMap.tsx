import React, { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import ReportsPanel from "./ReportsPanel";
import RS3WorldMap, { RegionStatusMap, RegionMeta } from "./RS3WorldMap";

// Types
interface StarReport {
  id: string;
  world: number;
  locationId: string;
  region: string;
  size: number;
  status: "predicted" | "landed" | "finished";
  etaISO?: string;
  reporter?: string;
  note?: string;
}

interface LiveStarData {
  world: number;
  size: number;
  region: string;
  etaISO: string;
  status: "upcoming" | "current";
}

// Region names mapping for consistency with world map
type RegionKey = "Asgarnia" | "Kandarin" | "Kharidian Desert" | "Misthalin" | "Pisc/Gnome/Tirannwn" | "Frem/Lunar" | "Wilderness";

export default function StarMap() {
  const [, setSocket] = useState<Socket | null>(null);
  const [socketUrl, setSocketUrl] = useState(() => 
    localStorage.getItem('starfinder-ws-url') || "ws://localhost:8081"
  );
  const [isConnected, setIsConnected] = useState(false);
  const [reports, setReports] = useState<StarReport[]>([]);
  const [upcomingStars, setUpcomingStars] = useState<LiveStarData[]>([]);
  const [currentStars, setCurrentStars] = useState<LiveStarData[]>([]);
  const [activeRegion, setActiveRegion] = useState<RegionKey | null>(null);

  // WebSocket connection
  useEffect(() => {
    if (!socketUrl.trim()) return;

    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: false,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to relay');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from relay');
    });

    newSocket.on('wave_set', (items: LiveStarData[]) => {
      console.log('Received wave_set:', items);
      setUpcomingStars(items.filter(i => i.status === 'upcoming'));
      setCurrentStars(items.filter(i => i.status === 'current'));
    });

    newSocket.on('wave_upcoming', (items: LiveStarData[]) => {
      console.log('Received wave_upcoming:', items);
      setUpcomingStars(items);
    });

    newSocket.on('wave_current', (items: LiveStarData[]) => {
      console.log('Received wave_current:', items);
      setCurrentStars(items);
    });

    newSocket.connect();
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [socketUrl]);

  // Auto-promote upcoming to current and expire current stars
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      // Promote upcoming stars that have reached their ETA
      setUpcomingStars(prev => prev.filter(star => {
        if (star.etaISO && new Date(star.etaISO) <= now) {
          setCurrentStars(current => [...current, { ...star, status: 'current' }]);
          return false;
        }
        return true;
      }));

      // Expire current stars after 15 minutes
      setCurrentStars(prev => prev.filter(star => {
        if (star.etaISO) {
          const eta = new Date(star.etaISO);
          const expiry = new Date(eta.getTime() + 15 * 60000); // 15 minutes after ETA
          return now < expiry;
        }
        return true;
      }));
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Build region status and metadata for world map
  const regionStatus = useMemo((): RegionStatusMap => {
    const status: RegionStatusMap = {
      Asgarnia: "idle",
      Kandarin: "idle", 
      "Kharidian Desert": "idle",
      Misthalin: "idle",
      "Pisc/Gnome/Tirannwn": "idle",
      "Frem/Lunar": "idle",
      Wilderness: "idle"
    };

    // Mark regions with current stars as active
    currentStars.forEach(star => {
      const region = star.region as RegionKey;
      if (region in status) {
        status[region] = "active";
      }
    });

    // Mark regions with upcoming stars (but no current) as upcoming
    upcomingStars.forEach(star => {
      const region = star.region as RegionKey;
      if (region in status && status[region] === "idle") {
        status[region] = "upcoming";
      }
    });

    return status;
  }, [upcomingStars, currentStars]);

  const regionMeta = useMemo((): RegionMeta => {
    const meta: RegionMeta = {
      Asgarnia: {},
      Kandarin: {}, 
      "Kharidian Desert": {},
      Misthalin: {},
      "Pisc/Gnome/Tirannwn": {},
      "Frem/Lunar": {},
      Wilderness: {}
    };

    const updateMeta = (star: LiveStarData) => {
      const region = star.region as RegionKey;
      if (!(region in meta)) return;
      
      const m = meta[region];
      
      // Track top size
      if (!m.topSize || star.size > m.topSize) {
        m.topSize = star.size;
      }
      
      // Track soonest ETA
      const current = m.soonETA ? new Date(m.soonETA).getTime() : Infinity;
      const starTime = new Date(star.etaISO).getTime();
      if (starTime < current) {
        m.soonETA = star.etaISO;
      }
    };

    [...upcomingStars, ...currentStars].forEach(updateMeta);
    return meta;
  }, [upcomingStars, currentStars]);

  // Local reports management
  const handleAddReport = (report: Omit<StarReport, 'id'>) => {
    const newReport: StarReport = {
      ...report,
      id: Date.now().toString(),
    };
    setReports(prev => [...prev, newReport]);
  };

  const handleUpdateReport = (updatedReport: StarReport) => {
    setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
  };

  const handleRemoveReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* WebSocket Connection */}
      <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-3">Live Feed Connection</h3>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="WebSocket URL (e.g., ws://localhost:8080)"
            value={socketUrl}
            onChange={(e) => {
              const newUrl = e.target.value;
              setSocketUrl(newUrl);
              localStorage.setItem('starfinder-ws-url', newUrl);
            }}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2"
          />
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            isConnected 
              ? 'bg-green-900/60 border border-green-400/40 text-green-300'
              : 'bg-red-900/60 border border-red-400/40 text-red-300'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        {isConnected && (
          <div className="mt-3 text-sm text-slate-400">
            Upcoming: {upcomingStars.length} | Current: {currentStars.length}
          </div>
        )}
      </div>

      {/* RS3 World Map */}
      <div className="lg:col-span-2">
        <div className="mb-3">
          <h3 className="text-lg font-semibold">RS3 World Map</h3>
          {activeRegion && (
            <p className="text-slate-400 text-sm">Selected: {activeRegion}</p>
          )}
        </div>
        <RS3WorldMap
          status={regionStatus}
          meta={regionMeta}
          onPick={(region) => setActiveRegion(region)}
          stars={[...upcomingStars, ...currentStars]}
          src="RuneScape_Worldmap.png"
        />
      </div>

      {/* Reports Panel */}
      <div className="lg:col-span-1 space-y-4">
        <ReportsPanel
          reports={reports}
          onAdd={handleAddReport}
          onUpdate={handleUpdateReport}
          onRemove={handleRemoveReport}
        />

        {/* Live Feed */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-3">Live Feed</h3>
          
          {/* Upcoming Stars */}
          {upcomingStars.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                🌟 Upcoming ({upcomingStars.length})
              </h4>
              <div className="space-y-1">
                {upcomingStars.map((star, index) => (
                  <div key={`upcoming-${index}`} className="text-xs bg-blue-900/20 border border-blue-800/40 rounded p-2">
                    <div className="font-medium">World {star.world} • Size {star.size}</div>
                    <div className="text-blue-300">{star.region}</div>
                    <div className="text-blue-400 text-xs">
                      ETA: {new Date(star.etaISO).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Stars */}
          {currentStars.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                ⭐ Current ({currentStars.length})
              </h4>
              <div className="space-y-1">
                {currentStars.map((star, index) => (
                  <div key={`current-${index}`} className="text-xs bg-red-900/20 border border-red-800/40 rounded p-2">
                    <div className="font-medium">World {star.world} • Size {star.size}</div>
                    <div className="text-red-300">{star.region}</div>
                    <div className="text-red-400 text-xs">
                      Active since {new Date(star.etaISO).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Stars */}
          {upcomingStars.length === 0 && currentStars.length === 0 && (
            <div className="text-slate-500 text-sm text-center py-4">
              No live star data yet. Connect to Discord relay to see real-time updates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
