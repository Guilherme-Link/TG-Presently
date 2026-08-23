import { MdDeleteOutline, MdEdit, MdInfoOutline } from "react-icons/md";
import "./EventsTable.css";

function EventsTable({ events, onView, onEdit, onDelete }) {
  return (
    <div className="evt-table">
      <div className="evt-table__head">
        <span className="evt-table__col evt-table__col--name">Nome do evento</span>
        <span className="evt-table__col evt-table__col--action">Ver evento</span>
        <span className="evt-table__col evt-table__col--action">Editar</span>
        <span className="evt-table__col evt-table__col--action">Excluir</span>
      </div>

      <div className="evt-table__body">
        {events.map((event) => (
          <div key={event.id} className="evt-table__row">
            <span className="evt-table__name">{event.name}</span>

            <button
              type="button"
              className="evt-icon-btn evt-icon-btn--neutral"
              aria-label={`Ver evento ${event.name}`}
              onClick={() => onView(event)}
            >
              <MdInfoOutline size={17} />
            </button>

            <button
              type="button"
              className="evt-icon-btn evt-icon-btn--neutral"
              aria-label={`Editar evento ${event.name}`}
              onClick={() => onEdit(event)}
            >
              <MdEdit size={16} />
            </button>

            <button
              type="button"
              className="evt-icon-btn evt-icon-btn--danger"
              aria-label={`Excluir evento ${event.name}`}
              onClick={() => onDelete(event)}
            >
              <MdDeleteOutline size={17} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventsTable;
