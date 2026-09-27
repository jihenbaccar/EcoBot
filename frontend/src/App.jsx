import { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Backpack,
  BatteryCharging,
  Bell,
  Camera,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Gauge,
  History,
  LayoutGrid,
  Map,
  MapPinned,
  Pencil,
  Play,
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
function LocationClickHandler({ onChange }) {
  useMapEvents({
    click: ({ latlng }) => {
      onChange("latitude", latlng.lat);
      onChange("longitude", latlng.lng);
    },
  });
  return null;
}

function OpenStreetMapPicker({ latitude, longitude, onChange }) {
  const position =
    latitude !== "" && longitude !== ""
      ? [Number(latitude), Number(longitude)]
      : null;

  return (
    <div className="location-picker">
      <MapContainer
        center={[36.8065, 10.1815]}
        zoom={13}
        className="google-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationClickHandler onChange={onChange} />
        {position && <Marker position={position} />}
      </MapContainer>
      <div className="field-hint">
        Cliquez sur la carte pour renseigner automatiquement les coordonnées.
      </div>
    </div>
  );
}

function MissionDetailsModal({
  mission,
  token,
  canUpload,
  canReview,
  onClose,
  onSaved,
}) {
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [zoomPhoto, setZoomPhoto] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setComment(mission?.reviewComment || "");
    setPhotos(mission?.photos || []);
    setZoomPhoto(null);
    setError("");
  }, [mission]);

  if (!mission) return null;

  const uploadPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    for (const file of files) {
      if (!file.type.startsWith("image/") || file.size > 5_000_000) {
        setError("Chaque photo doit être une image de moins de 5 Mo.");
        continue;
      }
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const photo = await fetchResource(
        `/missions/${mission.id}/photos`,
        token,
        {
          method: "POST",
          body: JSON.stringify({ dataUrl }),
        },
      );
      setPhotos((current) => [...current, photo]);
    }
    event.target.value = "";
    onSaved();
  };

  const removePhoto = async (photoId) => {
    try {
      await fetchResource(`/missions/${mission.id}/photos/${photoId}`, token, {
        method: "DELETE",
      });
      setPhotos((current) => current.filter((photo) => photo.id !== photoId));
      onSaved();
    } catch (removeError) {
      setError(removeError.message);
    }
  };

  const review = async (approval) => {
    await fetchResource(`/missions/${mission.id}/review`, token, {
      method: "POST",
      body: JSON.stringify({ approval, reviewComment: comment.trim() }),
    });
    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true">
      <div className="modal-box mission-details-modal">
        <div className="modal-head">
          <div>
            <div className="modal-title">Détails de la mission</div>
            <div className="field-hint">
              {mission.locationName} ·{" "}
              {mission.address || "Adresse non renseignée"}
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={15} />
          </button>
        </div>
        <div className="mission-detail-grid">
          <div>
            <span>Agent</span>
            <strong>
              {mission.agent
                ? `${mission.agent.firstName} ${mission.agent.lastName}`
                : "Non affecté"}
            </strong>
          </div>
          <div>
            <span>Date</span>
            <strong>
              {mission.startTime
                ? new Date(mission.startTime).toLocaleString("fr-FR")
                : "Non planifiée"}
            </strong>
          </div>
          <div>
            <span>Statut</span>
            <strong>{mission.status}</strong>
          </div>
          <div>
            <span>Déchets cumulés</span>
            <strong>
              {mission.collectes.reduce(
                (total, item) => total + Number(item.weight || 0),
                0,
              )}{" "}
              kg
            </strong>
          </div>
        </div>
        <div className="card-head">
          <div className="card-title">Photos du lieu</div>
          {canUpload && (
            <label className="btn-secondary photo-upload">
              Ajouter plusieurs photos
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={uploadPhotos}
              />
            </label>
          )}
        </div>
        <div className="detail-photo-grid">
          {photos.map((photo) => (
            <div className="detail-photo" key={photo.id}>
              <img
                src={photo.dataUrl}
                alt="Preuve de mission"
                onClick={() => setZoomPhoto(photo.dataUrl)}
              />
              {canUpload && (
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => removePhoto(photo.id)}
                  aria-label="Supprimer la photo"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {!photos.length && (
            <p className="empty-state">Aucune photo envoyée.</p>
          )}
        </div>
        {canReview && (
          <div className="review-box">
            <label className="field">
              Commentaire de validation
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Commentaire pour l'agent"
              />
            </label>
            <div className="modal-foot">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => review("INVALIDE")}
              >
                Invalider et remettre en cours
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => review("VALIDEE")}
              >
                Valider la mission
              </button>
            </div>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
      </div>
      {zoomPhoto && (
        <div className="photo-lightbox" onClick={() => setZoomPhoto(null)}>
          <img src={zoomPhoto} alt="Photo agrandie" />
        </div>
      )}
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
        fields.map((field) => [
          field.name,
          field.type === "datetime-local" && item[field.name]
            ? new Date(item[field.name]).toISOString().slice(0, 16)
            : (item[field.name] ?? ""),
        ]),
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
          field.type === "number"
            ? Number(form[field.name])
            : field.type === "datetime-local" && form[field.name]
              ? new Date(form[field.name]).toISOString()
              : form[field.name],
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
              {fields.map((field) =>
                field.type === "location-picker" ? (
                  <OpenStreetMapPicker
                    key={field.name}
                    latitude={form.latitude}
                    longitude={form.longitude}
                    onChange={update}
                  />
                ) : (
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
                ),
              )}
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
        </button>
      ))}
    </nav>
  );
}

function AdminDashboard({ onLogout, token, user }) {
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("ecobot-admin-tab") || "dashboard",
  );
  const [realMissions, setRealMissions] = useState([]);
  const [realAgents, setRealAgents] = useState([]);
  const [realEquipment, setRealEquipment] = useState([]);
  const [realCollectes, setRealCollectes] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [storedNotifications, setStoredNotifications] = useState([]);
  const [detailsMission, setDetailsMission] = useState(null);
  const missionCrud = useRef({});
  const equipmentCrud = useRef({});
  const agentCrud = useRef({});
  const { notification: liveNotification } = useRobotWebSocket();

  useEffect(() => {
    if (!liveNotification) return;
    setLiveNotifications((current) =>
      [liveNotification, ...current].slice(0, 20),
    );
  }, [liveNotification]);

  useEffect(() => {
    localStorage.setItem("ecobot-admin-tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!token) return;
    fetchResource("/missions", token)
      .then(setRealMissions)
      .catch(() => setRealMissions([]));
    fetchResource("/users", token)
      .then((usersData) =>
        setRealAgents(usersData.filter((item) => item.role === "AGENT")),
      )
      .catch(() => setRealAgents([]));
    fetchResource("/aspirateurs", token)
      .then(setRealEquipment)
      .catch(() => setRealEquipment([]));
    fetchResource("/collectes", token)
      .then(setRealCollectes)
      .catch(() => setRealCollectes([]));
  }, [token]);
  useEffect(() => {
    if (!token) return;
    fetchResource("/notifications", token)
      .then(setStoredNotifications)
      .catch(() => setStoredNotifications([]));
  }, [token]);

  const displayedMissions = realMissions.map((item) => ({
    id: item.id,
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
    status: item.status,
    approval: item.approval,
    reviewComment: item.reviewComment,
    collectedWeight: item.collectes.reduce(
      (total, collecte) => total + Number(collecte.weight || 0),
      0,
    ),
  }));
  const displayedAgents = realAgents.map((item) => ({
    id: item.id,
    name: `${item.firstName} ${item.lastName}`,
    zone: item.phone || "Agent",
    routes: realMissions.filter((mission) => mission.agentId === item.id)
      .length,
    collected: realCollectes
      .filter((collecte) => collecte.agentId === item.id)
      .reduce((total, collecte) => total + Number(collecte.weight || 0), 0),
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
  const missionStatusCounts = realMissions.reduce(
    (counts, mission) => ({
      ...counts,
      [mission.status]: (counts[mission.status] || 0) + 1,
    }),
    {},
  );
  const periodWeight = (startDate) =>
    realCollectes
      .filter((collecte) => new Date(collecte.collectedAt) >= startDate)
      .reduce((total, collecte) => total + Number(collecte.weight || 0), 0);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodStats = [
    { label: "Aujourd’hui", value: periodWeight(todayStart) },
    { label: "Cette semaine", value: periodWeight(weekStart) },
    { label: "Ce mois", value: periodWeight(monthStart) },
  ];
  const weeklyRanking = realAgents
    .map((agent) => ({
      ...agent,
      weight: realCollectes
        .filter(
          (collecte) =>
            collecte.agentId === agent.id &&
            new Date(collecte.collectedAt) >= weekStart,
        )
        .reduce((total, collecte) => total + Number(collecte.weight || 0), 0),
    }))
    .sort((first, second) => second.weight - first.weight);
  const notifications = [
    ...liveNotifications,
    ...storedNotifications.map((item) => ({
      id: `stored-${item.id}`,
      text: item.message,
      time: new Date(item.createdAt).toLocaleString("fr-FR"),
    })),
    ...realMissions
      .filter((mission) => mission.status === "EN_COURS")
      .map((mission) => ({
        id: `mission-${mission.id}`,
        text: `Mission en cours : ${mission.locationName}`,
        time: "État actuel",
      })),
    ...realCollectes.slice(0, 5).map((collecte) => ({
      id: `collecte-${collecte.id}`,
      text: `Nouvelle collecte : ${collecte.weight} kg`,
      time: new Date(collecte.collectedAt).toLocaleString("fr-FR"),
    })),
  ];
  const reload = (path, setter) => () =>
    fetchResource(path, token)
      .then(setter)
      .catch(() => undefined);
  const currentMeta = useMemo(() => adminPageMeta[activeTab], [activeTab]);

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
              name: "startTime",
              label: "Date et heure de la mission",
              type: "datetime-local",
            },
            {
              name: "latitude",
              label: "Latitude",
              type: "number",
            },
            {
              name: "longitude",
              label: "Longitude",
              type: "number",
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
                <th>Déchets cumulés</th>
                <th>Dernier commentaire</th>
                <th>Progression</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {realMissions.map((mission) => (
                <tr key={mission.id}>
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
                  <td className="mono">
                    {mission.collectes.reduce(
                      (total, collecte) => total + Number(collecte.weight || 0),
                      0,
                    )}{" "}
                    kg
                  </td>
                  <td>{mission.reviewComment || "Aucun commentaire"}</td>
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
                      <button
                        type="button"
                        className="icon-btn"
                        title="Voir les détails"
                        aria-label="Voir les détails"
                        onClick={() => setDetailsMission(mission)}
                      >
                        <Eye size={14} />
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
              <div key={agent.id} className="agent-card">
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
                    <div className="agent-stat-val mono">
                      {displayedAgents.find((item) => item.id === agent.id)
                        ?.collected || 0}{" "}
                      kg
                    </div>
                    <div className="agent-stat-label">Collecte</div>
                  </div>
                  <div>
                    <div className="agent-stat-val mono">
                      {agent.isActive
                        ? Math.min(
                            100,
                            Math.round(
                              (displayedAgents.find(
                                (item) => item.id === agent.id,
                              )?.collected || 0) / 10,
                            ),
                          )
                        : 0}
                      %
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
          {[
            ["Planifiées", missionStatusCounts.PLANIFIEE || 0],
            ["En cours", missionStatusCounts.EN_COURS || 0],
            ["Accomplies", missionStatusCounts.TERMINEE || 0],
            ["À refaire / annulées", missionStatusCounts.ANNULEE || 0],
          ].map(([label, value]) => (
            <KpiCard
              key={label}
              label={`Missions ${label.toLowerCase()}`}
              value={value}
              delta="Période actuelle"
              tone="flat"
            />
          ))}
        </div>
        <div className="panel-card">
          <div className="card-head">
            <div className="card-title">Collecte par période</div>
            <div className="card-link">Poids cumulé</div>
          </div>
          <div className="kpi-strip">
            {periodStats.map((stat) => (
              <KpiCard
                key={stat.label}
                label={stat.label}
                value={`${stat.value} kg`}
                delta="Collectes enregistrées"
                tone="up"
              />
            ))}
          </div>
        </div>
        <div className="grid-layout lower-grid">
          <div className="panel-card">
            <div className="card-head">
              <div className="card-title">Missions actives</div>
              <div className="card-link">
                {
                  realMissions.filter(
                    (mission) =>
                      mission.status !== "TERMINEE" &&
                      mission.status !== "ANNULEE",
                  ).length
                }{" "}
                tâche(s)
              </div>
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
          <div className="panel-card">
            <div className="card-head">
              <div className="card-title">Classement hebdomadaire</div>
              <div className="card-link">Déchets aspirés</div>
            </div>
            <div className="ranking-list">
              {weeklyRanking.map((agent, index) => (
                <div className="ranking-row" key={agent.id}>
                  <span className="ranking-position">{index + 1}</span>
                  <span className="ranking-name">
                    {agent.firstName} {agent.lastName}
                  </span>
                  <strong className="mono">{agent.weight} kg</strong>
                </div>
              ))}
              {!weeklyRanking.length && (
                <p className="empty-state">Aucun agent enregistré.</p>
              )}
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
      <MissionDetailsModal
        mission={detailsMission}
        token={token}
        canReview
        onClose={() => setDetailsMission(null)}
        onSaved={() => reload("/missions", setRealMissions)()}
      />
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">
            <Backpack size={18} strokeWidth={1.8} />
          </div>
          <div>
            <div className="brand-name">EcoBot</div>
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
          <div className="avatar">
            {`${user?.firstName || ""} ${user?.lastName || ""}`
              .split(" ")
              .filter(Boolean)
              .map((part) => part[0].toUpperCase())
              .join("")}
          </div>
          <div>
            <div className="foot-name">
              {user?.firstName} {user?.lastName}
            </div>
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
            <div className="notification-menu">
              <button
                type="button"
                className="notification-button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <Bell size={17} />
                {notifications.length > 0 && (
                  <span className="notification-count">
                    {notifications.length}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="notification-dropdown">
                  <div className="notification-title">Notifications</div>
                  {notifications.length ? (
                    notifications.map((notification) => (
                      <div className="notification-entry" key={notification.id}>
                        <div>{notification.text}</div>
                        <small>{notification.time}</small>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">Aucune notification.</div>
                  )}
                </div>
              )}
            </div>
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
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("ecobot-agent-tab") || "apercu",
  );
  const [realAgentMissions, setRealAgentMissions] = useState([]);
  const [realEquipment, setRealEquipment] = useState([]);
  const [realCollectes, setRealCollectes] = useState([]);
  const [detailsMission, setDetailsMission] = useState(null);
  const { measurement: liveMeasurement } = useRobotWebSocket();
  const refreshAgentMissions = () =>
    fetchResource("/missions", token)
      .then((items) =>
        setRealAgentMissions(items.filter((item) => item.agentId === user.id)),
      )
      .catch(() => undefined);
  const [missionActionError, setMissionActionError] = useState("");
  useEffect(() => {
    localStorage.setItem("ecobot-agent-tab", activeTab);
  }, [activeTab]);
  useEffect(() => {
    if (!token || !user) return;
    fetchResource("/missions", token)
      .then((items) => {
        setRealAgentMissions(items.filter((item) => item.agentId === user.id));
      })
      .catch(() => undefined);
    fetchResource("/aspirateurs", token)
      .then(setRealEquipment)
      .catch(() => setRealEquipment([]));
    fetchResource("/collectes", token)
      .then((items) =>
        setRealCollectes(items.filter((item) => item.agentId === user.id)),
      )
      .catch(() => setRealCollectes([]));
  }, [token, user]);
  useEffect(() => {
    if (!token || !user || !liveMeasurement) return;
    fetchResource("/collectes", token)
      .then((items) =>
        setRealCollectes(items.filter((item) => item.agentId === user.id)),
      )
      .catch(() => undefined);
  }, [liveMeasurement, token, user]);
  const finishMission = async (missionId) => {
    setMissionActionError("");
    try {
      await fetchResource(`/missions/${missionId}/complete`, token, {
        method: "POST",
      });
      refreshAgentMissions();
    } catch (error) {
      setMissionActionError(error.message);
    }
  };
  const changeMissionStatus = async (missionId, status) => {
    setMissionActionError("");
    try {
      await fetchResource(`/missions/${missionId}/status`, token, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      refreshAgentMissions();
    } catch (error) {
      setMissionActionError(error.message);
    }
  };
  const agentMissionRows = realAgentMissions.map((item) => ({
    id: item.id,
    name: item.locationName,
    zone: item.address || "Zone non renseignée",
    date: item.startTime
      ? new Date(item.startTime).toLocaleDateString("fr-FR")
      : "Non planifiée",
    progress:
      item.status === "TERMINEE" ? 100 : item.status === "EN_COURS" ? 50 : 0,
    status: item.status,
    approval: item.approval,
    reviewComment: item.reviewComment,
    collectedWeight: item.collectes.reduce(
      (total, collecte) => total + Number(collecte.weight || 0),
      0,
    ),
  }));

  const assignedEquipment = realAgentMissions
    .map((mission) =>
      realEquipment.find((item) => item.id === mission.aspirateurId),
    )
    .find(Boolean);
  const today = new Date();
  const todayCollectes = realCollectes.filter((item) => {
    const date = new Date(item.collectedAt);
    return date.toDateString() === today.toDateString();
  });
  const todayWeight = todayCollectes.reduce(
    (total, item) => total + Number(item.weight || 0),
    0,
  );
  const activeMissions = realAgentMissions.filter(
    (mission) => mission.status !== "TERMINEE" && mission.status !== "ANNULEE",
  ).length;
  const currentZone = realAgentMissions.find(
    (mission) => mission.status === "EN_COURS",
  )?.address;
  const currentMission = realAgentMissions.find(
    (mission) => mission.status === "EN_COURS",
  );
  const currentBinWeight =
    liveMeasurement &&
    assignedEquipment &&
    liveMeasurement.deviceId === assignedEquipment.reference
      ? liveMeasurement.weightKg
      : assignedEquipment?.currentWeight;
  const currentMissionWeight = realCollectes
    .filter((collecte) => collecte.missionId === currentMission?.id)
    .reduce((total, collecte) => total + Number(collecte.weight || 0), 0);

  const currentPage = {
    apercu: {
      title: "Vue d’ensemble",
      subtitle: assignedEquipment
        ? `${assignedEquipment.reference} · ${user.firstName} ${user.lastName}`
        : `${user.firstName} ${user.lastName} · Aucun équipement affecté`,
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
            <div className="card-link">
              {agentMissionRows.length} mission(s)
            </div>
          </div>
          <table className="list">
            <thead>
              <tr>
                <th>Mission</th>
                <th>Zone</th>
                <th>Date</th>
                <th>Cumul aspiré</th>
                <th>Progression</th>
                <th>Statut</th>
                <th>Dernier commentaire</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {agentMissionRows.map((mission) => {
                const badge = getMissionBadge(mission.progress);
                return (
                  <tr key={mission.id}>
                    <td>{mission.name}</td>
                    <td>{mission.zone}</td>
                    <td className="mono">{mission.date}</td>
                    <td className="mono">{mission.collectedWeight} kg</td>
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
                      {mission.approval === "VALIDEE" && (
                        <div className="review-approved">Bien</div>
                      )}
                    </td>
                    <td>{mission.reviewComment || "Aucun commentaire"}</td>
                    <td>
                      <div className="action-icons">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Ajouter ou gérer les photos"
                          aria-label="Ajouter ou gérer les photos"
                          onClick={() =>
                            setDetailsMission(
                              realAgentMissions.find(
                                (item) => item.id === mission.id,
                              ),
                            )
                          }
                        >
                          <Camera size={14} />
                        </button>
                        {mission.status === "PLANIFIEE" && (
                          <button
                            type="button"
                            className="icon-btn action-start"
                            title="Démarrer la mission"
                            aria-label="Démarrer la mission"
                            onClick={() =>
                              changeMissionStatus(mission.id, "EN_COURS")
                            }
                          >
                            <Play size={14} />
                          </button>
                        )}
                        {mission.status === "EN_COURS" && (
                          <button
                            type="button"
                            className="icon-btn action-complete"
                            title="Terminer la mission"
                            aria-label="Terminer la mission"
                            onClick={() => finishMission(mission.id)}
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {(mission.status === "TERMINEE" ||
                          mission.status === "ANNULEE") && (
                          <button
                            type="button"
                            className="icon-btn action-start"
                            title="Reprendre la mission"
                            aria-label="Reprendre la mission"
                            onClick={() =>
                              changeMissionStatus(mission.id, "EN_COURS")
                            }
                          >
                            <Play size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="icon-btn"
                          title="Voir les détails"
                          aria-label="Voir les détails"
                          onClick={() =>
                            setDetailsMission(
                              realAgentMissions.find(
                                (item) => item.id === mission.id,
                              ),
                            )
                          }
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!agentMissionRows.length && (
                <tr>
                  <td colSpan="8" className="empty-state">
                    Aucune mission attribuée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {missionActionError && (
            <div className="error-message">{missionActionError}</div>
          )}
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
              {realCollectes.map((collecte) => (
                <tr key={collecte.id}>
                  <td className="mono">
                    {new Date(collecte.collectedAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td>
                    {collecte.mission?.locationName || "Zone non renseignée"}
                  </td>
                  <td className="mono">{collecte.weight} kg</td>
                  <td className="mono">
                    {new Date(collecte.collectedAt).toLocaleTimeString(
                      "fr-FR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </td>
                </tr>
              ))}
              {!realCollectes.length && (
                <tr>
                  <td colSpan="4" className="empty-state">
                    Aucune collecte enregistrée.
                  </td>
                </tr>
              )}
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
                    2 * Math.PI * 46 -
                    ((assignedEquipment?.batteryLevel || 0) / 100) *
                      (2 * Math.PI * 46)
                  }
                />
              </svg>
              <div className="big-ring-val">
                <div className="big-ring-num mono">
                  {assignedEquipment
                    ? `${assignedEquipment.batteryLevel}%`
                    : "—"}
                </div>
                <div className="big-ring-label">Batterie</div>
              </div>
            </div>

            <div className="device-info">
              <div className="device-name">
                {assignedEquipment?.reference || "Aucun équipement affecté"}
              </div>
              <div className="device-status">
                <Activity size={12} />{" "}
                {assignedEquipment?.status || "Non disponible"}
              </div>
              <div className="metric-list">
                <MetricRow
                  label="Bac actuel (temps réel)"
                  value={
                    currentBinWeight == null ? "—" : `${currentBinWeight} kg`
                  }
                  icon={Gauge}
                />
                <MetricRow
                  label="Cumul mission"
                  value={`${currentMissionWeight} kg`}
                  icon={Gauge}
                />
                <MetricRow
                  label="Température moteur"
                  value="—"
                  icon={Thermometer}
                />
                <MetricRow
                  label="Zone de travail"
                  value={currentZone || "—"}
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
              {(assignedEquipment?.batteryLevel < 25
                ? [
                    {
                      text: "Batterie faible",
                      time: "État actuel",
                      icon: "battery",
                      bg: "var(--amber-bg)",
                      color: "var(--amber)",
                    },
                  ]
                : []
              ).map((item) => {
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
              {!assignedEquipment && (
                <p className="empty-state">Aucune alerte disponible.</p>
              )}
            </div>
          </div>
        </div>

        <div className="stat-strip">
          <div className="stat-card">
            <div className="stat-label">Déchets collectés aujourd’hui</div>
            <div className="stat-val mono">
              {todayWeight ? `${todayWeight} kg` : "—"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Missions du jour</div>
            <div className="stat-val mono">
              {activeMissions} / {realAgentMissions.length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Temps de fonctionnement</div>
            <div className="stat-val mono">—</div>
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
                <div key={mission.id} className="mission-item">
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
      <MissionDetailsModal
        mission={detailsMission}
        token={token}
        canUpload
        onClose={() => setDetailsMission(null)}
        onSaved={refreshAgentMissions}
      />
      <aside className="sidebar agent-sidebar">
        <div className="brand-row">
          <div className="brand-mark">
            <Backpack size={18} strokeWidth={1.8} />
          </div>
          <div>
            <div className="brand-name">EcoBot</div>
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
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="avatar">
            {`${user.firstName} ${user.lastName}`
              .split(" ")
              .filter(Boolean)
              .map((part) => part[0].toUpperCase())
              .join("")}
          </div>
          <div>
            <div className="foot-name">
              {user.firstName} {user.lastName}
            </div>
            <div className="foot-role">
              Agent · {user.phone || "Secteur non renseigné"}
            </div>
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
            <div className="brand-name">EcoBot</div>
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
