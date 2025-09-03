import React, { useMemo, useState } from "react";

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

interface ReportsPanelProps {
  reports: StarReport[];
  onAdd: (report: Omit<StarReport, 'id'>) => void;
  onUpdate: (report: StarReport) => void;
  onRemove: (id: string) => void;
}

// Sample location names - you can expand this
const locationNames: Record<string, string> = {
  "varrock_east": "Varrock East Mine",
  "lumbridge": "Lumbridge Swamp",
  "falador": "Falador Mining Site",
  "camelot": "Camelot Castle",
  "seers": "Seers' Village",
  "catherby": "Catherby Beach",
  "yanille": "Yanille",
  "ardougne": "East Ardougne",
  "fishing_guild": "Fishing Guild",
  "coal_trucks": "Coal Truck Mining Site",
  "rimmington": "Rimmington Mine",
  "barbarian_village": "Barbarian Village",
  "duel_arena": "Al Kharid Duel Arena",
  "mage_training": "Mage Training Arena",
  "desert_mining": "Desert Mining Camp",
  "wilderness_lvl_1": "Wilderness Level 1",
  "wilderness_lvl_20": "Wilderness Level 20",
  "wilderness_lvl_30": "Wilderness Level 30",
  "edgeville": "Edgeville",
};

const locName = (locationId: string) => locationNames[locationId] || locationId;

const stageLabel = (size: number) => {
  if (size >= 9) return "Enormous";
  if (size >= 7) return "Large";
  if (size >= 5) return "Medium";
  if (size >= 3) return "Small";
  return "Tiny";
};

const formatTimeWindow = (report: StarReport) => {
  if (!report.etaISO) return "Unknown";
  
  const eta = new Date(report.etaISO);
  const now = new Date();
  const diffMs = eta.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);
  
  if (diffMin < -15) return "Expired";
  if (diffMin < 0) return `${Math.abs(diffMin)}m ago`;
  if (diffMin === 0) return "Now";
  return `in ${diffMin}m`;
};

export default function ReportsPanel({ reports, onAdd, onUpdate, onRemove }: ReportsPanelProps) {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReport, setNewReport] = useState({
    world: "",
    locationId: "",
    region: "Misthalin",
    size: "5",
    status: "predicted" as const,
    reporter: "",
    note: "",
  });

  // Filter and search reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesStatus = filterStatus === "all" || report.status === filterStatus;
      const matchesQuery = query === "" || 
        report.world.toString().includes(query.toLowerCase()) ||
        report.region.toLowerCase().includes(query.toLowerCase()) ||
        locName(report.locationId).toLowerCase().includes(query.toLowerCase()) ||
        (report.note && report.note.toLowerCase().includes(query.toLowerCase()));
      
      return matchesStatus && matchesQuery;
    });
  }, [reports, query, filterStatus]);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.world || !newReport.locationId) return;

    const etaISO = new Date(Date.now() + 30 * 60000).toISOString(); // Default 30min from now
    
    onAdd({
      world: parseInt(newReport.world),
      locationId: newReport.locationId,
      region: newReport.region,
      size: parseInt(newReport.size),
      status: newReport.status,
      etaISO,
      reporter: newReport.reporter || undefined,
      note: newReport.note || undefined,
    });

    setNewReport({
      world: "",
      locationId: "",
      region: "Misthalin",
      size: "5",
      status: "predicted",
      reporter: "",
      note: "",
    });
    setShowAddForm(false);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Star Reports</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
        >
          {showAddForm ? "Cancel" : "Add Report"}
        </button>
      </div>

      {/* Add Report Form */}
      {showAddForm && (
        <form onSubmit={handleSubmitReport} className="mb-4 p-3 bg-slate-800 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="World"
              value={newReport.world}
              onChange={(e) => setNewReport(prev => ({ ...prev, world: e.target.value }))}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
              required
            />
            <select
              value={newReport.region}
              onChange={(e) => setNewReport(prev => ({ ...prev, region: e.target.value }))}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
            >
              <option>Misthalin</option>
              <option>Asgarnia</option>
              <option>Kandarin</option>
              <option>Wilderness</option>
              <option>Kharidian Desert</option>
              <option>Pisc/Gnome/Tirannwn</option>
              <option>Frem/Lunar</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Location (e.g., varrock_east)"
            value={newReport.locationId}
            onChange={(e) => setNewReport(prev => ({ ...prev, locationId: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newReport.size}
              onChange={(e) => setNewReport(prev => ({ ...prev, size: e.target.value }))}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(size => (
                <option key={size} value={size}>Size {size}</option>
              ))}
            </select>
            <select
              value={newReport.status}
              onChange={(e) => setNewReport(prev => ({ ...prev, status: e.target.value as any }))}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
            >
              <option value="predicted">Predicted</option>
              <option value="landed">Landed</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={newReport.reporter}
            onChange={(e) => setNewReport(prev => ({ ...prev, reporter: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={newReport.note}
            onChange={(e) => setNewReport(prev => ({ ...prev, note: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm"
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 rounded py-2 text-sm font-medium"
          >
            Add Report
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-3">
        <input
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1"
          placeholder="Search world / region / note"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="predicted">Predicted</option>
          <option value="landed">Landed</option>
          <option value="finished">Finished</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
        {filteredReports.length === 0 && (
          <div className="text-slate-500 text-sm">No reports yet.</div>
        )}
        {filteredReports.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-slate-400">World {r.world}</div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  r.status === "predicted"
                    ? "border-yellow-400/40 text-yellow-300"
                    : r.status === "landed"
                    ? "border-green-400/40 text-green-300"
                    : "border-slate-400/40 text-slate-300"
                }`}
              >
                {r.status.toUpperCase()}
              </span>
            </div>
            <div className="font-medium mt-1">{locName(r.locationId)}</div>
            <div className="text-xs text-slate-400">{r.region}</div>
            <div className="text-sm mt-1">Window: {formatTimeWindow(r)}</div>
            <div className="text-sm mt-1">Stage: {stageLabel(r.size)}</div>
            {r.reporter && (
              <div className="text-xs text-slate-400">By: {r.reporter}</div>
            )}
            {r.note && <div className="text-xs text-slate-300">Note: {r.note}</div>}

            <div className="flex gap-2 mt-2">
              <button
                className="px-2 py-1 rounded-lg border border-slate-700 text-xs hover:bg-slate-800"
                onClick={() => onRemove(r.id)}
              >
                Remove
              </button>
              {r.status !== "landed" && (
                <button
                  className="px-2 py-1 rounded-lg bg-slate-100 text-slate-900 text-xs hover:bg-slate-200"
                  onClick={() => onUpdate({ ...r, status: "landed" })}
                >
                  Mark Landed
                </button>
              )}
              {r.status === "landed" && (
                <button
                  className="px-2 py-1 rounded-lg border border-slate-700 text-xs hover:bg-slate-800"
                  onClick={() => onUpdate({ ...r, status: "finished" })}
                >
                  Mark Finished
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-500">
        Data is stored locally in your browser for this prototype.
      </div>
    </div>
  );
}
