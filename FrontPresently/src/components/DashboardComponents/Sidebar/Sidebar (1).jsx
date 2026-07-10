import {
  MdDashboard,
  MdOutlineCheckCircle,
  MdOutlineDescription,
  MdOutlineCalendarToday,
  MdOutlinePerson,
  MdLogout,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { NavLink } from "react-router-dom";
import { sidebarNavAluno, sidebarNavConta } from "../../../data/dashboardData";
import "./Sidebar (1).css";

const ICONS = {
  dashboard: MdDashboard,
  check: MdOutlineCheckCircle,
  report: MdOutlineDescription,
  calendar: MdOutlineCalendarToday,
  user: MdOutlinePerson,
  logout: MdLogout,
};

function NavGroup({ title, items }) {
  return (
    <div className="sidebar__group">
      <span className="sidebar__group-title">{title}</span>
      <nav className="sidebar__nav">
        {items.map(({ id, label, icon, path }) => {
          const Icon = ICONS[icon];
          return (
            <NavLink
              key={id}
              to={path}
              end
              className={({ isActive }) =>
                `sidebar__link${isActive ? " sidebar__link--active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

function Sidebar({ institution = "Fatec Indaiatuba" }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo-mark">P</span>
        <span className="sidebar__logo-text">presently</span>
      </div>

      <button type="button" className="sidebar__institution">
        <span>{institution}</span>
        <MdKeyboardArrowDown size={18} />
      </button>

      <NavGroup title="Aluno" items={sidebarNavAluno} />
      <NavGroup title="Conta" items={sidebarNavConta} />
    </aside>
  );
}

export default Sidebar;
