import { MdOutlineEventBusy } from "react-icons/md";
import Button from "../Button/Button";
import "./EmptyState.css";

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="evt-empty">
      <span className="evt-empty__icon">
        <MdOutlineEventBusy size={30} />
      </span>
      <strong className="evt-empty__title">{title}</strong>
      <p className="evt-empty__description">{description}</p>
      {actionLabel && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
