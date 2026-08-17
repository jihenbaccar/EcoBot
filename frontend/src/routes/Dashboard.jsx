import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchResource } from "../services/api";

function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [aspirateurs, setAspirateurs] = useState([]);

  useEffect(() => {
    if (!token) return;

    fetchResource("/statistics", token)
      .then((data) => setStats(data))
      .catch(() => setStats(null));

    fetchResource("/aspirateurs", token)
      .then((data) => setAspirateurs(data))
      .catch(() => setAspirateurs([]));
  }, [token]);

  return (
    <div className="page dashboard-page">
      <h1>Dashboard</h1>
      {!token && <p>Connecte-toi pour voir les statistiques.</p>}

      {token && (
        <>
          <div className="stats-grid">
            <StatCard title="Aujourd'hui (kg)" value={stats ? stats.todayWeight : "—"} />
            <StatCard title="Cette semaine (kg)" value={stats ? stats.weekWeight : "—"} />
            <StatCard title="Ce mois (kg)" value={stats ? stats.monthWeight : "—"} />
            <StatCard title="Aspirateurs actifs" value={stats ? stats.activeAspirateurs : "—"} />
          </div>

          <section className="aspirateurs-list">
            <h2>Aspirateurs ({aspirateurs.length})</h2>
            <ul>
              {aspirateurs.map((a) => (
                <li key={a.id}>
                  <strong>{a.reference}</strong> — {a.status} — Batterie: {a.batteryLevel}% — Poids: {a.currentWeight}kg
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
