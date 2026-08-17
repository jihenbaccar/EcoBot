import { useAuth } from "../../context/AuthContext";
import { LogOut, Menu as MenuIcon } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button aria-label="Open menu" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <MenuIcon size={18} strokeWidth={1.75} />
        </button>
        <div className="navbar-title">
          <span className="icon-box" aria-hidden>
            {/* logo replaced by Lucide icon in Sidebar */}
          </span>
          EcoBot
        </div>
      </div>
      <div className="navbar-actions">
        {user ? (
          <>
            <span>
              {user.firstName} {user.lastName}
            </span>
            <button type="button" onClick={logout} className="btn-secondary" aria-label="Déconnexion">
              <LogOut size={16} strokeWidth={1.75} />
            </button>
          </>
        ) : (
          <span>Invité</span>
        )}
      </div>
    </header>
  );
}

export default Navbar;
