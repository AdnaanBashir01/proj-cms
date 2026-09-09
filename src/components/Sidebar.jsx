import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  FolderTree,
  Layers3,
  Settings,
  Users,
  X,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", to: "/", icon: BarChart3, end: true },
  { label: "Articles", to: "/articles", icon: BookOpen },
  { label: "Categories", to: "/categories", icon: FolderTree },
];

const workspace = [
  { label: "Team", to: "/users", icon: Users },
  { label: "Settings", to: "/settings", icon: Settings },
];

function NavGroup({ label, links }) {
  return (
    <div className="sidebar__group">
      <p>{label}</p>
      <nav aria-label={label}>
        {links.map(({ label: itemLabel, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? "sidebar__link is-active" : "sidebar__link"
            }
          >
            <Icon size={18} aria-hidden="true" />
            <span>{itemLabel}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`sidebar-scrim ${open ? "is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`sidebar ${open ? "is-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="sidebar__brand">
          <div className="brand-mark">
            <Layers3 size={20} />
          </div>
          <div>
            <strong>Storyline CMS</strong>
            <span>Content workspace</span>
          </div>
          <button
            type="button"
            className="icon-button sidebar__close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <div className="sidebar__nav">
          <NavGroup label="Content" links={navigation} />
          <NavGroup label="Administration" links={workspace} />
        </div>
        <p className="sidebar__version">
          Admin workspace, demo learning project by Adnan
        </p>
      </aside>
    </>
  );
}
