import "./ClassCard.css";

function ClassCard({ time, subject, room, professor }) {
  return (
    <div className="class-card">
      <span className="class-card__time">{time}</span>
      <div className="class-card__info">
        <strong className="class-card__subject">{subject}</strong>
        <span className="class-card__meta">
          {room} &middot; {professor}
        </span>
      </div>
    </div>
  );
}

export default ClassCard;
