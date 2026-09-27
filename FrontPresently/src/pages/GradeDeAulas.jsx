import { useEffect, useMemo, useState } from "react";
import { MdChevronLeft, MdChevronRight, MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/DashboardComponents/Sidebar/Sidebar (1).jsx";
import BottomNavigation from "../components/DashboardComponents/BottomNavigation/BottomNavigation (1).jsx";
import { listAmbients } from "../services/ambientsApi.js";
import { listParticipatingEvents, listResponsibleEvents } from "../services/eventsApi.js";
import { listParticipants } from "../services/participantsApi.js";
import { apiFetch } from "../utils/api.js";
import "../styles/theme.css";
import "../styles/pages/Dashboard.css";
import "../styles/pages/GradeDeAulas.css";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function parseLocalDate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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

function formatLongDate(date) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(date);
}

function getEventsForDate(date, events, participantsById, ambientsById) {
  return events
    .filter((event) => isEventScheduledOn(event, date))
    .map((event) => ({
      id: `${event.id}-${formatDate(date)}`,
      subject: event.name ?? "Aula",
      time: formatTime(event.startTime) && formatTime(event.endTime)
        ? `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`
        : formatTime(event.startTime) || formatTime(event.endTime) || "Horário não informado",
      room: ambientsById.get(String(event.ambientId ?? ""))?.name,
      professor: participantsById.get(String(event.responsibleId ?? ""))?.name,
      startTime: String(event.startTime ?? ""),
    }))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function buildCalendarDays(monthDate) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function Calendar({ monthDate, selectedDate, today, events, participantsById, ambientsById, onSelectDate, onMoveMonth }) {
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(monthDate);
  return (
    <section className="gda-calendar" aria-label="Calendário mensal">
      <div className="gda-calendar__heading">
        <button type="button" className="gda-calendar__arrow" onClick={() => onMoveMonth(-1)} aria-label="Mês anterior"><MdChevronLeft /></button>
        <h2>{monthLabel}</h2>
        <button type="button" className="gda-calendar__arrow" onClick={() => onMoveMonth(1)} aria-label="Próximo mês"><MdChevronRight /></button>
      </div>
      <div className="gda-calendar__grid">
        {WEEKDAYS.map((day) => <span className="gda-calendar__weekday" key={day}>{day}</span>)}
        {buildCalendarDays(monthDate).map((date) => {
          const dateKey = formatDate(date);
          const dayEvents = getEventsForDate(date, events, participantsById, ambientsById);
          const selected = dateKey === formatDate(selectedDate);
          return (
            <button
              type="button"
              key={dateKey}
              className={`gda-calendar__day${date.getMonth() !== monthDate.getMonth() ? " is-outside" : ""}${selected ? " is-selected" : ""}${dateKey === formatDate(today) ? " is-today" : ""}${dayEvents.length ? " has-events" : ""}`}
              onClick={() => onSelectDate(date)}
              aria-label={`${formatLongDate(date)}${dayEvents.length ? `, ${dayEvents.length} ${dayEvents.length === 1 ? "aula" : "aulas"}` : ""}`}
              aria-pressed={selected}
            >
              <span>{date.getDate()}</span>
              {dayEvents.length > 0 && <i aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function WeeklyUpcoming({ selectedDate, events, participantsById, ambientsById }) {
  const upcoming = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + index);
    return { date, items: getEventsForDate(date, events, participantsById, ambientsById) };
  }).flatMap(({ date, items }) => items.map((item) => ({ ...item, date })));

  return (
    <section className="gda-upcoming" aria-live="polite">
      <div className="gda-upcoming__heading">
        <div><span className="gda-eyebrow">Sua semana</span><h2>Próximas aulas</h2></div>
        <span className="gda-upcoming__range">7 dias a partir de {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(selectedDate)}</span>
      </div>
      {upcoming.length ? (
        <ul className="gda-upcoming__list">
          {upcoming.map((item) => (
            <li className="gda-upcoming__item" key={item.id}>
              <span className="gda-upcoming__marker" aria-hidden="true" />
              <div className="gda-upcoming__date"><strong>{new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(item.date).replace(".", "")}</strong><span>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(item.date)}</span></div>
              <div className="gda-upcoming__details"><strong>{item.subject}</strong><span>{item.room || item.professor || "Aula"}</span></div>
              <span className="gda-upcoming__time">{item.time}</span>
            </li>
          ))}
        </ul>
      ) : <div className="gda-upcoming__empty">Nenhuma aula nos próximos 7 dias.</div>}
    </section>
  );
}

export default function GradeDeAulas({ mobile = false }) {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [ambients, setAmbients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [monthDate, setMonthDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
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
        const userIsResponsible = me.roles?.includes("ROLE_RESPONSIBLE") ?? false;
        const [eventResponse, participantsResponse, ambientsResponse] = await Promise.all([
          userIsResponsible ? listResponsibleEvents(me.participantId) : listParticipatingEvents(me.participantId),
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

  function moveMonth(amount) {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  function selectDate(date) {
    setSelectedDate(date);
    if (date.getMonth() !== monthDate.getMonth() || date.getFullYear() !== monthDate.getFullYear()) {
      setMonthDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }

  return (
    <div className={`dashboard ${mobile ? "gda-page--mobile" : "dashboard--desktop"} gda-page`}>
      {!mobile && <Sidebar activeId="grade" />}
      <div className="dashboard__content">
        <main className="gda">
          {mobile ? (
            <header className="gda-mobile-topbar"><button type="button" onClick={() => navigate(-1)} aria-label="Voltar"><MdArrowBackIosNew size={15} /></button><span>Grade de aulas</span></header>
          ) : (
            <header className="gda-header"><span className="gda-breadcrumb">Início &gt; Grade de aulas</span><h1 className="gda-title">Grade de aulas</h1></header>
          )}
          {error ? <div className="gda-state gda-state--error" role="alert">{error}</div> : (
            <div className="gda-content">
              <Calendar monthDate={monthDate} selectedDate={selectedDate} today={today} events={events} participantsById={participantsById} ambientsById={ambientsById} onSelectDate={selectDate} onMoveMonth={moveMonth} />
              {loading ? <div className="gda-state">Carregando suas aulas...</div> : <WeeklyUpcoming selectedDate={selectedDate} events={events} participantsById={participantsById} ambientsById={ambientsById} />}
            </div>
          )}
        </main>
      </div>
      {mobile && <BottomNavigation activeId="grade" />}
    </div>
  );
}
