import { MdHome, MdQrCodeScanner, MdPerson } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { bottomNavItems } from "../../../data/dashboardData";
import "./BottomNavigation.css";

const ICONS = {
  home: MdHome,
  qrcode: MdQrCodeScanner,
  user: MdPerson,
};

function BottomNavigation({ activeId = "dashboard" }) {
  return (
    <nav className="bottom-nav">
      {bottomNavItems.map(({ id, label, icon }) => {
        const Icon = ICONS[icon];
        const isActive = id === activeId;
        const isScan = id === "scan";

        return (
          <NavLink
            key={id}
            to={isScan ? "/presenca" : id === "dashboard" ? "/dashboard" : "/perfil"}
            className={`bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""} ${
              isScan ? "bottom-nav__item--scan" : ""
            }`}
          >
            <span className="bottom-nav__icon">
              <Icon size={isScan ? 22 : 20} />
            </span>
            <span className="bottom-nav__label">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default BottomNavigation;
