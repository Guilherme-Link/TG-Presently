import { MdCheck, MdHome, MdQrCodeScanner, MdPerson } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { bottomNavItems } from "../../../data/dashboardData";
import "./BottomNavigation.css";

const ICONS = {
  home: MdHome,
  qrcode: MdQrCodeScanner,
  user: MdPerson,
};

function BottomNavigation({ activeId = "dashboard", scanDisabled = false }) {
  return (
    <nav className="bottom-nav">
      {bottomNavItems.map(({ id, label, icon }) => {
        const Icon = ICONS[icon];
        const isActive = id === activeId;
        const isScan = id === "scan";
        const isDisabled = isScan && scanDisabled;
        const ItemIcon = isDisabled ? MdCheck : Icon;

        if (isDisabled) {
          return (
            <span
              key={id}
              className="bottom-nav__item bottom-nav__item--scan bottom-nav__item--disabled"
              aria-disabled="true"
            >
              <span className="bottom-nav__icon"><ItemIcon size={22} /></span>
              <span className="bottom-nav__label">Registrada</span>
            </span>
          );
        }

        return (
          <NavLink
            key={id}
            to={isScan ? "/presenca" : id === "dashboard" ? "/dashboard" : "/perfil"}
            className={`bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""} ${
              isScan ? "bottom-nav__item--scan" : ""
            }`}
          >
            <span className="bottom-nav__icon">
              <ItemIcon size={isScan ? 22 : 20} />
            </span>
            <span className="bottom-nav__label">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default BottomNavigation;
