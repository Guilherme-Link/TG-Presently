import {
  MdDashboard,
  MdOutlineDescription,
  MdTrendingUp,
  MdGridView,
  MdOutlineCalendarToday,
  MdPeople,
  MdSettings,
  MdLogout,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { NavLink } from "react-router-dom";
import { adminSidebarSections } from "../../../data/dashboardDataAdmin";
import "./SidebarAdmin.css";

const ICONS = {
  dashboard: MdDashboard,
  report: MdOutlineDescription,
  trending: MdTrendingUp,
  rooms: MdGridView,
  calendar: MdOutlineCalendarToday,
  users: MdPeople,
  settings: MdSettings,
  logout: MdLogout,
};

function NavGroup({ title, items, activeItem }) {
  return (
    <div className="sidebar-admin__group">
      <span className="sidebar-admin__group-title">{title}</span>
      <nav className="sidebar-admin__nav">
        {items.map(({ id, label, icon, to, badge }) => {
          const Icon = ICONS[icon];
          const isActive = activeItem === id;

          return (
            <a
              key={id}
              href={to}
              className={`sidebar-admin__link${isActive ? " sidebar-admin__link--active" : ""}`}
            >
              <Icon size={18} />
              <span className="sidebar-admin__link-label">{label}</span>
              {badge ? (
                <span className="sidebar-admin__badge">{badge}</span>
              ) : null}
            </a>
          );
        })}
      </nav>
    </div>
  );
}

function SidebarAdmin({
  institution = "Fatec Indaiatuba",
  sections = adminSidebarSections,
  activeItem = "painel-geral-link",
}) {
  return (
    <aside className="sidebar-admin">
      <div className="sidebar-admin__brand">
        <span className="sidebar-admin__logo-mark">P</span>
        <span className="sidebar-admin__logo-text">presently admin</span>
      </div>

      <button type="button" className="sidebar-admin__institution">
        <span>{institution}</span>
        <MdKeyboardArrowDown size={18} />
      </button>

      {sections.map((section) => (
        <NavGroup
          key={section.title}
          title={section.title}
          items={section.items}
          activeItem={activeItem}
        />
      ))}
    </aside>
  );
}

export default SidebarAdmin;
