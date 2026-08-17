import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Backpack,
  BatteryCharging,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  FileText,
  Gauge,
  History,
  LayoutGrid,
  Map,
  MapPinned,
  PackageCheck,
  ShieldCheck,
  Target,
  Thermometer,
  UserRound,
  Users,
} from "lucide-react";
import "./App.css";

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
  { name: "Sac #01", agent: "Karim T.", battery: 82, weight: 6.4, temp: 38, status: "actif" },
  { name: "Sac #02", agent: "Salma R.", battery: 24, weight: 4.1, temp: 41, status: "actif" },
  { name: "Sac #03", agent: "Yassine H.", battery: 9, weight: 2.8, temp: 52, status: "maint" },
  { name: "Sac #04", agent: "Non affecté", battery: 0, weight: 0, temp: 0, status: "hs" },
  { name: "Sac #05", agent: "Nour A.", battery: 91, weight: 5.7, temp: 36, status: "actif" },
  { name: "Sac #06", agent: "Mehdi K.", battery: 58, weight: 3.9, temp: 39, status: "actif" },
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
  { icon: "battery", bg: "var(--amber-bg)", color: "var(--amber)", text: "Sac #02 — batterie faible (24%)", time: "Il y a 4 min" },
  { icon: "alert", bg: "var(--red-bg)", color: "var(--red)", text: "Sac #03 — température moteur élevée", time: "Il y a 12 min" },
  { icon: "pin", bg: "var(--green-bg)", color: "var(--green)", text: "Yassine H. arrivé rue Ibn Khaldoun", time: "Il y a 18 min" },
  { icon: "check", bg: "var(--green-bg)", color: "var(--green)", text: "Mission \"Souk Centre\" terminée", time: "Il y a 41 min" },
];

const missions = [
  { name: "Souk Centre-ville", zone: "Zone A2", agent: "Karim T.", date: "28/07", progress: 80 },
  { name: "Avenue Habib Bourguiba", zone: "Zone B1", agent: "Salma R.", date: "28/07", progress: 45 },
  { name: "Quartier Bab Souika", zone: "Zone C3", agent: "Yassine H.", date: "28/07", progress: 15 },
  { name: "Place de la Kasbah", zone: "Zone A1", agent: "Nour A.", date: "27/07", progress: 100 },
  { name: "Rue de Marseille", zone: "Zone D2", agent: "Mehdi K.", date: "27/07", progress: 100 },
  { name: "Marché Sidi Bahri", zone: "Zone B3", agent: "Non affecté", date: "29/07", progress: 0 },
];

const agents = [
  { name: "Karim T.", zone: "Secteur A", routes: 27, collected: 124.8, score: 92 },
  { name: "Salma R.", zone: "Secteur B", routes: 23, collected: 111.6, score: 88 },
  { name: "Yassine H.", zone: "Secteur C", routes: 18, collected: 95.4, score: 76 },
  { name: "Nour A.", zone: "Secteur A", routes: 26, collected: 119.2, score: 94 },
];

const reports = [
  { title: "Rapport hebdomadaire", subtitle: "Synthèse de collecte et d’activité", type: "PDF" },
  { title: "Bilan équipement", subtitle: "État des batteries et maintenance", type: "Excel" },
  { title: "Performance agents", subtitle: "Suivi des agents et des missions", type: "PDF" },
];

const loginRoleContent = {
  agent: {
    formTitle: "Connexion Agent",
    formSub: "Accédez à votre espace de mission et à l’état de votre équipement.",
    loginLabel: "Identifiant agent",
    showcaseTitle: "Suivez votre équipement et vos missions en temps réel",
    showcaseSub: "Batterie, poids collecté et missions du jour, directement depuis votre espace.",
    helper: "Votre sac connecté sera automatiquement associé à votre compte après connexion.",
  },
  superviseur: {
    formTitle: "Connexion Superviseur",
    formSub: "Suivez les équipes et les statistiques de votre secteur.",
    loginLabel: "Identifiant superviseur",
    showcaseTitle: "Pilotez les équipes de votre secteur",
    showcaseSub: "Disponibilité des agents, performance et rapports de votre zone de responsabilité.",
    helper: "Vous n’aurez accès qu’aux équipes et zones placées sous votre responsabilité.",
  },
};

const agentMissions = [
  { name: "Souk Centre-ville", zone: "Zone A2", date: "Aujourd’hui", progress: 100 },
  { name: "Avenue Habib Bourguiba", zone: "Zone A1", date: "Aujourd’hui", progress: 60 },
  { name: "Rue Ibn Khaldoun", zone: "Zone A3", date: "Aujourd’hui", progress: 0 },
  { name: "Marché Bab Souika", zone: "Zone A2", date: "Hier", progress: 100 },
  { name: "Place de la Kasbah", zone: "Zone A1", date: "Hier", progress: 100 },
];

const historyRows = [
  { date: "28/07", zone: "Zone A2 · Souk Centre", kg: 18.4, time: "4h 12" },
  { date: "27/07", zone: "Zone A1 · Kasbah", kg: 21.1, time: "5h 05" },
  { date: "26/07", zone: "Zone A3 · Bab Souika", kg: 16.7, time: "3h 48" },
  { date: "25/07", zone: "Zone A2 · Avenue Bourguiba", kg: 19.9, time: "4h 30" },
  { date: "24/07", zone: "Zone A1 · Centre-ville", kg: 14.2, time: "3h 15" },
];

function formatStatusValue(status) {
  if (status === "actif") return { label: "Actif", className: "status-actif" };
  if (status === "maint") return { label: "Maintenance", className: "status-maint" };
  return { label: "Hors service", className: "status-hs" };
}

function getRingSvg(value, color) {
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
      <circle cx="22" cy="22" r={radius} fill="none" stroke="#E1E8E2" strokeWidth="4" />
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
  const color = equipment.battery > 40 ? "#1F8F5C" : equipment.battery > 15 ? "#B0730D" : "#C13B35";

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

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
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
            <div className="zone zone-clean" style={{ left: "18%", top: "18%", width: "42%", height: "26%" }} />
            <div className="zone zone-clean" style={{ right: "12%", top: "28%", width: "26%", height: "24%" }} />
            <div className="zone zone-todo" style={{ left: "40%", bottom: "18%", width: "30%", height: "20%" }} />
            <div className="zone zone-todo" style={{ left: "18%", bottom: "12%", width: "24%", height: "18%" }} />
            <div className="agent-dot" style={{ left: "32%", top: "24%" }} />
            <div className="agent-dot" style={{ left: "59%", top: "38%" }} />
            <div className="agent-dot" style={{ left: "46%", bottom: "24%" }} />
          </div>
          <div className="map-legend">
            <div className="legend-item"><span className="legend-swatch" style={{ background: "rgba(31,143,92,.20)" }} /> Zones nettoyées</div>
            <div className="legend-item"><span className="legend-swatch" style={{ background: "rgba(193,59,53,.12)" }} /> À traiter</div>
            <div className="legend-item"><span className="legend-swatch" style={{ background: "var(--green)" }} /> Agents</div>
          </div>
        </div>
      );
    }

    if (activeTab === "missions") {
      return (
        <div className="panel-card">
          <div className="card-head">
            <div className="card-title">Mission de collecte</div>
            <div className="card-link">Cette semaine</div>
          </div>
          <table className="list">
            <thead>
              <tr>
                <th>Mission</th>
                <th>Zone</th>
                <th>Agent</th>
                <th>Date</th>
                <th>Progression</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((mission) => (
                <tr key={`${mission.name}-${mission.date}`}>
                  <td>{mission.name}</td>
                  <td>{mission.zone}</td>
                  <td>{mission.agent}</td>
                  <td className="mono">{mission.date}</td>
                  <td style={{ width: "150px" }}>
                    <div className="mission-bar-bg">
                      <div className="mission-bar-fill" style={{ width: `${mission.progress}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === "equipements") {
      return (
        <div className="panel-card">
          <div className="card-head">
            <div className="card-title">Parc d’équipements</div>
            <div className="card-link">6 sacs</div>
          </div>
          <div className="eq-grid wide">
            {equipmentData.map((equipment) => (
              <EquipmentCard key={equipment.name} equipment={equipment} />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "agents") {
      return (
        <div className="panel-card">
          <div className="card-head">
            <div className="card-title">Performance des agents</div>
            <div className="card-link">Suivi terrain</div>
          </div>
          <div className="agent-grid">
            {agents.map((agent) => (
              <div key={agent.name} className="agent-card">
                <div className="agent-head">
                  <div className="agent-avatar">{agent.name.split(" ").map((part) => part[0]).join("")}</div>
                  <div>
                    <div className="agent-name">{agent.name}</div>
                    <div className="agent-zone">{agent.zone}</div>
                  </div>
                </div>
                <div className="agent-stats">
                  <div>
                    <div className="agent-stat-val mono">{agent.routes}</div>
                    <div className="agent-stat-label">Routes</div>
                  </div>
                  <div>
                    <div className="agent-stat-val mono">{agent.collected} kg</div>
                    <div className="agent-stat-label">Collecte</div>
                  </div>
                  <div>
                    <div className="agent-stat-val mono">{agent.score}%</div>
                    <div className="agent-stat-label">Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
                  {report.type === "PDF" ? <FileText size={18} /> : <Download size={18} />}
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
          <KpiCard label="Agents connectés" value="18" delta="+3.2% vs semaine" tone="up" />
          <KpiCard label="Sacs en fonction" value="11" delta="2 en maintenance" tone="flat" />
          <KpiCard label="Batterie moyenne" value="67%" delta="+4.5% ce jour" tone="up" />
          <KpiCard label="Déchets collectés" value="312 kg" delta="+12 kg aujourd’hui" tone="up" />
        </div>

        <div className="grid-layout">
          <div className="panel-card">
            <div className="card-head">
              <div className="card-title">Équipements actifs</div>
              <div className="card-link">6 unités</div>
            </div>
            <div className="eq-grid">
              {equipmentData.slice(0, 4).map((equipment) => (
                <EquipmentCard key={equipment.name} equipment={equipment} />
              ))}
            </div>
          </div>

          <div className="panel-card">
            <div className="card-head">
              <div className="card-title">Collecte de la semaine</div>
              <div className="card-link">kg</div>
            </div>
            <div className="chart-wrap">
              <div className="bars" aria-label="Graphique de collecte hebdomadaire">
                {weeklyCollect.map((item, index) => {
                  const maxValue = Math.max(...weeklyCollect.map((entry) => entry.value));
                  const height = Math.round((item.value / maxValue) * 100);
                  return (
                    <div key={item.day} className="bar-col">
                      <div className="bar-val mono">{item.value}</div>
                      <div className={`bar ${index === weeklyCollect.length - 1 ? "today" : ""}`} style={{ height: `${height}%` }} />
                      <div className="bar-label">{item.day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid-layout lower-grid">
          <div className="panel-card">
            <div className="card-head">
              <div className="card-title">Notifications</div>
              <div className="card-link">Live</div>
            </div>
            <div className="notif-list">
              {notifications.map((notification) => {
                const iconMap = {
                  battery: <BatteryCharging size={14} />,
                  alert: <AlertTriangle size={14} />,
                  pin: <MapPinned size={14} />,
                  check: <CheckCircle2 size={14} />,
                };
                return (
                  <div key={notification.text} className="notif-item">
                    <div className="notif-icon" style={{ background: notification.bg, color: notification.color }}>
                      {iconMap[notification.icon]}
                    </div>
                    <div>
                      <div className="notif-text">{notification.text}</div>
                      <div className="notif-time">{notification.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel-card">
            <div className="card-head">
              <div className="card-title">Missions actives</div>
              <div className="card-link">6 tâches</div>
            </div>
            <div className="mission-list">
              {missions.slice(0, 3).map((mission) => (
                <div key={mission.name} className="mission-item">
                  <div className="mission-top">
                    <div>
                      <div className="mission-name">{mission.name}</div>
                      <div className="mission-zone">{mission.zone} · {mission.agent}</div>
                    </div>
                    <div className="mono mission-progress">{mission.progress}%</div>
                  </div>
                  <div className="mission-bar-bg">
                    <div className="mission-bar-fill" style={{ width: `${mission.progress}%` }} />
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
            <div className="zone zone-clean" style={{ left: "16%", top: "16%", width: "40%", height: "24%" }} />
            <div className="zone zone-clean" style={{ right: "12%", top: "28%", width: "25%", height: "28%" }} />
            <div className="zone zone-todo" style={{ left: "38%", bottom: "18%", width: "28%", height: "18%" }} />
            <div className="zone zone-todo" style={{ left: "18%", bottom: "12%", width: "22%", height: "16%" }} />
            <div className="agent-dot" style={{ left: "34%", top: "28%" }} />
            <div className="agent-dot" style={{ left: "60%", top: "36%" }} />
            <div className="agent-dot" style={{ left: "48%", bottom: "24%" }} />
          </div>
          <div className="map-legend">
            <div className="legend-item"><span className="legend-swatch" style={{ background: "rgba(31,143,92,.20)" }} /> Zones nettoyées</div>
            <div className="legend-item"><span className="legend-swatch" style={{ background: "rgba(193,59,53,.12)" }} /> À traiter</div>
            <div className="legend-item"><span className="legend-swatch" style={{ background: "var(--green)" }} /> Agents</div>
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
        <SidebarNav items={adminNavItems} activeKey={activeTab} onSelect={setActiveTab} />

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
            <button type="button" className="logout-btn" onClick={onLogout}>Se déconnecter</button>
            <div className="clock-box">
              <span className="pulse-dot" />
              <span className="mono" id="clockText">--:--:--</span>
            </div>
          </div>
        </header>

        {renderPageContent()}
      </main>
    </div>
  );
}

function AgentDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("apercu");

  const currentPage = {
    apercu: { title: "Vue d’ensemble", subtitle: "Sac connecté #01 · Secteur A — Centre-ville" },
    missions: { title: "Mes missions", subtitle: "Missions qui vous sont attribuées" },
    historique: { title: "Historique", subtitle: "Vos collectes des derniers jours" },
  }[activeTab];

  const notifData = [
    { icon: "battery", bg: "var(--amber-bg)", color: "var(--amber)", text: "Batterie sous 25% — pensez à recharger", time: "Il y a 6 min" },
    { icon: "temp", bg: "var(--red-bg)", color: "var(--red)", text: "Température moteur élevée détectée", time: "Il y a 22 min" },
    { icon: "check", bg: "var(--green-bg)", color: "var(--green)", text: "Mission \"Souk Centre\" marquée terminée", time: "Il y a 1h" },
    { icon: "pin", bg: "var(--green-bg)", color: "var(--green)", text: "Vous êtes arrivé dans la zone A2", time: "Il y a 1h 20" },
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
              {agentMissions.map((mission) => {
                const badge = getMissionBadge(mission.progress);
                return (
                  <tr key={mission.name}>
                    <td>{mission.name}</td>
                    <td>{mission.zone}</td>
                    <td className="mono">{mission.date}</td>
                    <td style={{ width: "150px" }}>
                      <div className="mission-bar-bg">
                        <div className="mission-bar-fill" style={{ width: `${mission.progress}%` }} />
                      </div>
                    </td>
                    <td><span className={`mission-tag ${badge.className}`}>{badge.label}</span></td>
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
              <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
                <circle cx="60" cy="60" r="46" fill="none" stroke="#E1E8E2" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="#1F8F5C"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 - (82 / 100) * (2 * Math.PI * 46)}
                />
              </svg>
              <div className="big-ring-val">
                <div className="big-ring-num mono">82%</div>
                <div className="big-ring-label">Batterie</div>
              </div>
            </div>

            <div className="device-info">
              <div className="device-name">Sac connecté #01</div>
              <div className="device-status"><Activity size={12} /> Actif</div>
              <div className="metric-list">
                <MetricRow label="Poids collecté" value="18.4 kg" icon={Gauge} />
                <MetricRow label="Température moteur" value="38°C" icon={Thermometer} />
                <MetricRow label="Zone de travail" value="A2" icon={MapPinned} />
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
                    <div className="notif-icon" style={{ background: item.bg, color: item.color }}>{iconMap[item.icon]}</div>
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
            <div className="card-link">3 missions</div>
          </div>
          <div className="mission-list">
            {agentMissions.slice(0, 3).map((mission) => {
              const badge = getMissionBadge(mission.progress);
              return (
                <div key={mission.name} className="mission-item">
                  <div className="mission-top">
                    <div>
                      <div className="mission-name">{mission.name}</div>
                      <div className="mission-zone">{mission.zone}</div>
                    </div>
                    <span className={`mission-tag ${badge.className}`}>{badge.label}</span>
                  </div>
                  <div className="mission-bar-bg">
                    <div className="mission-bar-fill" style={{ width: `${mission.progress}%` }} />
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
            <button type="button" className="logout-btn" onClick={onLogout}>Se déconnecter</button>
            <div className="clock-box">
              <span className="pulse-dot" />
              <span className="mono" id="agentClockText">--:--:--</span>
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
  const content = loginRoleContent[role];

  return (
    <div className="login-shell">
      <aside className="showcase-panel">
        <div className="showcase-top">
          <div className="brand-mark"><Backpack size={18} strokeWidth={1.8} /></div>
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

        <div className="showcase-bot">Municipalité de Tunis · Plateforme de supervision</div>
      </aside>

      <main className="form-panel">
        <div className="form-box">
          <div className="form-head">
            <h1>{content.formTitle}</h1>
            <p>{content.formSub}</p>
          </div>

          <div className="role-tabs" role="tablist" aria-label="Sélecteur de rôle">
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
            <input id="login-input" type="text" placeholder="ex. karim.trabelsi@municipalite.tn" />
          </div>

          <div className="field">
            <label htmlFor="password-input">Mot de passe</label>
            <input id="password-input" type="password" placeholder="••••••••" />
          </div>

          <div className="field-row">
            <label className="remember">
              <input type="checkbox" defaultChecked />
              <span>Rester connecté</span>
            </label>
            <button type="button" className="forgot-link">Mot de passe oublié ?</button>
          </div>

          <button
            type="button"
            className="submit-btn"
            onClick={() => onLogin(role === "agent" ? "agent" : "admin")}
          >
            <ArrowRight size={16} />
            Se connecter
          </button>

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
  const [screen, setScreen] = useState("login");

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

  const handleLogin = (role) => {
    setScreen(role);
  };

  if (screen === "login") {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (screen === "agent") {
    return <AgentDashboard onLogout={() => setScreen("login")} />;
  }

  return <AdminDashboard onLogout={() => setScreen("login")} />;
}

export default App;
