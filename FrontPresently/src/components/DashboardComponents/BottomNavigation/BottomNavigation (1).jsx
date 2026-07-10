import { MdHome, MdQrCodeScanner, MdPerson } from "react-icons/md";
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
          <a
            key={id}
            href="#"
            className={`bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""} ${
              isScan ? "bottom-nav__item--scan" : ""
            }`}
          >
            <span className="bottom-nav__icon">
              <Icon size={isScan ? 22 : 20} />
            </span>
            <span className="bottom-nav__label">{label}</span>
          </a>
        );
      })}
    </nav>
  );
}

export default BottomNavigation;
