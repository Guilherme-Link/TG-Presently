import { useEffect, useMemo, useState } from "react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdDescription,
  MdPictureAsPdf,
  MdSearch,
  MdSwapVert,
} from "react-icons/md";
import { listDailyAttendanceReport, getAttendanceOccurrence } from "../services/attendanceApi.js";
import { listEvents, listResponsibleEvents } from "../services/eventsApi.js";
import { apiFetch } from "../utils/api.js";
import Sidebar from "../components/DashboardComponents/Sidebar/Sidebar (1).jsx";
import SidebarAdmin from "../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
import "../styles/theme.css";
import "../styles/pages/Dashboard.css";
import "../styles/pages/HistoricoDeEventos.css";

const PAGE_SIZE = 10;

function parseLocalDate(value) {
  const [year, month, day] = String(value ?? "").split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
}

function toIsoDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDate(value) {
  const date = parseLocalDate(value);
  return date
    ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date)
    : "Data não informada";
}

function getScheduledDates(event) {
  const start = parseLocalDate(event?.startDate);
  const end = parseLocalDate(event?.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!start || !end || start > today) return [];

  const lastDate = end < today ? end : today;
  const interval = event.eventType === "RECURRING" ? Math.max(Number(event.intervalDays) || 1, 1) : 1;
  const dates = [];

  for (const date = new Date(start); date <= lastDate; date.setDate(date.getDate() + interval)) {
    dates.push(toIsoDate(date));
  }

  return dates;
}

function StatusBadge({ present }) {
  return (
    <span className={`hde-status hde-status--${present ? "presente" : "ausente"}`}>
      <span className="hde-status__dot" />
      {present ? "Presente" : "Ausente"}
    </span>
  );
}

function printAttendance(event, participants) {
  const frame = document.createElement("iframe");
  frame.className = "hde-print-frame";
  document.body.appendChild(frame);

  const eventName = event.eventName ?? event.name ?? "Evento";
  const rows = participants.map((participant) => `
    <tr><td>${escapeHtml(participant.participantName)}</td><td>${participant.present ? "Presente" : "Ausente"}</td></tr>
  `).join("");
  const documentToPrint = frame.contentWindow.document;
  documentToPrint.open();
  documentToPrint.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />
    <title>Lista de presença - ${escapeHtml(eventName)}</title>
    <style>body{font-family:Arial,sans-serif;color:#2f2f2f;margin:32px}h1{color:#ff1e1e;font-size:22px}p{color:#666}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{padding:12px 8px;border-bottom:1px solid #e7e7e7;text-align:left}th{color:#777;font-size:12px;text-transform:uppercase}</style>
  </head><body><h1>Lista de presença</h1><p>${escapeHtml(eventName)} — ${escapeHtml(formatDate(event.eventDate))}</p>
  <table><thead><tr><th>Nome</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
  documentToPrint.close();

  window.setTimeout(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    window.setTimeout(() => frame.remove(), 1000);
  }, 100);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function ParticipantsModal({ event, onClose }) {
  const [search, setSearch] = useState("");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfError, setPdfError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAttendanceOccurrence(event.occurrenceId)
      .then((detail) => {
        if (!cancelled) {
          setParticipants(Array.isArray(detail?.attendances) ? detail.attendances : []);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar os participantes desta ocorrência.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [event.occurrenceId]);

  useEffect(() => {
    const closeOnEscape = (keyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const visibleParticipants = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return participants.filter((participant) =>
      String(participant.name ?? "").toLocaleLowerCase("pt-BR").includes(normalizedSearch)
    );
  }, [participants, search]);

  function handleGeneratePdf() {
    setPdfError("");
    try {
      printAttendance(event, participants);
    } catch {
      setPdfError("Não foi possível preparar o documento para impressão.");
    }
  }

  return (
    <div className="hde-modal-overlay" role="presentation" onClick={onClose}>
      <section className="hde-modal" role="dialog" aria-modal="true" aria-labelledby="hde-modal-title" onClick={(clickEvent) => clickEvent.stopPropagation()}>
        <button type="button" className="hde-modal__close" onClick={onClose} aria-label="Fechar"><MdClose size={18} /></button>
        <div className="hde-modal__toolbar">
          <div className="hde-modal__titles">
            <h2 id="hde-modal-title" className="hde-modal__title">Lista de participantes</h2>
            <span className="hde-modal__subtitle">{event.eventName ?? event.name ?? "Evento"} — {formatDate(event.eventDate)}</span>
          </div>
          <div className="hde-modal__actions">
            <label className="hde-search"><MdSearch size={16} aria-hidden="true" /><input type="search" placeholder="Pesquisar aluno" value={search} onChange={(changeEvent) => setSearch(changeEvent.target.value)} disabled={loading} /></label>
            <button type="button" className="hde-pdf-btn" onClick={handleGeneratePdf} disabled={loading || Boolean(error)}><MdPictureAsPdf size={16} />Gerar PDF</button>
          </div>
        </div>
        {pdfError && <p className="hde-modal__error" role="alert">{pdfError}</p>}
        {loading ? <div className="hde-modal__state">Carregando participantes...</div>
          : error ? <div className="hde-modal__state hde-modal__state--error" role="alert">{error}</div>
            : <div className="hde-modal__table"><div className="hde-modal__table-head"><span>Nome</span><span>Status</span></div><div className="hde-modal__table-body">
              {visibleParticipants.map((participant) => <div key={participant.participantId} className="hde-modal__row"><span className="hde-modal__name">{participant.participantName ?? "Participante"}</span><StatusBadge present={participant.present} /></div>)}
              {!visibleParticipants.length && <p className="hde-modal__empty">Nenhum participante encontrado.</p>}
            </div></div>}
      </section>
    </div>
  );
}

export default function HistoricoDeEventos() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortAscending, setSortAscending] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAdminViewer, setIsAdminViewer] = useState(() => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("presently_auth") ?? "null");
      return currentUser?.roles?.includes("ROLE_ADMIN") ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const currentUser = await apiFetch("/security/v1/me", { method: "GET" });
        const isAdmin = currentUser?.roles?.includes("ROLE_ADMIN");
        const isResponsible = currentUser?.roles?.includes("ROLE_RESPONSIBLE");
        if (!isAdmin && !isResponsible) throw new Error("forbidden");
        setIsAdminViewer(Boolean(isAdmin));

        const sourceEvents = await (isAdmin ? listEvents() : listResponsibleEvents(currentUser.participantId));
        const eventList = Array.isArray(sourceEvents) ? sourceEvents : [];
        const dates = [...new Set(eventList.flatMap(getScheduledDates))];
        const reports = await Promise.all(dates.map((date) => listDailyAttendanceReport(date, isAdmin ? undefined : currentUser.participantId)));
        const knownEventIds = new Set(eventList.map((event) => String(event.id)));
        const occurrences = reports.flat().filter((occurrence) => knownEventIds.has(String(occurrence.eventId)));
        const uniqueOccurrences = Array.from(new Map(occurrences.map((occurrence) => [String(occurrence.occurrenceId), occurrence])).values());

        if (!cancelled) setEvents(uniqueOccurrences);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message === "forbidden" ? "Esta área não está disponível para o seu perfil." : "Não foi possível carregar o histórico de eventos.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return events.filter((event) => String(event.eventName ?? "").toLocaleLowerCase("pt-BR").includes(normalizedSearch))
      .sort((left, right) => sortAscending ? String(left.eventDate).localeCompare(String(right.eventDate)) : String(right.eventDate).localeCompare(String(left.eventDate)));
  }, [events, search, sortAscending]);
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const visibleEvents = filteredEvents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="dashboard hde-page">
      {isAdminViewer ? (
        <SidebarAdmin activeItem="historico-eventos-link" />
      ) : (
        <Sidebar />
      )}
      <div className="dashboard__content">
      <main className="hde">
      <header className="hde-header"><span className="hde-breadcrumb">Início &gt; Histórico de eventos</span><h1 className="hde-title">Histórico de eventos</h1></header>
      <section className="hde-card" aria-busy={loading}>
        <div className="hde-card__toolbar"><h2 className="hde-card__title">Histórico de eventos</h2><label className="hde-search"><MdSearch size={16} aria-hidden="true" /><input type="search" placeholder="Pesquisar evento" value={search} onChange={(changeEvent) => { setSearch(changeEvent.target.value); setPage(1); }} disabled={loading || Boolean(error)} /></label></div>
        {loading ? <div className="hde-state">Carregando histórico...</div>
          : error ? <div className="hde-state hde-state--error" role="alert">{error}</div>
            : <><div className="hde-table"><div className="hde-table__head"><span className="hde-table__col">Nome</span><button type="button" className="hde-table__sort" onClick={() => { setSortAscending((value) => !value); setPage(1); }}>Data <MdSwapVert size={14} /></button><span className="hde-table__col hde-table__col--action">Verificar</span></div><div className="hde-table__body">
              {visibleEvents.map((event) => <div key={event.occurrenceId} className="hde-table__row"><span className="hde-table__name">{event.eventName ?? "Evento"}</span><span className="hde-table__date">{formatDate(event.eventDate)}</span><button type="button" className="hde-icon-btn" aria-label={`Verificar participantes de ${event.eventName}`} onClick={() => setSelectedEvent(event)}><MdDescription size={17} /></button></div>)}
              {!visibleEvents.length && <p className="hde-table__empty">Nenhum evento com presença registrada foi encontrado.</p>}
            </div></div>{totalPages > 1 && <div className="hde-pagination"><button type="button" className="hde-pagination__nav" onClick={() => setPage((value) => value - 1)} disabled={page === 1}><MdChevronLeft size={16} />Anterior</button><span className="hde-pagination__count">Página {page} de {totalPages}</span><button type="button" className="hde-pagination__nav" onClick={() => setPage((value) => value + 1)} disabled={page === totalPages}>Próximo<MdChevronRight size={16} /></button></div>}</>}
      </section>
      {selectedEvent && <ParticipantsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      </main>
      </div>
    </div>
  );
}
