import { NavLink } from "react-router-dom";
import { Leaf, LayoutDashboard, Recycle, ClipboardList, Users, Map, BarChart3, Bot } from 'lucide-react';

function Sidebar() {
  const items = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/aspirateurs', label: 'Aspirateurs', icon: Bot },
    { to: '/missions', label: 'Missions', icon: ClipboardList },
    { to: '/collectes', label: 'Collectes', icon: Recycle },
    { to: '/agents', label: 'Agents', icon: Users },
    { to: '/measurements', label: 'Mesures IoT', icon: BarChart3 },
    { to: '/carte', label: 'Carte', icon: Map },
    { to: '/statistiques', label: 'Statistiques', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="icon-box" aria-hidden>
          <Leaf size={18} strokeWidth={1.75} />
        </span>
        EcoBot
      </div>
      <nav className="sidebar-nav">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon size={18} strokeWidth={1.75} style={{ marginRight: 10 }} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
