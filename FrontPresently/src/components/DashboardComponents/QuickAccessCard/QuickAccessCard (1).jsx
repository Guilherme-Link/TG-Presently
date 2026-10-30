import { FaFileAlt, FaRegCalendarAlt } from "react-icons/fa";
import "./QuickAccessCard.css";

const ICONS = {
  report: FaFileAlt,
  calendar: FaRegCalendarAlt,
};

function QuickAccessCard({ label, icon, onClick, disabled = false }) {
  const Icon = ICONS[icon] || FaFileAlt;

  return (
    <button type="button" className="quick-access-card" onClick={onClick} disabled={disabled}>
      <span className="quick-access-card__icon">
        <Icon size={18} />
      </span>
      <span className="quick-access-card__label">{label}</span>
    </button>
  );
}

export default QuickAccessCard;
