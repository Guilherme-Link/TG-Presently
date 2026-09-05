import { MdCheck } from "react-icons/md";
import "./ClassCard.css";

function ClassCard({ time, subject, room, professor, attended = false }) {
  return (
    <div className={`class-card${attended ? " class-card--attended" : ""}`}>
      <span className="class-card__time">{time}</span>
      <div className="class-card__info">
        <strong className="class-card__subject">{subject}</strong>
        <span className="class-card__meta">
          {room} &middot; {professor}
        </span>
      </div>
      {attended ? (
        <span className="class-card__badge" aria-label="Presença confirmada">
          <MdCheck size={16} />
        </span>
      ) : null}
    </div>
  );
}

export default ClassCard;
