import { useEffect, useState } from "react";
import {
  MdDashboard,
  MdOutlineCheckCircle,
  MdOutlineDescription,
  MdOutlineCalendarToday,
  MdOutlinePerson,
  MdLogout,
  MdMenu,
  MdClose,
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

function NavGroup({ title, items, onNavigate }) {
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
              onClick={onNavigate}
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia("(max-width: 768px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleChange = (event) => {
      setIsMobile(event.matches);
      if (!event.matches) {
        setIsMenuOpen(false);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      return undefined;
    }

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    if (isMenuOpen) {
      root.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.overscrollBehavior = "none";
    }

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, [isMobile, isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function toggleMenu() {
    setIsMenuOpen((current) => !current);
  }

  return (
    <aside className={`sidebar${isMenuOpen ? " sidebar--open" : ""}`} aria-label="Menu principal">
      <div className="sidebar__mobile-header">
        <div className="sidebar__brand">
          <span className="sidebar__logo-mark">P</span>
          <span className="sidebar__logo-text">presently</span>
        </div>

        <button
          type="button"
          className="sidebar__toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
        </button>
      </div>

      <div className="sidebar__menu">
        <div className="sidebar__desktop-brand">
          <span className="sidebar__logo-mark">P</span>
          <span className="sidebar__logo-text">presently</span>
        </div>

        <button type="button" className="sidebar__institution">
          <span>{institution}</span>
          <MdKeyboardArrowDown size={18} />
        </button>

        <NavGroup title="Aluno" items={sidebarNavAluno} onNavigate={closeMenu} />
        <NavGroup title="Conta" items={sidebarNavConta} onNavigate={closeMenu} />
      </div>
    </aside>
  );
}

export default Sidebar;
