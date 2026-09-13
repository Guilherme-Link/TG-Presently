import { useMemo, useState } from "react";
import { MdSearch } from "react-icons/md";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import "./EventParticipantsModal.css";

function EventParticipantsModal({ event, onClose }) {
  const [search, setSearch] = useState("");
  const participants = Array.isArray(event?.participants) ? event.participants : [];
  const visibleParticipants = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return participants.filter((participant) =>
      String(participant.name ?? "").toLocaleLowerCase("pt-BR").includes(query)
    );
  }, [participants, search]);

  return (
    <Modal title={`Participantes — ${event.name}`} onClose={onClose} width={560}>
      <div className="evt-event-participants">
        <label className="evt-event-participants__search">
          <MdSearch size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Pesquisar participante"
            value={search}
            onChange={(eventChange) => setSearch(eventChange.target.value)}
          />
        </label>

        <div className="evt-event-participants__table">
          <div className="evt-event-participants__head"><span>Nome</span><span>Email</span></div>
          {visibleParticipants.map((participant) => (
            <div key={participant.id} className="evt-event-participants__row">
              <strong>{participant.name}</strong><span>{participant.email || "—"}</span>
            </div>
          ))}
          {!visibleParticipants.length && <p className="evt-event-participants__empty">Nenhum participante encontrado.</p>}
        </div>

        <div className="evt-event-participants__footer"><Button variant="muted" onClick={onClose}>Fechar</Button></div>
      </div>
    </Modal>
  );
}

export default EventParticipantsModal;
