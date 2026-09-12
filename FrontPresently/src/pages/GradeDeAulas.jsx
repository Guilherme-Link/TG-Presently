import { useEffect, useMemo, useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/DashboardComponents/Sidebar/Sidebar (1).jsx";
import BottomNavigation from "../components/DashboardComponents/BottomNavigation/BottomNavigation (1).jsx";
import { listAmbients } from "../services/ambientsApi.js";
import { listParticipatingEvents } from "../services/eventsApi.js";
import { listParticipants } from "../services/participantsApi.js";
import { apiFetch } from "../utils/api.js";
import "../styles/theme.css";
import "../styles/pages/Dashboard.css";
import "../styles/pages/GradeDeAulas.css";

const VISIBLE_DAYS = 3;
const WEEKDAY_NAMES = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

function parseLocalDate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
}

function formatDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfWeek(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - daysFromMonday);
  return result;
}

function isEventScheduledOn(event, date) {
  const startDate = parseLocalDate(event?.startDate);
  const endDate = parseLocalDate(event?.endDate);
  if (!startDate || !endDate || date < startDate || date > endDate) return false;
  if (event.eventType !== "RECURRING") return true;

  const intervalDays = Number(event.intervalDays);
  if (!Number.isFinite(intervalDays) || intervalDays <= 0) return false;
  const startUtc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((dateUtc - startUtc) / 86400000) % intervalDays === 0;
}

function formatTime(value) {
  return value ? String(value).slice(0, 5) : "";
}

function getDateLabel(date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
}

function buildDays(weekStart, events, participantsById, ambientsById) {
  return WEEKDAY_NAMES.map((label, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const slots = events
      .filter((event) => isEventScheduledOn(event, date))
      .map((event) => ({
        id: `${event.id}-${formatDate(date)}`,
        subject: event.name ?? "Evento",
        time: formatTime(event.startTime) && formatTime(event.endTime)
          ? `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`
          : formatTime(event.startTime) || formatTime(event.endTime) || "Horário não informado",
        room: ambientsById.get(String(event.ambientId ?? ""))?.name ?? "Sala não informada",
        professor: participantsById.get(String(event.responsibleId ?? ""))?.name ?? "Responsável não informado",
        startTime: String(event.startTime ?? ""),
      }))
      .sort((left, right) => left.startTime.localeCompare(right.startTime));

    return { id: formatDate(date), label, dateLabel: getDateLabel(date), slots };
  });
}

function DayColumn({ day }) {
  return (
    <div className="gda-day">
      <div className="gda-day__header">
        <span>{day.label}</span>
        <small>{day.dateLabel}</small>
      </div>
      <div className="gda-day__slots">
        {day.slots.length ? day.slots.map((slot) => (
          <div key={slot.id} className="gda-slot" title={`${slot.subject} · ${slot.room}`}>
            <strong>{slot.subject}</strong>
            <span>{slot.time}</span>
            <small>{slot.room}</small>
          </div>
        )) : <div className="gda-slot gda-slot--empty">Nenhuma aula</div>}
      </div>
    </div>
  );
}

export default function GradeDeAulas({ mobile = false }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [ambients, setAmbients] = useState([]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const me = await apiFetch("/security/v1/me", { method: "GET" });
        if (!me?.participantId) throw new Error("missing-participant");

        const [eventResponse, participantsResponse, ambientsResponse] = await Promise.all([
          listParticipatingEvents(me.participantId),
          listParticipants(),
          listAmbients(),
        ]);

        if (cancelled) return;
        setEvents(Array.isArray(eventResponse) ? eventResponse : []);
        setParticipants(Array.isArray(participantsResponse) ? participantsResponse : []);
        setAmbients(Array.isArray(ambientsResponse) ? ambientsResponse : []);
      } catch {
        if (!cancelled) setError("Não foi possível carregar sua grade de aulas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const participantsById = useMemo(() => new Map(participants.map((item) => [String(item.id), item])), [participants]);
  const ambientsById = useMemo(() => new Map(ambients.map((item) => [String(item.id), item])), [ambients]);
  const days = useMemo(() => buildDays(weekStart, events, participantsById, ambientsById), [weekStart, events, participantsById, ambientsById]);
  const visibleDays = days.slice(startIndex, startIndex + VISIBLE_DAYS);

  function moveWeek(amount) {
    setWeekStart((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + amount * 7);
      return next;
    });
    setStartIndex(0);
  }

  return (
    <div className={`dashboard ${mobile ? "gda-page--mobile" : "dashboard--desktop"} gda-page`}>
      {!mobile && <Sidebar activeId="grade" />}
      <div className="dashboard__content">
        <main className="gda">
          {mobile ? (
            <header className="gda-mobile-topbar">
              <button type="button" onClick={() => navigate(-1)} aria-label="Voltar"><MdArrowBackIosNew size={15} /></button>
              <span>Grade de aulas</span>
            </header>
          ) : (
            <header className="gda-header">
              <span className="gda-breadcrumb">Início &gt; Grade de aulas</span>
              <div className="gda-title-row"><h1 className="gda-title">Grade de aulas</h1><div className="gda-week-actions"><button type="button" onClick={() => moveWeek(-1)}>Semana anterior</button><button type="button" onClick={() => { setWeekStart(startOfWeek(new Date())); setStartIndex(0); }}>Semana atual</button><button type="button" onClick={() => moveWeek(1)}>Próxima semana</button></div></div>
            </header>
          )}
          {loading ? <div className="gda-state">Carregando sua grade...</div> : error ? <div className="gda-state gda-state--error" role="alert">{error}</div> : !events.length ? <div className="gda-state">Nenhuma aula encontrada para este aluno.</div> : (
            <div className="gda-carousel">
              <button type="button" className="gda-nav" onClick={() => setStartIndex((index) => Math.max(index - 1, 0))} disabled={startIndex === 0} aria-label="Dias anteriores"><MdChevronLeft size={22} /></button>
              <div className="gda-card"><div className="gda-grid" style={{ "--gda-columns": VISIBLE_DAYS }}>{visibleDays.map((day) => <DayColumn key={day.id} day={day} />)}</div></div>
              <button type="button" className="gda-nav" onClick={() => setStartIndex((index) => Math.min(index + 1, days.length - VISIBLE_DAYS))} disabled={startIndex + VISIBLE_DAYS >= days.length} aria-label="Próximos dias"><MdChevronRight size={22} /></button>
            </div>
          )}
        </main>
      </div>
      {mobile && <BottomNavigation activeId="grade" />}
    </div>
  );
}
