import "./StatisticCard.css";

function StatisticCard({ title, value, description, valueColor }) {
  return (
    <div className="statistic-card">
      <span className="statistic-card__title">{title}</span>
      <strong
        className="statistic-card__value"
        style={{ color: valueColor || "var(--color-text)" }}
      >
        {value}
      </strong>
      <span className="statistic-card__description">{description}</span>
    </div>
  );
}

export default StatisticCard;
