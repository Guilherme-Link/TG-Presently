import { MdClose } from "react-icons/md";
import "./Modal.css";

function Modal({ title, onClose, children, width = 440 }) {
  return (
    <div className="evt-modal-overlay" onClick={onClose}>
      <div
        className="evt-modal"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="evt-modal__header">
          <h3 className="evt-modal__title">{title}</h3>
          <button type="button" className="evt-modal__close" onClick={onClose} aria-label="Fechar">
            <MdClose size={18} />
          </button>
        </div>
        <div className="evt-modal__body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
