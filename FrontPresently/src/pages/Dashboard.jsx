import { useEffect, useState } from "react";
import { MdPanTool } from "react-icons/md";
import "../styles/theme.css";
import Header from "../components/DashboardComponents/Header/Header.jsx";
import Sidebar from "../components/DashboardComponents/Sidebar/Sidebar (1).jsx";
import BottomNavigation from "../components/DashboardComponents/BottomNavigation/BottomNavigation (1).jsx";
import StatisticCard from "../components/DashboardComponents/StatisticCard/StatisticCard (1).jsx";
import ClassCard from "../components/DashboardComponents/ClassCard/ClassCard (1).jsx";
import QuickAccessCard from "../components/DashboardComponents/QuickAccessCard/QuickAccessCard (1).jsx";
import AttendanceHeatmap from "../components/DashboardComponents/AttendenceHeatmap/AttendanceHeatmap.jsx";
import EmptyState from "../components/EmptyState/EmptyState.jsx";
import { apiFetch } from "../utils/api.js";
import { listAmbients } from "../services/ambientsApi.js";
import {
  listParticipatingEvents,
  listResponsibleEvents,
} from "../services/eventsApi.js";
import { listParticipants } from "../services/participantsApi.js";
import { toDisplayDate, toDisplayTime } from "../data/eventsData";
import {
  statistics,
  shortcuts,
  heatmapDays,
  heatmapMatrix,
  heatmapTitle,
} from "../data/dashboardData";
import "../styles/pages/Dashboard.css";

function getCurrentDateLabel() {
  const today = new Date();
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(today);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function getStoredCurrentUser() {
  try {
    const raw = localStorage.getItem("presently_auth");
    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function buildClassItems(events = [], participantsById = new Map(), ambientsById = new Map(), currentUser = null) {
  return events
    .map((event) => {
      const ambient = ambientsById.get(event.ambientId);
      const responsible = participantsById.get(String(event.responsibleId ?? ""));
      const time = event.startTime && event.endTime
        ? `${toDisplayTime(event.startTime)} - ${toDisplayTime(event.endTime)}`
        : toDisplayTime(event.startTime) || toDisplayTime(event.endTime) || "—";

      return {
        id: event.id,
        time,
        subject: event.name ?? "Evento",
        room: ambient?.name ?? event.ambientName ?? "Sala não informada",
        professor: responsible?.name ?? currentUser?.username ?? "Responsável não informado",
        startDate: event.startDate ? toDisplayDate(event.startDate) : "",
      };
    })
    .sort((left, right) => {
      const leftKey = `${left.startDate ?? ""} ${left.time ?? ""}`.trim();
      const rightKey = `${right.startDate ?? ""} ${right.time ?? ""}`.trim();
      return leftKey.localeCompare(rightKey);
    });
}

function Dashboard() {
  const [currentUser, setCurrentUser] = useState(() => getStoredCurrentUser());
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState("");

  const dateLabel = getCurrentDateLabel();
  const userName = currentUser?.username ?? "Aluno";

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardClasses() {
      const participantId = currentUser?.participantId;

      if (!participantId) {
        if (!cancelled) {
          setClasses([]);
          setClassesError("Seu usuário não está vinculado a um participante.");
          setLoadingClasses(false);
        }
        return;
      }

      setLoadingClasses(true);
      setClassesError("");

      try {
        const [participantsResponse, ambientsResponse, responsibleEvents, participatingEvents, meResponse] =
          await Promise.all([
            listParticipants(),
            listAmbients(),
            listResponsibleEvents(participantId),
            listParticipatingEvents(participantId),
            apiFetch("/security/v1/me", { method: "GET" }),
          ]);

        const participantsById = new Map(
          (Array.isArray(participantsResponse) ? participantsResponse : []).map((participant) => [
            String(participant.id),
            participant,
          ])
        );
        const ambientsById = new Map(
          (Array.isArray(ambientsResponse) ? ambientsResponse : []).map((ambient) => [
            ambient.id,
            ambient,
          ])
        );

        const mergedEvents = new Map();
        [...(Array.isArray(responsibleEvents) ? responsibleEvents : []), ...(Array.isArray(participatingEvents) ? participatingEvents : [])].forEach(
          (event) => {
            if (!event?.id || mergedEvents.has(event.id)) {
              return;
            }

            mergedEvents.set(event.id, event);
          }
        );

        if (!cancelled) {
          setCurrentUser(meResponse ?? getStoredCurrentUser());
          setClasses(
            buildClassItems(
              Array.from(mergedEvents.values()),
              participantsById,
              ambientsById,
              meResponse ?? currentUser
            )
          );
        }
      } catch {
        if (!cancelled) {
          setClasses([]);
          setClassesError("Não foi possível carregar suas aulas agora.");
        }
      } finally {
        if (!cancelled) {
          setLoadingClasses(false);
        }
      }
    }

    void loadDashboardClasses();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.participantId]);

  return (
    <div className="dashboard">
      <Sidebar activeId="dashboard" />

      <div className="dashboard__content">
        <Header userName={userName} date={dateLabel} notificationCount={9} />

        <main className="dashboard__main">
          <section className="dashboard__section">
            <h2 className="dashboard__section-title dashboard__section-title--mobile-only">
              Dados do semestre
            </h2>
            <div className="dashboard__stats-grid">
              {statistics.map((stat) => (
                <StatisticCard
                  key={stat.id}
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  valueColor={stat.valueColor}
                />
              ))}
            </div>
          </section>

          <div className="dashboard__body-grid">
            <section className="dashboard__classes">
              <div className="dashboard__classes-header">
                <h2 className="dashboard__section-title">Minhas aulas</h2>
                <button type="button" className="dashboard__attendance-btn">
                  <MdPanTool size={18} aria-hidden="true" />
                  Marcar presença
                </button>
              </div>

              {loadingClasses ? (
                <div className="dashboard__state">Carregando suas aulas...</div>
              ) : classesError ? (
                <div className="dashboard__state dashboard__state--error" role="alert">
                  {classesError}
                </div>
              ) : classes.length === 0 ? (
                <EmptyState
                  title="Nenhuma aula encontrada"
                  description="Você ainda não está vinculado a eventos como participante ou responsável."
                />
              ) : (
                <div className="dashboard__classes-list">
                  {classes.map((item) => (
                    <ClassCard
                      key={item.id}
                      time={item.time}
                      subject={item.subject}
                      room={item.room}
                      professor={item.professor}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard__heatmap-section">
              <AttendanceHeatmap
                title={heatmapTitle}
                days={heatmapDays}
                matrix={heatmapMatrix}
              />
            </section>
          </div>

          <section className="dashboard__shortcuts">
            <h2 className="dashboard__section-title dashboard__section-title--mobile-only">
              Atalhos
            </h2>
            <div className="dashboard__shortcuts-grid">
              {shortcuts.map((shortcut) => (
                <QuickAccessCard
                  key={shortcut.id}
                  label={shortcut.label}
                  icon={shortcut.icon}
                />
              ))}
            </div>
          </section>
        </main>
      </div>

      <BottomNavigation activeId="dashboard" />
    </div>
  );
}

export default Dashboard;
