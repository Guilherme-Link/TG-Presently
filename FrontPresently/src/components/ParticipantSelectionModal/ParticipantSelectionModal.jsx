import { useMemo, useState } from "react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import "./ParticipantSelectionModal.css";

function ParticipantSelectionModal({
  mode,
  participants = [],
  participantLists = [],
  onClose,
  onConfirm,
}) {
  const [selectedIds, setSelectedIds] = useState([]);

  const items = useMemo(() => {
    if (mode === "lists") {
      return participantLists.map((list) => ({
        id: list.id,
        title: list.name,
        description: list.description,
        count: list.members?.length ?? 0,
        payload: list.members ?? [],
      }));
    }

    return participants.map((participant) => ({
      id: participant.id,
      title: participant.name,
      description: participant.email,
      payload: participant,
    }));
  }, [mode, participantLists, participants]);

  function toggleSelection(id) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function handleConfirm() {
    const selectedItems = items.filter((item) => selectedIds.includes(item.id));
    onConfirm(selectedItems);
  }

  const title =
    mode === "lists" ? "Adicionar lista de participantes" : "Adicionar participantes";

  const description =
    mode === "lists"
      ? "Selecione uma ou mais listas mockadas para adicionar todos os participantes delas ao evento."
      : "Selecione um ou mais participantes para incluir na listagem do evento.";

  return (
    <Modal title={title} onClose={onClose} width={680}>
      <div className="eps">
        <p className="eps__description">{description}</p>

        <div className="eps__list">
          {items.map((item) => {
            const checked = selectedIds.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                className={`eps__item${checked ? " eps__item--selected" : ""}`}
                onClick={() => toggleSelection(item.id)}
              >
                <span className="eps__check" aria-hidden="true">
                  <input type="checkbox" checked={checked} readOnly />
                </span>

                <span className="eps__item-copy">
                  <strong>{item.title}</strong>
                  <span>
                    {item.description}
                    {typeof item.count === "number" ? ` · ${item.count} participante(s)` : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="eps__actions">
          <Button variant="muted" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={selectedIds.length === 0}>
            Adicionar selecionados
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ParticipantSelectionModal;
