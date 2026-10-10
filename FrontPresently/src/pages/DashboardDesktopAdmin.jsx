import "../styles/theme.css";
import "../styles/pages/DashboardDesktopAdmin.css";
import { useCallback, useEffect, useState } from "react";
import Header from "../components/DashboardComponents/Header/Header.jsx";
import SidebarAdmin from "../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
import PageHeader from "../components/PageHeader/PageHeader.jsx";
import AttendanceHeatmap from "../components/DashboardComponents/AttendenceHeatmap/AttendanceHeatmap.jsx";
import { adminSidebarSections } from "../data/dashboardDataAdmin";
import { getAttendanceOccurrence, listDailyAttendanceReport } from "../services/attendanceApi.js";
import { listParticipants } from "../services/participantsApi.js";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const PERIOD_DAYS = 35;

function toIsoDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: PERIOD_DAYS }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (PERIOD_DAYS - 1 - index));
    return toIsoDate(date);
  });
}

function emptyData() {
  return { stats: [], highlights: [], heatmap: Array.from({ length: 5 }, () => Array(7).fill(0)) };
}

function buildData(participants, occurrences, details) {
  const detailById = new Map(details.map((detail) => [String(detail.occurrenceId), detail]));
  const records = details.flatMap((detail) => (detail.attendances ?? []).map((attendance) => ({ ...attendance, eventName: detail.eventName ?? "Evento", eventDate: detail.eventDate })));
  const total = records.length;
  const present = records.filter((record) => record.present).length;
  const today = toIsoDate(new Date());
  const todayAbsences = occurrences.filter((item) => item.eventDate === today).reduce((sum, item) => sum + (detailById.get(String(item.occurrenceId))?.attendances ?? []).filter((attendance) => !attendance.present).length, 0);
  const participantTotals = new Map();
  const absencesByEvent = new Map();
  const absencesByDate = new Map();

  records.forEach((record) => {
    const participant = participantTotals.get(String(record.participantId)) ?? { total: 0, absent: 0 };
    participant.total += 1;
    participant.absent += record.present ? 0 : 1;
    participantTotals.set(String(record.participantId), participant);
    if (!record.present) {
      absencesByEvent.set(record.eventName, (absencesByEvent.get(record.eventName) ?? 0) + 1);
      absencesByDate.set(record.eventDate, (absencesByDate.get(record.eventDate) ?? 0) + 1);
    }
  });

  const highlights = Array.from(absencesByEvent, ([name, absences]) => ({ id: name, name, absences }))
    .sort((a, b) => b.absences - a.absences || a.name.localeCompare(b.name, "pt-BR"))
    .slice(0, 4);
  const maximum = Math.max(...absencesByDate.values(), 0);
  const heatmap = Array.from({ length: 5 }, (_, week) => getDates().slice(week * 7, week * 7 + 7).map((date) => {
    const absences = absencesByDate.get(date) ?? 0;
    return maximum ? Math.ceil((absences / maximum) * 4) : 0;
  }));
  const atRisk = Array.from(participantTotals.values()).filter(({ total: count, absent }) => count > 0 && absent / count >= 0.5).length;

  return {
    stats: [
      { id: "alunos", title: "Total de alunos", value: String(participants.length), description: "participantes cadastrados", tone: "neutral" },
      { id: "faltas", title: "Faltas hoje", value: String(todayAbsences), description: "registros das aulas de hoje", tone: "danger" },
      { id: "frequencia", title: "Frequência média", value: total ? `${Math.round((present / total) * 100)}%` : "—", description: "últimos 35 dias", tone: "success" },
      { id: "risco", title: "Alunos em risco", value: String(atRisk), description: "50% ou mais de faltas", tone: "danger" },
    ],
    highlights,
    heatmap,
  };
}

function StatCard({ title, value, description, tone }) {
  return <article className="dashboard-admin__stat-card"><span className="dashboard-admin__stat-title">{title}</span><strong className={`dashboard-admin__stat-value dashboard-admin__value--${tone}`}>{value}</strong><span className="dashboard-admin__stat-description">{description}</span></article>;
}

export default function DashboardDesktopAdmin({ institution = "Fatec Indaiatuba" }) {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [participants, reports] = await Promise.all([listParticipants(), Promise.all(getDates().map((date) => listDailyAttendanceReport(date)))]);
      const occurrences = Array.from(new Map(reports.flat().map((item) => [String(item.occurrenceId), item])).values());
      const details = await Promise.all(occurrences.map((item) => getAttendanceOccurrence(item.occurrenceId)));
      setData(buildData(Array.isArray(participants) ? participants : [], occurrences, details));
    } catch {
      setError("Não foi possível carregar os dados administrativos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(loadTimer);
  }, [load]);

  const dateLabel = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date());
  return <div className="dashboard-admin">
    <SidebarAdmin institution={institution} sections={adminSidebarSections} activeItem="painel-geral-link" />
    <div className="dashboard-admin__content"><Header userName="Administrador" date={dateLabel} notificationCount={9} variant="desktop" />
      <PageHeader breadcrumb="Início › Painel geral" title="Painel geral" mobileOnly />
      <main className="dashboard-admin__main">
        {loading ? <div className="dashboard-admin__state">Carregando dados reais do sistema...</div> : null}
        {error ? <div className="dashboard-admin__state dashboard-admin__state--error" role="alert">{error}<button type="button" onClick={load}>Tentar novamente</button></div> : null}
        {!loading && !error ? <><section className="dashboard-admin__section dashboard-admin__section--hero"><div className="dashboard-admin__stats-grid">{data.stats.map((stat) => <StatCard key={stat.id} {...stat} />)}</div></section>
          <section className="dashboard-admin__section dashboard-admin__section-grid"><article className="dashboard-admin__panel"><h2 className="dashboard-admin__section-title">Eventos com mais faltas</h2><div className="dashboard-admin__list">{data.highlights.length ? data.highlights.map((event) => <div key={event.id} className="dashboard-admin__progress-item"><div className="dashboard-admin__progress-row"><span className="dashboard-admin__progress-title">{event.name}</span><strong className="dashboard-admin__progress-value">{event.absences} falta(s)</strong></div><div className="dashboard-admin__progress-bar"><span className="dashboard-admin__progress-fill" style={{ width: `${Math.min(100, Math.max(5, event.absences * 10))}%` }} /></div></div>) : <p className="dashboard-admin__empty">Ainda não há faltas registradas no período.</p>}</div></article><AttendanceHeatmap title="Faltas nos últimos 35 dias" days={DAYS} matrix={data.heatmap} /></section>
        </> : null}
      </main>
    </div>
  </div>;
}
