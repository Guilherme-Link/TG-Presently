import { MdWarningAmber } from "react-icons/md";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import "./ConfirmDeleteModal.css";

function ConfirmDeleteModal({ eventName, onCancel, onConfirm }) {
  return (
    <Modal title="Excluir evento" onClose={onCancel} width={420}>
      <div className="evt-confirm-delete">
        <span className="evt-confirm-delete__icon">
          <MdWarningAmber size={22} />
        </span>
        <p className="evt-confirm-delete__text">
          Tem certeza que deseja excluir <strong>{eventName}</strong>? Esta ação e irreversivel e
          nao podera ser desfeita.
        </p>

        <div className="evt-confirm-delete__actions">
          <Button variant="muted" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Excluir evento
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDeleteModal;
