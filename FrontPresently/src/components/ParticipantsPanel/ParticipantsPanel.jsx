import { useMemo, useState } from "react";
import { MdDeleteOutline, MdSearch, MdSwapVert } from "react-icons/md";
import "./ParticipantsPanel.css";

function ParticipantsPanel({ participants, onRemove }) {
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const visible = useMemo(() => {
    const filtered = participants.filter((participant) =>
      `${participant.name} ${participant.email} ${participant.sourceLabel ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const left = `${a.name} ${a.email}`.toLowerCase();
      const right = `${b.name} ${b.email}`.toLowerCase();
      return sortAsc ? left.localeCompare(right) : right.localeCompare(left);
    });
  }, [participants, search, sortAsc]);

  return (
    <section className="evt-participants">
      <div className="evt-participants__header">
        <h3 className="evt-participants__title">Participantes</h3>
        <div className="evt-participants__search">
          <MdSearch size={16} />
          <input
            type="search"
            placeholder="Pesquisar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="evt-participants__table-head">
        <button type="button" className="evt-participants__sort" onClick={() => setSortAsc((v) => !v)}>
          Email <MdSwapVert size={14} />
        </button>
        <span>Excluir</span>
      </div>

      <div className="evt-participants__list">
        {visible.map((participant) => (
          <div key={participant.id} className="evt-participants__row">
            <span className="evt-participants__email-group">
              <strong className="evt-participants__name">{participant.name}</strong>
              <span className="evt-participants__email">{participant.email}</span>
              {participant.sourceLabel && (
                <span className="evt-participants__source">{participant.sourceLabel}</span>
              )}
            </span>
            <button
              type="button"
              className="evt-icon-btn evt-icon-btn--danger"
              aria-label={`Remover ${participant.name}`}
              onClick={() => onRemove(participant.id)}
            >
              <MdDeleteOutline size={16} />
            </button>
          </div>
        ))}

        {visible.length === 0 && (
          <p className="evt-participants__empty">Nenhum participante encontrado.</p>
        )}
      </div>

      <span className="evt-participants__count">{participants.length} participantes cadastrados</span>
    </section>
  );
}

export default ParticipantsPanel;
