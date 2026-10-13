import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MdDashboard,
  MdOutlineDescription,
  MdTrendingUp,
  MdGridView,
  MdDevices,
  MdOutlineCalendarToday,
  MdPeople,
  MdSettings,
  MdLogout,
  MdMenu,
  MdClose,
} from "react-icons/md";
import { adminSidebarSections } from "../../../data/dashboardDataAdmin";
import "./SidebarAdmin.css";

const ICONS = {
  dashboard: MdDashboard,
  report: MdOutlineDescription,
  trending: MdTrendingUp,
  rooms: MdGridView,
  devices: MdDevices,
  calendar: MdOutlineCalendarToday,
  users: MdPeople,
  settings: MdSettings,
  logout: MdLogout,
};

function NavGroup({ title, items, activeItem, onNavigate }) {
  return (
    <div className="sidebar-admin__group">
      <span className="sidebar-admin__group-title">{title}</span>
      <nav className="sidebar-admin__nav">
        {items.map(({ id, label, icon, to, badge }) => {
          const Icon = ICONS[icon];
          const isActive = activeItem === id;

          return (
            <Link
              key={id}
              to={to.startsWith("/") || to.startsWith("#") ? to : `/${to}`}
              className={`sidebar-admin__link${isActive ? " sidebar-admin__link--active" : ""}`}
              onClick={onNavigate}
            >
              <Icon size={18} />
              <span className="sidebar-admin__link-label">{label}</span>
              {badge ? (
                <span className="sidebar-admin__badge">{badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function SidebarAdmin({
  sections = adminSidebarSections,
  activeItem = "painel-geral-link",
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }

    return window.matchMedia("(max-width: 768px)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleChange = (event) => {
      setIsMobile(event.matches);
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

  const menuIsOpen = isMobile ? isMenuOpen : false;

  return (
    <aside
      className={`sidebar-admin${menuIsOpen ? " sidebar-admin--open" : ""}`}
      aria-label="Menu administrativo"
    >
      <div className="sidebar-admin__mobile-header">
        <div className="sidebar-admin__brand">
          <span className="sidebar-admin__logo-mark">P</span>
          <span className="sidebar-admin__logo-text">presently admin</span>
        </div>

        <button
          type="button"
          className="sidebar-admin__toggle"
          onClick={toggleMenu}
          aria-label={menuIsOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuIsOpen}
        >
          {menuIsOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
        </button>
      </div>

      <div className="sidebar-admin__menu">
        <div className="sidebar-admin__desktop-brand">
          <span className="sidebar-admin__logo-mark">P</span>
          <span className="sidebar-admin__logo-text">presently admin</span>
        </div>

        {sections.map((section) => (
          <NavGroup
            key={section.title}
            title={section.title}
            items={section.items}
            activeItem={activeItem}
            onNavigate={closeMenu}
          />
        ))}
      </div>
    </aside>
  );
}

export default SidebarAdmin;
