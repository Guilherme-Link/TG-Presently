import {
  MdNotificationsNone,
  MdPerson,
  MdKeyboardArrowDown,
} from "react-icons/md";
import "./Header (1).css";

function Header({
  userName = "Aluno",
  date,
  notificationCount = 0,
  institution = "Fatec Indaiatuba",
}) {
  return (
    <>
      <header className="header header--desktop">
        <div className="header__greeting">
          <h1>
            Olá, {userName}! <span className="header__wave">👋</span>
          </h1>
        </div>
        <div className="header__actions">
          <span className="header__date">{date}</span>
          <button
            type="button"
            className="header__icon-btn"
            aria-label="Notificações"
          >
            <MdNotificationsNone size={22} />
            {notificationCount > 0 && (
              <span className="header__badge">{notificationCount}</span>
            )}
          </button>
        </div>
      </header>

      <header className="header header--mobile">
        <div className="header__top-row">
          <button type="button" className="header__institution">
            <span>{institution}</span>
            <MdKeyboardArrowDown size={16} />
          </button>
          <div className="header__mobile-actions">
            <button
              type="button"
              className="header__icon-btn"
              aria-label="Notificações"
            >
              <MdNotificationsNone size={20} />
              {notificationCount > 0 && (
                <span className="header__badge">{notificationCount}</span>
              )}
            </button>
            <button
              type="button"
              className="header__icon-btn header__icon-btn--avatar"
              aria-label="Perfil"
            >
              <MdPerson size={20} />
            </button>
          </div>
        </div>
        <div className="header__greeting header__greeting--mobile">
          <h1>
            Olá, {userName}! <span className="header__wave">👋</span>
          </h1>
          <span className="header__date">{date}</span>
        </div>
      </header>
    </>
  );
}

export default Header;
