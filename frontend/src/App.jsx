import { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Backpack,
  BatteryCharging,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Gauge,
  History,
  LayoutGrid,
  Map,
  MapPinned,
  Pencil,
  Plus,
  ShieldCheck,
  Thermometer,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import "./App.css";
import { useRobotWebSocket } from "./hooks/useRobotWebSocket";
import { fetchResource, loginRequest } from "./services/api";

const ROBOT_ID = "ESP32_ROBOT_01";
const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

const adminNavItems = [
  { key: "dashboard", label: "Tableau de bord", icon: LayoutGrid },
  { key: "carte", label: "Carte", icon: Map },
  { key: "missions", label: "Missions", icon: ClipboardList },
  { key: "equipements", label: "Équipements", icon: Backpack },
  { key: "agents", label: "Agents", icon: Users },
  { key: "rapports", label: "Rapports", icon: FileText },
];

const adminPageMeta = {
  dashboard: {
    title: "Tableau de bord",
    sub: "Municipalité de Tunis — Secteur Centre-ville",
  },
  carte: {
    title: "Carte",
    sub: "Localisation des agents et zones d’intervention",
  },
  missions: {
    title: "Missions",
    sub: "Planification et suivi des opérations de collecte",
  },
  equipements: {
    title: "Équipements",
    sub: "Parc de sacs à dos connectés",
  },
  agents: {
    title: "Agents",
    sub: "Équipe de terrain et performance",
  },
  rapports: {
    title: "Rapports",
    sub: "Export des données d’activité",
  },
};

const equipmentData = [
  {
    name: "Sac #01",
    agent: "Karim T.",
    battery: 82,
    weight: 6.4,
    temp: 38,
    status: "actif",
  },
  {
    name: "Sac #02",
    agent: "Salma R.",
    battery: 24,
    weight: 4.1,
    temp: 41,
    status: "actif",
  },
  {
    name: "Sac #03",
    agent: "Yassine H.",
    battery: 9,
    weight: 2.8,
    temp: 52,
    status: "maint",
  },
  {
    name: "Sac #04",
    agent: "Non affecté",
    battery: 0,
    weight: 0,
    temp: 0,
    status: "hs",
  },
  {
    name: "Sac #05",
    agent: "Nour A.",
    battery: 91,
    weight: 5.7,
    temp: 36,
    status: "actif",
  },
  {
    name: "Sac #06",
    agent: "Mehdi K.",
    battery: 58,
    weight: 3.9,
    temp: 39,
    status: "actif",
  },
];

const weeklyCollect = [
  { day: "Lun", value: 268 },
  { day: "Mar", value: 301 },
  { day: "Mer", value: 245 },
  { day: "Jeu", value: 288 },
  { day: "Ven", value: 334 },
  { day: "Sam", value: 190 },
  { day: "Auj", value: 312 },
];

const notifications = [
  {
    icon: "battery",
    bg: "var(--amber-bg)",
    color: "var(--amber)",
    text: "Sac #02 — batterie faible (24%)",
    time: "Il y a 4 min",
  },
  {
    icon: "alert",
    bg: "var(--red-bg)",
    color: "var(--red)",
    text: "Sac #03 — température moteur élevée",
    time: "Il y a 12 min",
  },
  {
    icon: "pin",
    bg: "var(--green-bg)",
    color: "var(--green)",
    text: "Yassine H. arrivé rue Ibn Khaldoun",
    time: "Il y a 18 min",
  },
  {
    icon: "check",
    bg: "var(--green-bg)",
    color: "var(--green)",
    text: 'Mission "Souk Centre" terminée',
    time: "Il y a 41 min",
  },
];

const missions = [
  {
    name: "Souk Centre-ville",
    zone: "Zone A2",
    agent: "Karim T.",
    date: "28/07",
    progress: 80,
  },
  {
    name: "Avenue Habib Bourguiba",
    zone: "Zone B1",
    agent: "Salma R.",
    date: "28/07",
    progress: 45,
  },
  {
    name: "Quartier Bab Souika",
    zone: "Zone C3",
    agent: "Yassine H.",
    date: "28/07",
    progress: 15,
  },
  {
    name: "Place de la Kasbah",
    zone: "Zone A1",
    agent: "Nour A.",
    date: "27/07",
    progress: 100,
  },
  {
    name: "Rue de Marseille",
    zone: "Zone D2",
    agent: "Mehdi K.",
    date: "27/07",
    progress: 100,
  },
  {
    name: "Marché Sidi Bahri",
    zone: "Zone B3",
    agent: "Non affecté",
    date: "29/07",
    progress: 0,
  },
];

const agents = [
  {
    name: "Karim T.",
    zone: "Secteur A",
    routes: 27,
    collected: 124.8,
    score: 92,
  },
  {
    name: "Salma R.",
    zone: "Secteur B",
    routes: 23,
    collected: 111.6,
    score: 88,
  },
  {
    name: "Yassine H.",
    zone: "Secteur C",
    routes: 18,
    collected: 95.4,
    score: 76,
  },
  {
    name: "Nour A.",
    zone: "Secteur A",
    routes: 26,
    collected: 119.2,
    score: 94,
  },
];

const reports = [
  {
    title: "Rapport hebdomadaire",
    subtitle: "Synthèse de collecte et d’activité",
    type: "PDF",
  },
  {
    title: "Bilan équipement",
    subtitle: "État des batteries et maintenance",
    type: "Excel",
  },
  {
    title: "Performance agents",
    subtitle: "Suivi des agents et des missions",
    type: "PDF",
  },
];

const loginRoleContent = {
  agent: {
    formTitle: "Connexion Agent",
    formSub:
      "Accédez à votre espace de mission et à l’état de votre équipement.",
    loginLabel: "Identifiant agent",
    showcaseTitle: "Suivez votre équipement et vos missions en temps réel",
    showcaseSub:
      "Batterie, poids collecté et missions du jour, directement depuis votre espace.",
    helper:
      "Votre sac connecté sera automatiquement associé à votre compte après connexion.",
  },
  superviseur: {
    formTitle: "Connexion Superviseur",
    formSub: "Suivez les équipes et les statistiques de votre secteur.",
    loginLabel: "Identifiant superviseur",
    showcaseTitle: "Pilotez les équipes de votre secteur",
    showcaseSub:
      "Disponibilité des agents, performance et rapports de votre zone de responsabilité.",
    helper:
      "Vous n’aurez accès qu’aux équipes et zones placées sous votre responsabilité.",
  },
};

const agentMissions = [
  {
    name: "Souk Centre-ville",
    zone: "Zone A2",
    date: "Aujourd’hui",
    progress: 100,
  },
  {
    name: "Avenue Habib Bourguiba",
    zone: "Zone A1",
    date: "Aujourd’hui",
    progress: 60,
  },
  {
    name: "Rue Ibn Khaldoun",
    zone: "Zone A3",
    date: "Aujourd’hui",
    progress: 0,
  },
  { name: "Marché Bab Souika", zone: "Zone A2", date: "Hier", progress: 100 },
  { name: "Place de la Kasbah", zone: "Zone A1", date: "Hier", progress: 100 },
];

const historyRows = [
  { date: "28/07", zone: "Zone A2 · Souk Centre", kg: 18.4, time: "4h 12" },
  { date: "27/07", zone: "Zone A1 · Kasbah", kg: 21.1, time: "5h 05" },
  { date: "26/07", zone: "Zone A3 · Bab Souika", kg: 16.7, time: "3h 48" },
  {
    date: "25/07",
    zone: "Zone A2 · Avenue Bourguiba",
    kg: 19.9,
    time: "4h 30",
  },
  { date: "24/07", zone: "Zone A1 · Centre-ville", kg: 14.2, time: "3h 15" },
];

function formatStatusValue(status) {
  if (status === "actif") return { label: "Actif", className: "status-actif" };
  if (status === "maint")
    return { label: "Maintenance", className: "status-maint" };
  return { label: "Hors service", className: "status-hs" };
}

function getRingSvg(value, color) {
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
      <circle
        cx="22"
        cy="22"
        r={radius}
        fill="none"
        stroke="#E1E8E2"
        strokeWidth="4"
      />
      <circle
        cx="22"
        cy="22"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function getMissionBadge(progress) {
  if (progress === 100) return { className: "tag-done", label: "Terminée" };
  if (progress > 0) return { className: "tag-progress", label: "En cours" };
  return { className: "tag-todo", label: "À faire" };
}

function MetricRow({ label, value, icon: Icon }) {
  return (
    <div className="metric-row">
      <div className="metric-row-label">
        <Icon size={15} />
        <span>{label}</span>
      </div>
      <span className="metric-row-val mono">{value}</span>
    </div>
  );
}

function KpiCard({ label, value, delta, tone = "up" }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">
        <span>{label}</span>
      </div>
      <div className="kpi-val mono">{value}</div>
      <div className={`kpi-delta ${tone}`}>{delta}</div>
    </div>
  );
}

function EquipmentCard({ equipment }) {
  const status = formatStatusValue(equipment.status);
  const color =
    equipment.battery > 40
      ? "#1F8F5C"
      : equipment.battery > 15
        ? "#B0730D"
        : "#C13B35";

  return (
    <div className="eq-card">
      <div className="eq-top">
        <div>
          <div className="eq-name">{equipment.name}</div>
          <div className="eq-agent">{equipment.agent}</div>
        </div>
        <span className={`eq-status ${status.className}`}>{status.label}</span>
      </div>
      <div className="ring-row">
        <div className="ring">
          {getRingSvg(equipment.battery, color)}
          <div className="ring-val mono">{equipment.battery}%</div>
        </div>
        <div className="eq-metrics">
          Poids collecté <b>{equipment.weight} kg</b>
          <br />
          Température <b>{equipment.temp}°C</b>
        </div>
      </div>
    </div>
  );
}

function CrudPanel({
  title,
  path,
  items,
  fields,
  token,
  onChanged,
  actionsRef,
  children,
}) {
  const emptyForm = Object.fromEntries(fields.map((field) => [field.name, ""]));
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const update = (name, value) =>
    setForm((current) => ({ ...current, [name]: value }));
  actionsRef.current = { startEdit, remove };

  function startEdit(item) {
    setEditingId(item.id);
    setForm(
      Object.fromEntries(
        fields.map((field) => [field.name, item[field.name] ?? ""]),
      ),
    );
    setError("");
    setIsOpen(true);
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    const body = Object.fromEntries(
      fields
        .filter((field) => form[field.name] !== "")
        .map((field) => [
          field.name,
          field.type === "number" ? Number(form[field.name]) : form[field.name],
        ]),
    );
    if (path === "/users" && !editingId) body.role = "AGENT";
    const uniqueField = fields.find((field) => field.unique);
    if (
      uniqueField &&
      items.some(
        (item) =>
          item.id !== editingId &&
          String(item[uniqueField.name]).toLowerCase() ===
            String(form[uniqueField.name]).trim().toLowerCase(),
      )
    ) {
      setError(`${uniqueField.label} existe déjà`);
      return;
    }
    try {
      await fetchResource(editingId ? `${path}/${editingId}` : path, token, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      setForm(emptyForm);
      setEditingId(null);
      setIsOpen(false);
      onChanged();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function remove(id) {
    if (!window.confirm("Supprimer cet élément ?")) return;
    try {
      await fetchResource(`${path}/${id}`, token, { method: "DELETE" });
      onChanged();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <section className="panel-card crud-panel">
      <div className="card-head">
        <div className="card-title">{title}</div>
        <button
          type="button"
          className="btn-add"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setError("");
            setIsOpen(true);
          }}
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>
      {isOpen && (
        <div className="modal-overlay active" role="dialog" aria-modal="true">
          <form onSubmit={submit} className="modal-box">
            <div className="modal-head">
              <div className="modal-title">
                {editingId ? "Modifier" : "Nouvel élément"}
              </div>
              <button
                type="button"
                className="modal-close"
                aria-label="Fermer"
                onClick={() => setIsOpen(false)}
              >
                <X size={15} />
              </button>
            </div>
            <div className="crud-form">
              {fields.map((field) => (
                <label className="field" key={field.name}>
                  {field.label}
                  {field.options ? (
                    <select
                      value={form[field.name]}
                      onChange={(event) =>
                        update(field.name, event.target.value)
                      }
                      required={field.required && !editingId}
                    >
                      <option value="">Choisir</option>
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={form[field.name]}
                      onChange={(event) =>
                        update(field.name, event.target.value)
                      }
                      required={field.required && !editingId}
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="modal-foot">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsOpen(false)}
              >
                Annuler
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? "Enregistrer" : "Créer"}
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      {children}
    </section>
  );
}

function RobotTelemetryPanel({ measurement, connected }) {
  const [commandStatus, setCommandStatus] = useState("");
  const sendCommand = async (command) => {
    try {
      const response = await fetch(`${API_URL}/robots/${ROBOT_ID}/${command}`, {
        method: "POST",
      });
      const result = await response.json();
      setCommandStatus(
        response.ok ? `Commande ${result.command} envoyée` : result.error,
      );
    } catch {
      setCommandStatus("Backend indisponible");
    }
  };

  if (!measurement) {
    return (
      <div className="panel-card">
        <div className="card-title">Robot {ROBOT_ID}</div>
        <p>
          {connected
            ? "En attente de la première mesure..."
            : "Connexion temps réel indisponible"}
        </p>
      </div>
    );
  }

  return (
    <div className="panel-card">
      <div className="card-head">
        <div>
          <div className="card-title">
            Télémétrie réelle · {measurement.deviceId}
          </div>
          <div className="card-link">
            {connected ? "WebSocket connecté" : "Reconnexion..."}
          </div>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="btn"
            onClick={() => sendCommand("status")}
          >
            Actualiser
          </button>
        </div>
      </div>
      <div className="eq-grid wide">
        <div className="eq-card">
          <div className="eq-name">Poids</div>
          <div className="kpi-val mono">{measurement.weightKg} kg</div>
          <div className="eq-agent">Charge brute: {measurement.weight}</div>
        </div>
        <div className="eq-card">
          <div className="eq-name">Batterie</div>
          <div className="kpi-val mono">{measurement.batteryPercentage}%</div>
          <div className="eq-agent">{measurement.batteryVoltage} V</div>
        </div>
        <div className="eq-card">
          <div className="eq-name">Bac</div>
          <div className="kpi-val">{measurement.binStatus}</div>
          <div className="eq-agent">
            GPS:{" "}
            {measurement.gpsFix
              ? `${measurement.latitude}, ${measurement.longitude}`
              : "Sans fix"}{" "}
            · {measurement.satellites} sat.
          </div>
        </div>
        <div className="eq-card">
          <div className="eq-name">Moteur / Wi-Fi</div>
          <div className="kpi-val mono">
            {measurement.motorRunning ? "ON" : "OFF"} · {measurement.motorSpeed}
          </div>
          <div className="eq-agent">RSSI {measurement.wifiRssi} dBm</div>
        </div>
      </div>
      {commandStatus && <div className="card-link">{commandStatus}</div>}
    </div>
  );
}

function SidebarNav({ items, activeKey, onSelect }) {
  return (
    <nav className="sidebar-nav" aria-label="Navigation principale">
      {items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          className={`nav-item ${activeKey === key ? "active" : ""}`}
          onClick={() => onSelect(key)}
        >
          <Icon size={16} />
          <span>{label}</span>
          {key === "missions" && <span className="nav-badge">2</span>}
        </button>
      ))}
    </nav>
  );
}

function AdminDashboard({ onLogout, token }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [realMissions, setRealMissions] = useState([]);
  const [realAgents, setRealAgents] = useState([]);
  const [realEquipment, setRealEquipment] = useState([]);
  const missionCrud = useRef({});
  const equipmentCrud = useRef({});
  const agentCrud = useRef({});
  const { measurement: liveMeasurement, connected } = useRobotWebSocket();

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetchResource("/missions", token),
      fetchResource("/users", token),
      fetchResource("/aspirateurs", token),
    ])
      .then(([missionsData, usersData, equipmentDataFromApi]) => {
        setRealMissions(missionsData);
        setRealAgents(usersData.filter((item) => item.role === "AGENT"));
        setRealEquipment(equipmentDataFromApi);
      })
      .catch(() => undefined);
  }, [token]);

  const displayedMissions = realMissions.map((item) => ({
    name: item.locationName,
    zone: item.address || "Zone non renseignée",
    agent: item.agent
      ? `${item.agent.firstName} ${item.agent.lastName}`
      : "Non affecté",
    date: item.startTime
      ? new Date(item.startTime).toLocaleDateString("fr-FR")
      : "Non planifiée",
    progress:
      item.status === "TERMINEE" ? 100 : item.status === "EN_COURS" ? 50 : 0,
  }));
  const displayedAgents = realAgents.map((item) => ({
    name: `${item.firstName} ${item.lastName}`,
    zone: item.phone || "Agent",
    routes: realMissions.filter((mission) => mission.agentId === item.id)
      .length,
    collected: 0,
    score: item.isActive ? 100 : 0,
  }));
  const displayedEquipment = realEquipment.map((item) => ({
    name: item.reference,
    agent: "Non affecté",
    battery: item.batteryLevel,
    weight: item.currentWeight,
    temp: 0,
    status:
      item.status === "ACTIVE"
        ? "actif"
        : item.status === "MAINTENANCE"
          ? "maint"
          : "hs",
  }));
  const reload = (path, setter) => () =>
    fetchResource(path, token)
      .then(setter)
      .catch(() => undefined);
  const currentMeta = useMemo(() => adminPageMeta[activeTab], [activeTab]);
  const robotCards = realEquipment.map((robot) => {
    const latest =
      liveMeasurement?.deviceId === robot.reference
        ? liveMeasurement
        : robot.measurements?.[0];
    return {
      ...robot,
      measurement: latest,
      battery: latest?.batteryPercentage ?? robot.batteryLevel,
      weight: latest?.weightKg ?? robot.currentWeight,
      binStatus: latest?.binStatus ?? "Aucune mesure",
      motorRunning: latest?.motorRunning ?? false,
      gps: latest?.gpsFix
        ? `${latest.latitude}, ${latest.longitude}`
        : "Sans fix GPS",
    };
  });

  const renderPageContent = () => {
    if (activeTab === "carte") {
      return (
        <div className="panel-card map-card">
          <div className="card-head">
            <div className="card-title">Carte des interventions</div>
            <div className="card-link">Zone active</div>
          </div>
          <div className="map-area tall">
            <div
              className="zone zone-clean"
              style={{ left: "18%", top: "18%", width: "42%", height: "26%" }}
            />
            <div
              className="zone zone-clean"
              style={{ right: "12%", top: "28%", width: "26%", height: "24%" }}
            />
            <div
              className="zone zone-todo"
              style={{
                left: "40%",
                bottom: "18%",
                width: "30%",
                height: "20%",
              }}
            />
            <div
              className="zone zone-todo"
              style={{
                left: "18%",
                bottom: "12%",
                width: "24%",
                height: "18%",
              }}
            />
            <div className="agent-dot" style={{ left: "32%", top: "24%" }} />
            <div className="agent-dot" style={{ left: "59%", top: "38%" }} />
            <div className="agent-dot" style={{ left: "46%", bottom: "24%" }} />
          </div>
          <div className="map-legend">
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: "rgba(31,143,92,.20)" }}
              />{" "}
              Zones nettoyées
            </div>
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: "rgba(193,59,53,.12)" }}
              />{" "}
              À traiter
            </div>
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: "var(--green)" }}
              />{" "}
              Agents
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "missions") {
      return (
        <CrudPanel
          actionsRef={missionCrud}
          title="Toutes les missions"
          path="/missions"
          items={realMissions}
          token={token}
          onChanged={reload("/missions", setRealMissions)}
          fields={[
            {
              name: "agentId",
              label: "Agent",
              type: "number",
              required: true,
              options: realAgents.map((item) => ({
                value: item.id,
                label: `${item.firstName} ${item.lastName} (ID ${item.id})`,
              })),
            },
            {
              name: "aspirateurId",
              label: "Aspirateur",
              type: "number",
              required: true,
              options: realEquipment.map((item) => ({
                value: item.id,
                label: `${item.reference} (ID ${item.id})`,
              })),
            },
            { name: "locationName", label: "Lieu", required: true },
            { name: "address", label: "Adresse" },
            {
              name: "latitude",
              label: "Latitude",
              type: "number",
              required: true,
            },
            {
              name: "longitude",
              label: "Longitude",
              type: "number",
              required: true,
            },
            {
              name: "status",
              label: "Statut",
              options: ["PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"].map(
                (option) => ({ value: option, label: option }),
              ),
            },
            { name: "notes", label: "Notes" },
          ]}
        >
          <div className="card-head">
            <div className="card-link">{realMissions.length} mission(s)</div>
          </div>
          <table className="list">
            <thead>
              <tr>
                <th>Mission</th>
                <th>Zone</th>
                <th>Agent</th>
                <th>Date</th>
                <th>Progression</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {realMissions.map((mission) => (
                <tr key={`${mission.name}-${mission.date}`}>
                  <td>{mission.locationName}</td>
                  <td>{mission.address || "Zone non renseignée"}</td>
                  <td>
                    {mission.agent
                      ? `${mission.agent.firstName} ${mission.agent.lastName}`
                      : "Non affecté"}
                  </td>
                  <td className="mono">
                    {mission.startTime
                      ? new Date(mission.startTime).toLocaleDateString("fr-FR")
                      : "Non planifiée"}
                  </td>
                  <td style={{ width: "150px" }}>
                    <div className="mission-bar-bg">
                      <div
                        className="mission-bar-fill"
                        style={{
                          width: `${mission.status === "TERMINEE" ? 100 : mission.status === "EN_COURS" ? 50 : 0}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="action-icons">
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="Modifier"
                        title="Modifier"
                        onClick={() => missionCrud.current.startEdit(mission)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn danger"
                        aria-label="Supprimer"
                        title="Supprimer"
                        onClick={() => missionCrud.current.remove(mission.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CrudPanel>
      );
    }

    if (activeTab === "equipements") {
      return (
        <CrudPanel
          actionsRef={equipmentCrud}
          title="Parc d’équipements"
          path="/aspirateurs"
          items={realEquipment}
          token={token}
          onChanged={reload("/aspirateurs", setRealEquipment)}
          fields={[
            {
              name: "reference",
              label: "Référence / Device ID",
              required: true,
              unique: true,
            },
            {
              name: "status",
              label: "Statut",
              options: ["ACTIVE", "INACTIVE", "OFFLINE", "MAINTENANCE"].map(
                (option) => ({ value: option, label: option }),
              ),
            },
          ]}
        >
          <div className="card-head">
            <div className="card-link">
              {realEquipment.length} équipement(s)
            </div>
          </div>
          <div className="eq-grid wide">
            {realEquipment.map((item) => (
              <div key={item.id} className="eq-card">
                <div className="eq-top">
                  <div>
                    <div className="eq-name">{item.reference}</div>
                    <div className="eq-agent">ID {item.id}</div>
                  </div>
                  <span
                    className={`eq-status ${item.status === "ACTIVE" ? "status-actif" : "status-hs"}`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="eq-metrics equipment-details">
                  Batterie <b>{item.batteryLevel}%</b>
                  <br />
                  Poids <b>{item.currentWeight} kg</b>
                </div>
                <div className="action-icons">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Modifier"
                    title="Modifier"
                    onClick={() => equipmentCrud.current.startEdit(item)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn danger"
                    aria-label="Supprimer"
                    title="Supprimer"
                    onClick={() => equipmentCrud.current.remove(item.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CrudPanel>
      );
    }

    if (activeTab === "agents") {
      return (
        <CrudPanel
          actionsRef={agentCrud}
          title="Équipe de terrain"
          path="/users"
          items={realAgents}
          token={token}
          onChanged={reload("/users", (items) =>
            setRealAgents(items.filter((item) => item.role === "AGENT")),
          )}
          fields={[
            { name: "firstName", label: "Prénom", required: true },
            { name: "lastName", label: "Nom", required: true },
            { name: "email", label: "Email", required: true },
            {
              name: "password",
              label: "Mot de passe",
              type: "password",
              required: true,
            },
            { name: "phone", label: "Téléphone" },
          ]}
        >
          <div className="card-head">
            <div className="card-link">{realAgents.length} agent(s)</div>
          </div>
          <div className="agent-grid">
            {realAgents.map((agent) => (
              <div key={agent.name} className="agent-card">
                <div className="agent-head">
                  <div className="agent-avatar">
                    {`${agent.firstName} ${agent.lastName}`
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="agent-name">
                      {agent.firstName} {agent.lastName}
                    </div>
                    <div className="agent-zone">{agent.email}</div>
                  </div>
                </div>
                <div className="agent-stats">
                  <div>
                    <div className="agent-stat-val mono">
                      {
                        realMissions.filter(
                          (mission) => mission.agentId === agent.id,
                        ).length
                      }
                    </div>
                    <div className="agent-stat-label">Routes</div>
                  </div>
                  <div>
                    <div className="agent-stat-val mono">0 kg</div>
                    <div className="agent-stat-label">Collecte</div>
                  </div>
                  <div>
                    <div className="agent-stat-val mono">
                      {agent.isActive ? 100 : 0}%
                    </div>
                    <div className="agent-stat-label">Score</div>
                  </div>
                </div>
                <div className="action-icons">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Modifier"
                    title="Modifier"
                    onClick={() => agentCrud.current.startEdit(agent)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn danger"
                    aria-label="Supprimer"
                    title="Supprimer"
                    onClick={() => agentCrud.current.remove(agent.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CrudPanel>
      );
    }

    if (activeTab === "rapports") {
      return (
        <div className="panel-card">
          <div className="card-head">
            <div className="card-title">Exports de rapport</div>
            <div className="card-link">Formats disponibles</div>
          </div>
          <div className="report-grid">
            {reports.map((report) => (
              <div key={report.title} className="report-card">
                <div className="report-icon">
                  {report.type === "PDF" ? (
                    <FileText size={18} />
                  ) : (
                    <Download size={18} />
                  )}
                </div>
                <div className="report-title">{report.title}</div>
                <div className="report-sub">{report.subtitle}</div>
                <button type="button" className="btn">
                  Export {report.type}
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="kpi-strip">
          <KpiCard
            label="Robots enregistrés"
            value={robotCards.length}
            delta={connected ? "WebSocket actif" : "Hors ligne"}
            tone={connected ? "up" : "flat"}
          />
          <KpiCard
            label="Robots mesurés"
            value={robotCards.filter((robot) => robot.measurement).length}
            delta="Dernières données reçues"
            tone="flat"
          />
          <KpiCard
            label="Batterie moyenne"
            value={
              robotCards.length
                ? `${Math.round(robotCards.reduce((total, robot) => total + robot.battery, 0) / robotCards.length)}%`
                : "—"
            }
            delta="Parc enregistré"
            tone="up"
          />
          <KpiCard
            label="Moteurs actifs"
            value={robotCards.filter((robot) => robot.motorRunning).length}
            delta="Selon dernière mesure"
            tone="up"
          />
        </div>

        <div className="panel-card">
          <div className="card-head">
            <div className="card-title">État de chaque robot</div>
            <div className="card-link">{robotCards.length} robot(s)</div>
          </div>
          <div className="eq-grid wide">
            {robotCards.map((robot) => (
              <div key={robot.id} className="eq-card robot-card">
                <div className="eq-top">
                  <div>
                    <div className="eq-name">{robot.reference}</div>
                    <div className="eq-agent">ID {robot.id}</div>
                  </div>
                  <span
                    className={`eq-status ${robot.status === "ACTIVE" ? "status-actif" : "status-hs"}`}
                  >
                    {robot.status}
                  </span>
                </div>
                <div className="robot-stat-grid">
                  <span>Bac</span>
                  <b>{robot.binStatus}</b>
                  <span>Batterie</span>
                  <b>{robot.battery}%</b>
                  <span>Poids</span>
                  <b>{robot.weight} kg</b>
                  <span>Moteur</span>
                  <b>{robot.motorRunning ? "ON" : "OFF"}</b>
                  <span>Position</span>
                  <b>{robot.gps}</b>
                </div>
              </div>
            ))}
            {!robotCards.length && (
              <p className="empty-state">Aucun robot enregistré.</p>
            )}
          </div>
        </div>

        <div className="grid-layout">
          <div className="panel-card">
            <div className="card-head">
              <div className="card-title">Collecte de la semaine</div>
              <div className="card-link">kg</div>
            </div>
            <div className="chart-wrap">
              <div
                className="bars"
                aria-label="Graphique de collecte hebdomadaire"
              >
                <p className="empty-state">Aucune collecte enregistrée.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-layout lower-grid">
          <div className="panel-card">
            <div className="card-head">
              <div className="card-title">Notifications</div>
              <div className="card-link">Temps réel</div>
            </div>
            <div className="notif-list">
              <p className="empty-state">Aucune notification.</p>
            </div>
          </div>

          <div className="panel-card">
            <div className="card-head">
              <div className="card-title">Missions actives</div>
              <div className="card-link">6 tâches</div>
            </div>
            <div className="mission-list">
              {displayedMissions.slice(0, 3).map((mission) => (
                <div key={mission.name} className="mission-item">
                  <div className="mission-top">
                    <div>
                      <div className="mission-name">{mission.name}</div>
                      <div className="mission-zone">
                        {mission.zone} · {mission.agent}
                      </div>
                    </div>
                    <div className="mono mission-progress">
                      {mission.progress}%
                    </div>
                  </div>
                  <div className="mission-bar-bg">
                    <div
                      className="mission-bar-fill"
                      style={{ width: `${mission.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel-card map-card">
          <div className="card-head">
            <div className="card-title">Carte des interventions</div>
            <div className="card-link">Zone active</div>
          </div>
          <div className="map-area tall">
            <div
              className="zone zone-clean"
              style={{ left: "16%", top: "16%", width: "40%", height: "24%" }}
            />
            <div
              className="zone zone-clean"
              style={{ right: "12%", top: "28%", width: "25%", height: "28%" }}
            />
            <div
              className="zone zone-todo"
              style={{
                left: "38%",
                bottom: "18%",
                width: "28%",
                height: "18%",
              }}
            />
            <div
              className="zone zone-todo"
              style={{
                left: "18%",
                bottom: "12%",
                width: "22%",
                height: "16%",
              }}
            />
            <div className="agent-dot" style={{ left: "34%", top: "28%" }} />
            <div className="agent-dot" style={{ left: "60%", top: "36%" }} />
            <div className="agent-dot" style={{ left: "48%", bottom: "24%" }} />
          </div>
          <div className="map-legend">
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: "rgba(31,143,92,.20)" }}
              />{" "}
              Zones nettoyées
            </div>
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: "rgba(193,59,53,.12)" }}
              />{" "}
              À traiter
            </div>
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: "var(--green)" }}
              />{" "}
              Agents
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">
            <Backpack size={18} strokeWidth={1.8} />
          </div>
          <div>
            <div className="brand-name">AspiroNet</div>
            <div className="brand-sub">Console admin</div>
          </div>
        </div>

        <div className="nav-group-label">Navigation</div>
        <SidebarNav
          items={adminNavItems}
          activeKey={activeTab}
          onSelect={setActiveTab}
        />

        <div className="sidebar-foot">
          <div className="avatar">KT</div>
          <div>
            <div className="foot-name">Karim T.</div>
            <div className="foot-role">Superviseur</div>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <h1>{currentMeta.title}</h1>
            <div className="sub-title">{currentMeta.sub}</div>
          </div>
          <div className="topbar-actions">
            <button type="button" className="logout-btn" onClick={onLogout}>
              Se déconnecter
            </button>
            <div className="clock-box">
              <span className="pulse-dot" />
              <span className="mono" id="clockText">
                --:--:--
              </span>
            </div>
          </div>
        </header>

        {renderPageContent()}
      </main>
    </div>
  );
}

function AgentDashboard({ onLogout, token, user }) {
  const [activeTab, setActiveTab] = useState("apercu");
  const [realAgentMissions, setRealAgentMissions] = useState([]);
  useEffect(() => {
    if (!token || !user) return;
    fetchResource("/missions", token)
      .then((items) => {
        setRealAgentMissions(items.filter((item) => item.agentId === user.id));
      })
      .catch(() => undefined);
  }, [token, user]);
  const agentMissionRows = realAgentMissions.map((item) => ({
    name: item.locationName,
    zone: item.address || "Zone non renseignée",
    date: item.startTime
      ? new Date(item.startTime).toLocaleDateString("fr-FR")
      : "Non planifiée",
    progress:
      item.status === "TERMINEE" ? 100 : item.status === "EN_COURS" ? 50 : 0,
  }));

  const currentPage = {
    apercu: {
      title: "Vue d’ensemble",
      subtitle: "Sac connecté #01 · Secteur A — Centre-ville",
    },
    missions: {
      title: "Mes missions",
      subtitle: "Missions qui vous sont attribuées",
    },
    historique: {
      title: "Historique",
      subtitle: "Vos collectes des derniers jours",
    },
  }[activeTab];

  const notifData = [
    {
      icon: "battery",
      bg: "var(--amber-bg)",
      color: "var(--amber)",
      text: "Batterie sous 25% — pensez à recharger",
      time: "Il y a 6 min",
    },
    {
      icon: "temp",
      bg: "var(--red-bg)",
      color: "var(--red)",
      text: "Température moteur élevée détectée",
      time: "Il y a 22 min",
    },
    {
      icon: "check",
      bg: "var(--green-bg)",
      color: "var(--green)",
      text: 'Mission "Souk Centre" marquée terminée',
      time: "Il y a 1h",
    },
    {
      icon: "pin",
      bg: "var(--green-bg)",
      color: "var(--green)",
      text: "Vous êtes arrivé dans la zone A2",
      time: "Il y a 1h 20",
    },
  ];

  const renderTabContent = () => {
    if (activeTab === "missions") {
      return (
        <div className="panel-card">
          <div className="card-head">
            <div className="card-title">Toutes mes missions</div>
            <div className="card-link">Cette semaine</div>
          </div>
          <table className="list">
            <thead>
              <tr>
                <th>Mission</th>
                <th>Zone</th>
                <th>Date</th>
                <th>Progression</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {agentMissionRows.map((mission) => {
                const badge = getMissionBadge(mission.progress);
                return (
                  <tr key={mission.name}>
                    <td>{mission.name}</td>
                    <td>{mission.zone}</td>
                    <td className="mono">{mission.date}</td>
                    <td style={{ width: "150px" }}>
                      <div className="mission-bar-bg">
                        <div
                          className="mission-bar-fill"
                          style={{ width: `${mission.progress}%` }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className={`mission-tag ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === "historique") {
      return (
        <div className="panel-card">
          <div className="card-head">
            <div className="card-title">Historique de collecte</div>
            <div className="card-link">7 derniers jours</div>
          </div>
          <table className="list">
            <thead>
              <tr>
                <th>Date</th>
                <th>Zone</th>
                <th>Poids</th>
                <th>Temps</th>
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row) => (
                <tr key={row.date}>
                  <td className="mono">{row.date}</td>
                  <td>{row.zone}</td>
                  <td className="mono">{row.kg} kg</td>
                  <td className="mono">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <>
        <div className="device-grid">
          <div className="panel-card device-card">
            <div className="big-ring">
              <svg
                viewBox="0 0 120 120"
                width="120"
                height="120"
                aria-hidden="true"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="#E1E8E2"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="#1F8F5C"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={
                    2 * Math.PI * 46 - (82 / 100) * (2 * Math.PI * 46)
                  }
                />
              </svg>
              <div className="big-ring-val">
                <div className="big-ring-num mono">82%</div>
                <div className="big-ring-label">Batterie</div>
              </div>
            </div>

            <div className="device-info">
              <div className="device-name">Sac connecté #01</div>
              <div className="device-status">
                <Activity size={12} /> Actif
              </div>
              <div className="metric-list">
                <MetricRow
                  label="Poids collecté"
                  value="18.4 kg"
                  icon={Gauge}
                />
                <MetricRow
                  label="Température moteur"
                  value="38°C"
                  icon={Thermometer}
                />
                <MetricRow
                  label="Zone de travail"
                  value="A2"
                  icon={MapPinned}
                />
              </div>
            </div>
          </div>

          <div className="panel-card">
            <div className="card-head">
              <div className="card-title">Alertes système</div>
              <div className="card-link">Live</div>
            </div>
            <div className="notif-list">
              {notifData.map((item) => {
                const iconMap = {
                  battery: <BatteryCharging size={15} />,
                  temp: <Thermometer size={15} />,
                  check: <CheckCircle2 size={15} />,
                  pin: <MapPinned size={15} />,
                };
                return (
                  <div key={item.text} className="notif-item">
                    <div
                      className="notif-icon"
                      style={{ background: item.bg, color: item.color }}
                    >
                      {iconMap[item.icon]}
                    </div>
                    <div>
                      <div className="notif-text">{item.text}</div>
                      <div className="notif-time">{item.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="stat-strip">
          <div className="stat-card">
            <div className="stat-label">Déchets collectés aujourd’hui</div>
            <div className="stat-val mono">18.4 kg</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Missions du jour</div>
            <div className="stat-val mono">2 / 3</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Temps de fonctionnement</div>
            <div className="stat-val mono">4h 12</div>
          </div>
        </div>

        <div className="panel-card">
          <div className="card-head">
            <div className="card-title">Mes missions du jour</div>
            <div className="card-link">{agentMissionRows.length} missions</div>
          </div>
          <div className="mission-list">
            {agentMissionRows.slice(0, 3).map((mission) => {
              const badge = getMissionBadge(mission.progress);
              return (
                <div key={mission.name} className="mission-item">
                  <div className="mission-top">
                    <div>
                      <div className="mission-name">{mission.name}</div>
                      <div className="mission-zone">{mission.zone}</div>
                    </div>
                    <span className={`mission-tag ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="mission-bar-bg">
                    <div
                      className="mission-bar-fill"
                      style={{ width: `${mission.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="dashboard-shell agent-shell">
      <aside className="sidebar agent-sidebar">
        <div className="brand-row">
          <div className="brand-mark">
            <Backpack size={18} strokeWidth={1.8} />
          </div>
          <div>
            <div className="brand-name">AspiroNet</div>
            <div className="brand-sub">Espace agent</div>
          </div>
        </div>

        <div className="nav-group-label">Mon activité</div>
        <nav className="sidebar-nav" aria-label="Navigation agent">
          {[
            { key: "apercu", label: "Vue d’ensemble", icon: LayoutGrid },
            { key: "missions", label: "Mes missions", icon: ClipboardList },
            { key: "historique", label: "Historique", icon: History },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`nav-item ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={16} />
              <span>{label}</span>
              {key === "missions" && <span className="nav-badge">2</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="avatar">KT</div>
          <div>
            <div className="foot-name">Karim T.</div>
            <div className="foot-role">Agent · Secteur A</div>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <h1>{currentPage.title}</h1>
            <div className="sub-title">{currentPage.subtitle}</div>
          </div>
          <div className="topbar-actions">
            <button type="button" className="logout-btn" onClick={onLogout}>
              Se déconnecter
            </button>
            <div className="clock-box">
              <span className="pulse-dot" />
              <span className="mono" id="agentClockText">
                --:--:--
              </span>
            </div>
          </div>
        </header>

        {renderTabContent()}
      </main>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [role, setRole] = useState("agent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const content = loginRoleContent[role];

  return (
    <div className="login-shell">
      <aside className="showcase-panel">
        <div className="showcase-top">
          <div className="brand-mark">
            <Backpack size={18} strokeWidth={1.8} />
          </div>
          <div>
            <div className="brand-name">AspiroNet</div>
            <div className="brand-sub">Gestion des sacs à dos connectés</div>
          </div>
        </div>

        <div className="showcase-mid">
          <h2>{content.showcaseTitle}</h2>
          <p>{content.showcaseSub}</p>
          <div className="metric-row">
            <div className="metric-card">
              <div className="metric-label">Sacs actifs</div>
              <div className="metric-val mono">11</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Batterie moy.</div>
              <div className="metric-val mono">67%</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Déchets / jour</div>
              <div className="metric-val mono">312 kg</div>
            </div>
          </div>
        </div>

        <div className="showcase-bot">
          Municipalité de Tunis · Plateforme de supervision
        </div>
      </aside>

      <main className="form-panel">
        <div className="form-box">
          <div className="form-head">
            <h1>{content.formTitle}</h1>
            <p>{content.formSub}</p>
          </div>

          <div
            className="role-tabs"
            role="tablist"
            aria-label="Sélecteur de rôle"
          >
            <button
              type="button"
              className={`role-tab ${role === "agent" ? "active" : ""}`}
              onClick={() => setRole("agent")}
            >
              <UserRound size={15} />
              Agent
            </button>
            <button
              type="button"
              className={`role-tab ${role === "superviseur" ? "active" : ""}`}
              onClick={() => setRole("superviseur")}
            >
              <ShieldCheck size={15} />
              Superviseur
            </button>
          </div>

          <div className="field">
            <label htmlFor="login-input">{content.loginLabel}</label>
            <input
              id="login-input"
              type="text"
              placeholder="ex. agent@municipalite.tn"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password-input">Mot de passe</label>
            <input
              id="password-input"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="field-row">
            <label className="remember">
              <input type="checkbox" defaultChecked />
              <span>Rester connecté</span>
            </label>
            <button type="button" className="forgot-link">
              Mot de passe oublié ?
            </button>
          </div>

          <button
            type="button"
            className="submit-btn"
            onClick={async () => {
              setError("");
              try {
                const data = await loginRequest(
                  email,
                  password,
                  role === "agent" ? "AGENT" : "SUPERVISEUR",
                );
                onLogin(data);
              } catch (loginError) {
                setError(loginError.message);
              }
            }}
          >
            <ArrowRight size={16} />
            Se connecter
          </button>
          {error && <div className="error-message">{error}</div>}

          <div className="divider">connexion sécurisée</div>

          <div className="helper-note">
            <ShieldCheck size={16} />
            <span>{content.helper}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem("ecobot-session");
    return stored ? JSON.parse(stored) : null;
  });
  const [screen, setScreen] = useState(() => {
    const stored = localStorage.getItem("ecobot-session");
    if (!stored) return "login";
    const savedSession = JSON.parse(stored);
    return savedSession.user.role === "AGENT" ? "agent" : "admin";
  });

  useMemo(() => {
    const updateClock = () => {
      const now = new Date();
      const clockTargets = [
        document.getElementById("clockText"),
        document.getElementById("agentClockText"),
      ];
      clockTargets.forEach((element) => {
        if (element) {
          element.textContent = now.toLocaleTimeString("fr-FR");
        }
      });
    };

    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, [screen]);

  const handleLogin = (data) => {
    const nextSession = { token: data.token, user: data.user };
    localStorage.setItem("ecobot-session", JSON.stringify(nextSession));
    setSession(nextSession);
    setScreen(data.user.role === "AGENT" ? "agent" : "admin");
  };

  if (screen === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (screen === "agent") {
    return (
      <AgentDashboard
        token={session?.token}
        user={session?.user}
        onLogout={() => {
          localStorage.removeItem("ecobot-session");
          setSession(null);
          setScreen("login");
        }}
      />
    );
  }

  return (
    <AdminDashboard
      token={session?.token}
      user={session?.user}
      onLogout={() => {
        localStorage.removeItem("ecobot-session");
        setSession(null);
        setScreen("login");
      }}
    />
  );
}

export default App;
