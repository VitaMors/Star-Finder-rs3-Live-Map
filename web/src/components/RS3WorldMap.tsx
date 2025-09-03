import React from "react";

type RegionKey =
  | "Asgarnia"
  | "Kandarin"
  | "Kharidian Desert"
  | "Misthalin"
  | "Pisc/Gnome/Tirannwn"
  | "Frem/Lunar"
  | "Wilderness";

type Status = "idle" | "upcoming" | "active";

export type RegionStatusMap = Record<RegionKey, Status>;
export type RegionMeta = Record<RegionKey, { topSize?: number; soonETA?: string }>;

interface StarLocation {
  world: number;
  size: number;
  region: string;
  etaISO: string;
  status: "upcoming" | "current";
  x?: number; // map coordinates
  y?: number;
}

const VIEWBOX_W = 2048; // match your image pixel width
const VIEWBOX_H = 2048; // match your image pixel height

// --- Region polygons (more precisely matched to RS3 world map)
// Coordinates are in the same coordinate space as the viewBox (0..VIEWBOX_W/H).
const SHAPES: Record<RegionKey, string> = {
  // Wilderness (ice/dangerous northern area - wider strip)
  Wilderness: "M300,50 L1750,50 L1750,350 L300,350 Z",

  // Fremennik/Lunar (northwest - Rellekka area and islands)
  "Frem/Lunar": "M100,350 L450,350 L450,550 L100,550 Z",

  // Kandarin (west - Ardougne/Catherby/Seers area)
  Kandarin: "M100,550 L650,550 L650,850 L100,850 Z",

  // Asgarnia (central - Falador/White Wolf Mountain area)
  Asgarnia: "M650,550 L1050,550 L1050,850 L650,850 Z",

  // Misthalin (east central - Varrock/Lumbridge/Draynor area)
  Misthalin: "M1050,550 L1500,550 L1500,850 L1050,850 Z",

  // Pisc/Gnome/Tirannwn (far southwest - Tree Gnome/Elf lands)
  "Pisc/Gnome/Tirannwn": "M100,850 L500,850 L500,1300 L100,1300 Z",

  // Kharidian Desert (southeast - Al Kharid/Menaphos/desert)
  "Kharidian Desert": "M650,850 L1750,850 L1750,1400 L650,1400 Z",
};

// Optional label anchors for nicer centered labels
const LABELS: Record<RegionKey, { x: number; y: number }> = {
  Wilderness: { x: 1025, y: 200 },
  "Frem/Lunar": { x: 275, y: 450 },
  Kandarin: { x: 375, y: 700 },
  Asgarnia: { x: 850, y: 700 },
  Misthalin: { x: 1275, y: 700 },
  "Pisc/Gnome/Tirannwn": { x: 300, y: 1075 },
  "Kharidian Desert": { x: 1200, y: 1125 },
};

function clsFor(status: Status) {
  if (status === "active") return "region region-active";
  if (status === "upcoming") return "region region-upcoming";
  return "region";
}

export default function RS3WorldMap({
  status,
  meta,
  onPick,
  stars = [],
  src = "/rs3-stars/RuneScape_Worldmap.png", // RS3 world map image
}: {
  status: RegionStatusMap;
  meta?: RegionMeta;
  onPick?: (r: RegionKey) => void;
  stars?: StarLocation[];
  src?: string;
}) {
  const regions = Object.keys(SHAPES) as RegionKey[];
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate random coordinates within each region for stars
  const getStarPosition = (region: string) => {
    const regionCenter = LABELS[region as RegionKey];
    if (!regionCenter) return { x: 1000, y: 1000 };
    
    // Add some randomness around the region center
    const offsetX = (Math.random() - 0.5) * 200;
    const offsetY = (Math.random() - 0.5) * 150;
    
    return {
      x: regionCenter.x + offsetX,
      y: regionCenter.y + offsetY
    };
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
      {/* Zoom Controls */}
      <div className="flex items-center gap-2 p-3 bg-slate-800/60 border-b border-slate-700">
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
        >
          Zoom Out
        </button>
        <span className="text-sm text-slate-300 min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(3, zoom + 0.25))}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
        >
          Zoom In
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm ml-2"
        >
          Reset
        </button>
      </div>

      <div 
        className="relative w-full h-96 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="absolute inset-0 transition-transform duration-200"
          style={{ 
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          {/* Base map image */}
          <img
            src={src}
            alt="RS3 World Map"
            className="w-full h-full object-contain select-none"
            draggable={false}
            onError={(e) => console.error('Image failed to load:', src)}
            onLoad={() => console.log('Image loaded successfully:', src)}
          />

          {/* Star emojis overlay */}
          {stars.map((star, index) => {
            const position = getStarPosition(star.region);
            const isUpcoming = star.status === "upcoming";
            const eta = new Date(star.etaISO).toLocaleTimeString(undefined, { hour12: false });
            
            // Convert SVG coordinates to percentage
            const leftPercent = (position.x / VIEWBOX_W) * 100;
            const topPercent = (position.y / VIEWBOX_H) * 100;
            
            return (
              <div
                key={`${star.world}-${index}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                }}
              >
                {/* Star emoji */}
                <div className={`text-lg ${isUpcoming ? 'animate-pulse' : ''}`}>
                  {isUpcoming ? '🌟' : '⭐'}
                </div>
                
                {/* Star info tooltip */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap border border-gray-600">
                  W{star.world} S{star.size} • {eta}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-slate-800 text-sm">
        <span className="inline-flex items-center gap-2">
          🌟 Upcoming
        </span>
        <span className="inline-flex items-center gap-2">
          ⭐ Current
        </span>
      </div>

      {/* Styles scoped via Tailwind + small overrides */}
      <style>{`
        .region {
          fill: rgba(148,163,184,0.20); /* slate-400/20 */
          stroke: rgba(226,232,240,0.25);
          stroke-width: 2;
          transition: fill 150ms ease, filter 150ms ease;
        }
        .region-upcoming {
          fill: rgba(56,189,248,0.30); /* sky-400/30 */
          filter: url(#glow-blue);
        }
        .region-active {
          fill: rgba(239,68,68,0.35);  /* red-500/35 */
          filter: url(#glow-red);
        }
        .region:hover {
          fill: rgba(148,163,184,0.30);
        }
      `}</style>
    </div>
  );
}
