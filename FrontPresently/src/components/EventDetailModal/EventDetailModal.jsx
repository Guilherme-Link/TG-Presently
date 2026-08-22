import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import { getEventTypeLabel } from "../../data/eventsData";
import "./EventDetailModal.css";

function DetailRow({ label, value }) {
  return (
    <div className="evt-detail__row">
      <span className="evt-detail__label">{label}</span>
      <span className="evt-detail__value">{value || "—"}</span>
    </div>
  );
}

function EventDetailModal({ event, onClose }) {
  return (
    <Modal title={event.name} onClose={onClose} width={480}>
      <div className="evt-detail">
        <DetailRow label="Descricao" value={event.description} />
        <DetailRow label="Responsavel" value={event.responsible} />
        <DetailRow label="Local do evento" value={event.ambientName || event.location} />
        <DetailRow label="Tipo do evento" value={getEventTypeLabel(event.eventType)} />
        {event.eventType === "RECURRING" && (
          <DetailRow
            label="Intervalo de recorrencia"
            value={`${event.intervalDays || "—"} dia(s)`}
          />
        )}
        <DetailRow
          label="Periodo"
          value={
            event.startDate || event.endDate
              ? `${event.startDate || "—"} ate ${event.endDate || "—"}`
              : null
          }
        />
        <DetailRow
          label="Horario"
          value={
            event.startTime || event.endTime
              ? `${event.startTime || "—"} ate ${event.endTime || "—"}`
              : null
          }
        />
        <DetailRow
          label="Listas"
          value={
            event.participantLists?.length
              ? `${event.participantLists.length} lista(s) cadastrada(s)`
              : "Nenhuma lista cadastrada"
          }
        />
        <DetailRow
          label="Participantes"
          value={
            event.participants?.length
              ? `${event.participants.length} participante(s) cadastrado(s)`
              : "Nenhum participante cadastrado"
          }
        />

        <div className="evt-detail__footer">
          <Button variant="muted" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default EventDetailModal;
