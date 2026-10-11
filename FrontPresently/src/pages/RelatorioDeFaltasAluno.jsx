import { useEffect, useMemo, useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/DashboardComponents/Sidebar/Sidebar (1).jsx";
import BottomNavigation from "../components/DashboardComponents/BottomNavigation/BottomNavigation (1).jsx";
import PageHeader from "../components/PageHeader/PageHeader.jsx";
import { listParticipatingEvents } from "../services/eventsApi.js";
import { apiFetch } from "../utils/api.js";
import "../styles/theme.css";
import "../styles/pages/Dashboard.css";
import "../styles/pages/RelatorioDeFaltasAluno.css";

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value) {
  if (!value) return null;

  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDate(value) {
  const date = parseLocalDate(value);
  return date
    ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date)
    : "Data não informada";
}

function getScheduledOccurrences(events) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const occurrences = [];

  events.forEach((event) => {
    const start = parseLocalDate(event?.startDate);
    const end = parseLocalDate(event?.endDate);
    if (!start || !end) return;

    const lastDate = end < today ? end : today;
    const interval = event.eventType === "RECURRING" ? Math.max(Number(event.intervalDays) || 1, 1) : 1;

    for (let date = new Date(start); date <= lastDate; date.setDate(date.getDate() + interval)) {
      occurrences.push({ event, date: formatLocalDate(date) });
    }
  });

  return occurrences;
}

function hasEnded(event, date) {
  const today = new Date();
  const eventDate = parseLocalDate(date);
  if (!eventDate) return false;

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (eventDate < todayStart) return true;
  if (eventDate > todayStart) return false;

  const endTime = String(event?.endTime ?? "").slice(0, 5);
  if (!/^\d{2}:\d{2}$/.test(endTime)) return false;
  const [hour, minute] = endTime.split(":").map(Number);
  return today.getHours() * 60 + today.getMinutes() > hour * 60 + minute;
}

async function loadStudentReport() {
  const currentUser = await apiFetch("/security/v1/me", { method: "GET" });
  const participantId = currentUser?.participantId;

  if (!participantId) {
    return { currentUser, subjects: [] };
  }

  const events = await listParticipatingEvents(participantId);
  const scheduledOccurrences = getScheduledOccurrences(Array.isArray(events) ? events : []);
  const dates = Array.from(new Set(scheduledOccurrences.map(({ date }) => date)));
  const recordsByDate = await Promise.all(
    dates.map((date) =>
      apiFetch(
        `/api/v1/attendanceReport/participants/${participantId}?date=${encodeURIComponent(date)}`,
        { method: "GET" },
      ),
    ),
  );

  const recordsByOccurrence = new Map(
    recordsByDate.flat().map((record) => [
      `${record?.eventId ?? ""}|${record?.eventDate ?? ""}`,
      record,
    ]),
  );
  const subjects = new Map();

  scheduledOccurrences.forEach(({ event, date }) => {
    if (!hasEnded(event, date)) return;

    const id = String(event.id);
    const record = recordsByOccurrence.get(`${event.id}|${date}`);
    const subject = subjects.get(id) ?? {
      id,
      name: event.name ?? "Evento sem nome",
      totalClasses: 0,
      absences: 0,
      missedDates: [],
      attendedClasses: 0,
    };

    subject.totalClasses += 1;
    if (record?.present) {
      subject.attendedClasses += 1;
    } else {
      subject.absences += 1;
      subject.missedDates.push(date);
    }
    subjects.set(id, subject);
  });

  // Preserva registros existentes mesmo se o evento tiver sido removido da lista atual.
  recordsByDate.flat().forEach((record) => {
    if (!record?.eventId || !record?.eventDate || subjects.has(String(record.eventId))) return;
    if (!record.present && !record.closed) return;

    const id = String(record.eventId);
    subjects.set(id, {
      id,
      name: record.eventName ?? "Evento sem nome",
      totalClasses: 1,
      absences: record.present ? 0 : 1,
      missedDates: record.present ? [] : [record.eventDate],
      attendedClasses: record.present ? 1 : 0,
    });
  });

  return {
    currentUser,
    subjects: Array.from(subjects.values()).sort((left, right) => left.name.localeCompare(right.name, "pt-BR")),
  };
}

function SummaryCard({ title, value, description, tone }) {
  return (
    <div className="rfa-summary-card">
      <span className="rfa-summary-card__title">{title}</span>
      <strong className={`rfa-summary-card__value rfa-summary-card__value--${tone}`}>{value}</strong>
      <span className="rfa-summary-card__description">{description}</span>
    </div>
  );
}

function SubjectCard({ subject, isOpen, onToggle }) {
  const percentage = subject.totalClasses ? (subject.absences / subject.totalClasses) * 100 : 0;

  return (
    <div className={`rfa-subject ${isOpen ? "rfa-subject--open" : ""}`}>
      <button type="button" className="rfa-subject__header" onClick={onToggle} aria-expanded={isOpen}>
        <span className="rfa-subject__name">{subject.name}</span>
        {isOpen ? <MdKeyboardArrowUp size={18} /> : <MdKeyboardArrowDown size={18} />}
      </button>

      <div className={`rfa-subject__body ${isOpen ? "rfa-subject__body--open" : ""}`} aria-hidden={!isOpen}>
          <strong className="rfa-subject__fraction">{subject.absences}/{subject.totalClasses}</strong>
          <span className="rfa-subject__fraction-label">Faltas em aulas encerradas</span>
          <div className="rfa-subject__bar-row">
            <span className="rfa-subject__bar-bound">0</span>
            <div className="rfa-subject__bar"><span className="rfa-subject__bar-fill" style={{ width: `${percentage}%` }} /></div>
            <span className="rfa-subject__bar-bound">{subject.totalClasses}</span>
          </div>
          <span className="rfa-subject__days-label">Dias faltados</span>
          <div className="rfa-subject__days">
            {subject.missedDates.length ? subject.missedDates.map((date) => (
              <span key={date} className="rfa-subject__day-chip">{formatDate(date)}</span>
            )) : <span className="rfa-subject__no-absences">Nenhuma falta registrada</span>}
          </div>
      </div>
    </div>
  );
}

export default function RelatorioDeFaltasAluno({ mobile = false }) {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [openSubjectId, setOpenSubjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadStudentReport()
      .then((report) => {
        if (cancelled) return;
        setSubjects(report.subjects);
        setOpenSubjectId(report.subjects[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar seu relatório de faltas.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const summary = useMemo(() => {
    const totalClasses = subjects.reduce((total, subject) => total + subject.totalClasses, 0);
    const totalAbsences = subjects.reduce((total, subject) => total + subject.absences, 0);
    const attendanceRate = totalClasses ? ((totalClasses - totalAbsences) / totalClasses) * 100 : 0;
    const disciplineLabel = `${subjects.length} ${subjects.length === 1 ? "disciplina" : "disciplinas"}`;
    return [
      { id: "faltas", title: "Faltas totais", value: totalAbsences, description: disciplineLabel, tone: "danger" },
      { id: "frequencia", title: "Frequência média", value: `${Math.round(attendanceRate)}%`, description: "aulas encerradas", tone: "success" },
    ];
  }, [subjects]);

  return (
    <div className={`dashboard ${mobile ? "rfa-page--mobile" : "dashboard--desktop"} rfa-page`}>
      {!mobile && <Sidebar activeId="relatorio" />}
      <div className="dashboard__content">
        <main className="rfa">
          <PageHeader breadcrumb="Início › Relatório de faltas" title="Relatório de faltas" className={mobile ? "" : "rfa-header"} breadcrumbClassName="rfa-breadcrumb" titleClassName="rfa-title" onBack={mobile ? () => navigate(-1) : undefined} />
          {loading ? <div className="rfa-state">Carregando seu relatório...</div> : error ? <div className="rfa-state rfa-state--error" role="alert">{error}</div> : (
            <>
              <section className="rfa-summary">{summary.map((item) => <SummaryCard key={item.id} {...item} />)}</section>
              {subjects.length ? <section className="rfa-subjects">{subjects.map((subject) => <SubjectCard key={subject.id} subject={subject} isOpen={openSubjectId === subject.id} onToggle={() => setOpenSubjectId((id) => id === subject.id ? null : subject.id)} />)}</section> : <div className="rfa-state">Ainda não há aulas encerradas para compor seu relatório.</div>}
            </>
          )}
        </main>
      </div>
      {mobile && <BottomNavigation activeId="report" />}
    </div>
  );
}
