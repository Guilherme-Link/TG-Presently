import { useCallback, useEffect, useMemo, useState } from "react";
import { MdTrendingUp, MdOutlineEventAvailable, MdOutlinePerson } from "react-icons/md";
import SidebarAdmin from "../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
import PageHeader from "../components/PageHeader/PageHeader.jsx";
import { adminSidebarSections } from "../data/dashboardDataAdmin";
import { getAttendanceOccurrence, listDailyAttendanceReport } from "../services/attendanceApi.js";
import { listEvents } from "../services/eventsApi.js";
import { listParticipants } from "../services/participantsApi.js";
import "../styles/theme.css";
import "../styles/pages/Tendencias.css";

const PERIOD_OPTIONS = [
  { value: 28, label: "Últimas 4 semanas" },
  { value: 56, label: "Últimas 8 semanas" },
  { value: 84, label: "Últimas 12 semanas" },
];

function toIsoDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getPeriodDates(dayCount) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - dayCount + index);
    return toIsoDate(date);
  });
}

async function loadInBatches(items, batchSize, loadItem) {
  const results = [];
  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    results.push(...await Promise.all(batch.map(loadItem)));
  }
  return results;
}

function percentage(numerator, denominator) {
  return denominator ? Math.round((numerator / denominator) * 100) : null;
}

function formatPercent(value) {
  return value === null ? "—" : `${value}%`;
}

function buildWeeklySeries(occurrences, participantId, eventId, dayCount) {
  const dates = getPeriodDates(dayCount);
  const weeks = Array.from({ length: dayCount / 7 }, (_, index) => ({
    label: `Sem. ${index + 1}`,
    present: 0,
    total: 0,
  }));

  occurrences.forEach((occurrence) => {
    if (eventId && String(occurrence.eventId) !== eventId) return;
    const dayIndex = dates.indexOf(occurrence.eventDate);
    if (dayIndex < 0 || dayIndex >= dayCount) return;
    const targetWeek = weeks[Math.floor(dayIndex / 7)];
    (occurrence.detail?.attendances ?? []).forEach((attendance) => {
      if (participantId && String(attendance.participantId) !== participantId) return;
      targetWeek.total += 1;
      if (attendance.present) targetWeek.present += 1;
    });
  });

  const currentWeekIndex = Math.floor((dayCount - 1) / 7);
  weeks[currentWeekIndex].label = "Semana atual";
  return weeks.map((week) => ({ ...week, value: percentage(week.present, week.total) }));
}

function TrendChart({ series }) {
  const chartWidth = 720;
  const chartHeight = 230;
  const left = 42;
  const right = 12;
  const top = 16;
  const bottom = 34;
  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const coordinates = series.map((item, index) => ({
    ...item,
    x: left + (series.length === 1 ? plotWidth / 2 : index * plotWidth / (series.length - 1)),
    y: item.value === null ? null : top + (100 - item.value) * plotHeight / 100,
  }));
  const points = coordinates.filter((item) => item.y !== null);
  const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");

  return (
    <div className="trend-chart" role="img" aria-label="Evolução semanal da taxa de presença">
      <svg className="trend-chart__svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = top + (100 - tick) * plotHeight / 100;
          return <g key={tick}><line x1={left} x2={chartWidth - right} y1={y} y2={y} className="trend-chart__gridline" /><text x={left - 8} y={y + 4} className="trend-chart__axis-label" textAnchor="end">{tick}%</text></g>;
        })}
        {path && <path d={path} className="trend-chart__line" />}
        {points.map((point) => <circle key={point.label} cx={point.x} cy={point.y} r="4" className="trend-chart__point"><title>{point.label}: {point.value}% ({point.present}/{point.total})</title></circle>)}
        {coordinates.map((point) => <text key={`${point.label}-label`} x={point.x} y={chartHeight - 10} className="trend-chart__axis-label" textAnchor="middle">{point.label}</text>)}
      </svg>
      {!points.length && <p className="trend-chart__empty">Ainda não há aulas realizadas com registros no período selecionado.</p>}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone }) {
  return (
    <article className={`trend-metric trend-metric--${tone}`}>
      <span className="trend-metric__icon"><Icon size={20} /></span>
      <span className="trend-metric__label">{label}</span>
      <strong className="trend-metric__value">{value}</strong>
      <span className="trend-metric__detail">{detail}</span>
    </article>
  );
}

export default function Tendencias() {
  const [period, setPeriod] = useState(28);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const dates = getPeriodDates(period);
      const [eventData, participantData, dailyReports] = await Promise.all([
        listEvents(),
        listParticipants(),
        loadInBatches(dates, 7, (date) => listDailyAttendanceReport(date)),
      ]);
      const uniqueOccurrences = Array.from(new Map(
        dailyReports.flat().map((occurrence) => [String(occurrence.occurrenceId), occurrence]),
      ).values());
      const details = await loadInBatches(uniqueOccurrences, 10, (item) => getAttendanceOccurrence(item.occurrenceId));
      const detailById = new Map(details.map((detail) => [String(detail.occurrenceId), detail]));
      setEvents(Array.isArray(eventData) ? eventData : []);
      setParticipants(Array.isArray(participantData) ? participantData : []);
      setOccurrences(uniqueOccurrences.map((item) => ({
        ...item,
        detail: detailById.get(String(item.occurrenceId)),
      })));
    } catch {
      setError("Não foi possível carregar os indicadores de frequência.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { void load(); }, [load]);

  const filteredRecords = useMemo(() => occurrences
    .filter((occurrence) => !selectedEventId || String(occurrence.eventId) === selectedEventId)
    .filter((occurrence) => occurrence.eventDate < toIsoDate(new Date()))
    .flatMap((occurrence) => (occurrence.detail?.attendances ?? [])
      .filter((attendance) => !selectedParticipantId || String(attendance.participantId) === selectedParticipantId)
      .map((attendance) => ({ ...attendance, eventDate: occurrence.eventDate, eventId: occurrence.eventId }))),
  [occurrences, selectedEventId, selectedParticipantId]);

  const totals = useMemo(() => {
    const present = filteredRecords.filter((record) => record.present).length;
    const total = filteredRecords.length;
    return { present, absent: total - present, total, attendance: percentage(present, total), absenteeism: percentage(total - present, total) };
  }, [filteredRecords]);

  const weeklySeries = useMemo(() => buildWeeklySeries(
    occurrences,
    selectedParticipantId,
    selectedEventId,
    period,
  ), [occurrences, period, selectedEventId, selectedParticipantId]);

  const periodLabel = PERIOD_OPTIONS.find((option) => option.value === period)?.label.toLocaleLowerCase("pt-BR");
  const eventFilterOptions = events.filter((event) => !selectedParticipantId || (event.participantIds ?? []).some((id) => String(id) === selectedParticipantId));
  const participantFilterOptions = participants.filter((participant) => !selectedEventId || events.find((event) => String(event.id) === selectedEventId)?.participantIds?.some((id) => String(id) === String(participant.id)));

  return (
    <div className="trend-page">
      <SidebarAdmin sections={adminSidebarSections} activeItem="tendencias-link" />
      <div className="trend-page__content">
        <main className="trend-main">
          <PageHeader breadcrumb="Início › Tendências" title="Tendências de frequência" className="trend-header" />
          <section className="trend-panel">
            <div className="trend-panel__intro">
              <div><h2>Acompanhe a frequência</h2><p>Indicadores calculados a partir das aulas realizadas e dos registros de presença.</p></div>
              <label className="trend-period"><span>Período</span><select value={period} onChange={(event) => setPeriod(Number(event.target.value))}>{PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            </div>

            <div className="trend-filters">
              <label><span>Disciplina / evento</span><select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}><option value="">Todos os eventos</option>{eventFilterOptions.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select></label>
              <label><span>Aluno</span><select value={selectedParticipantId} onChange={(event) => setSelectedParticipantId(event.target.value)}><option value="">Todos os alunos</option>{participantFilterOptions.map((participant) => <option key={participant.id} value={participant.id}>{participant.name}</option>)}</select></label>
            </div>

            {loading ? <div className="trend-state">Carregando dados de frequência…</div> : error ? <div className="trend-state trend-state--error" role="alert">{error}<button type="button" onClick={load}>Tentar novamente</button></div> : <>
              <div className="trend-metrics">
                <MetricCard icon={MdTrendingUp} label="Taxa de presença" value={formatPercent(totals.attendance)} detail={`${totals.present} presença(s) em ${totals.total} aula(s)`} tone="positive" />
                <MetricCard icon={MdOutlineEventAvailable} label="Taxa de absenteísmo" value={formatPercent(totals.absenteeism)} detail={`${totals.absent} falta(s) em ${totals.total} aula(s)`} tone="negative" />
                <MetricCard icon={MdOutlinePerson} label="Aulas contabilizadas" value={String(new Set(filteredRecords.map((record) => `${record.eventId}:${record.eventDate}`)).size)} detail={`Aulas realizadas ${periodLabel}`} tone="neutral" />
              </div>

              <section className="trend-evolution">
                <div className="trend-evolution__heading"><div><h3>Evolução da frequência</h3><p>Percentual de presenças por semana</p></div><span className="trend-evolution__legend"><i /> Presença</span></div>
                <TrendChart series={weeklySeries} />
              </section>
              <p className="trend-footnote">O cálculo considera ocorrências com registros de presença disponíveis. Turmas e cursos não estão disponíveis como filtros nos dados atuais.</p>
            </>}
          </section>
        </main>
      </div>
    </div>
  );
}
