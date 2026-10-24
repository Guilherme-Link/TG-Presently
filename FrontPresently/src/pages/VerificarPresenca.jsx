import { useEffect, useMemo, useState } from "react";
import { MdSearch } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/DashboardComponents/Sidebar/Sidebar (1).jsx";
import BottomNavigation from "../components/DashboardComponents/BottomNavigation/BottomNavigation (1).jsx";
import PageHeader from "../components/PageHeader/PageHeader.jsx";
import {
  getAttendanceOccurrence,
  listDailyAttendanceReport,
} from "../services/attendanceApi.js";
import { listResponsibleEvents } from "../services/eventsApi.js";
import { listParticipants } from "../services/participantsApi.js";
import { apiFetch } from "../utils/api.js";
import "../styles/theme.css";
import "../styles/pages/VerificarPresenca.css";

function formatLocalDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function isScheduledOn(event, date) {
  const [startYear, startMonth, startDay] = String(event?.startDate ?? "")
    .split("-")
    .map(Number);
  const [endYear, endMonth, endDay] = String(event?.endDate ?? "")
    .split("-")
    .map(Number);
  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  const calendarDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (!startYear || !endYear || calendarDay < start || calendarDay > end) return false;
  if (event.eventType !== "RECURRING") return true;
  const interval = Number(event.intervalDays);
  const elapsedDays = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(startYear, startMonth - 1, startDay)) /
      86400000,
  );
  return (
    Number.isFinite(interval) && interval > 0 && elapsedDays % interval === 0
  );
}
function isInProgress(event, now = new Date()) {
  if (!isScheduledOn(event, now)) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (time) => {
    const [hours, minutes] = String(time ?? "")
      .slice(0, 5)
      .split(":")
      .map(Number);
    return Number.isFinite(hours) && Number.isFinite(minutes)
      ? hours * 60 + minutes
      : null;
  };
  const start = toMinutes(event.startTime);
  const end = toMinutes(event.endTime);
  return (
    start !== null &&
    end !== null &&
    currentMinutes >= start &&
    currentMinutes <= end
  );
}
function formatLessonDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
function StatusBadge({ present }) {
  return (
    <span
      className={`vp-status vp-status--${present ? "presente" : "ausente"}`}
    >
      <span className="vp-status__dot" />
      {present ? "Presente" : "Ausente"}
    </span>
  );
}

export default function VerificarPresenca() {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const me = await apiFetch("/security/v1/me", { method: "GET" });
        if (!me?.participantId) throw new Error("missing-participant");
        const today = new Date();
        const [responsibleEvents, allParticipants] = await Promise.all([
          listResponsibleEvents(me.participantId),
          listParticipants(),
        ]);
        const currentEvent = (
          Array.isArray(responsibleEvents) ? responsibleEvents : []
        ).find((event) => isInProgress(event, today));
        if (!currentEvent) {
          if (!cancelled) setLesson(null);
          return;
        }
        let occurrenceDetail = null;
        try {
          const dailyReport = await listDailyAttendanceReport(formatLocalDate(today), me.participantId);
          const occurrence = (Array.isArray(dailyReport) ? dailyReport : []).find(
            (item) => String(item.eventId) === String(currentEvent.id),
          );
          if (occurrence?.occurrenceId) {
            occurrenceDetail = await getAttendanceOccurrence(occurrence.occurrenceId);
          }
        } catch {
          // A falha no relatório de presença não deve impedir a exibição dos participantes.
        }
        const attendanceByParticipantId = new Map(
          (Array.isArray(occurrenceDetail?.attendances)
            ? occurrenceDetail.attendances
            : []
          ).map((attendance) => [String(attendance.participantId), attendance]),
        );
        const participantIds = new Set((currentEvent.participantIds ?? []).map(String));
        const rows = (Array.isArray(allParticipants) ? allParticipants : [])
          .filter((participant) => participantIds.has(String(participant.id)))
          .map((participant) => ({
            id: participant.id,
            name: participant.name,
            present: Boolean(
              attendanceByParticipantId.get(String(participant.id))?.present,
            ),
          }))
          .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
        if (!cancelled) {
          setLesson({
            name: currentEvent.name ?? "Evento",
            date: formatLessonDate(today),
          });
          setParticipants(rows);
        }
      } catch {
        if (!cancelled) {
          setLesson(null);
          setParticipants([]);
          setError("Não foi possível carregar a presença do evento atual.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);
  const filteredParticipants = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return participants.filter((participant) =>
      participant.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
    );
  }, [participants, search]);
  return (
    <div className="vp-page">
      <Sidebar />
      <main className="vp">
        <PageHeader
          breadcrumb="Início › Verificar presença"
          title="Verificar presença"
          className="vp-header"
          breadcrumbClassName="vp-breadcrumb"
          titleClassName="vp-title"
          onBack={() => navigate(-1)}
        />
        <section className="vp-card" aria-busy={loading}>
          <div className="vp-card__toolbar">
            <div className="vp-card__titles">
              <h2 className="vp-card__title">Lista de participantes</h2>
              <span className="vp-card__subtitle">
                {lesson ? `${lesson.name} – ${lesson.date}` : "Evento atual"}
              </span>
            </div>
            <label className="vp-search">
              <MdSearch size={16} aria-hidden="true" />
              <input
                type="search"
                placeholder="Pesquisar participante"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                disabled={loading || !lesson}
              />
            </label>
          </div>
          {loading ? (
            <div className="vp-state">Carregando participantes...</div>
          ) : error ? (
            <div className="vp-state vp-state--error" role="alert">
              {error}
            </div>
          ) : !lesson ? (
            <div className="vp-state">
              Não há evento sob sua responsabilidade ocorrendo agora.
            </div>
          ) : (
            <>
              <div className="vp-table">
                <div className="vp-table__head">
                  <span className="vp-table__col">Nome</span>
                  <span className="vp-table__col">Status</span>
                </div>
                <div className="vp-table__body">
                  {filteredParticipants.map((participant) => (
                    <div key={participant.id} className="vp-table__row">
                      <span className="vp-table__name">{participant.name}</span>
                      <StatusBadge present={participant.present} />
                    </div>
                  ))}
                  {filteredParticipants.length === 0 && (
                    <p className="vp-table__empty">
                      Nenhum participante encontrado.
                    </p>
                  )}
                </div>
              </div>
              <p className="vp-api-note">
                A presença exibida é atualizada a partir das marcações
                realizadas pelos participantes.
              </p>
            </>
          )}
        </section>
      </main>
      <BottomNavigation activeId="scan" />
    </div>
  );
}
