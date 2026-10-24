import "../styles/theme.css";
import EmptyState from "../components/EmptyState/EmptyState.jsx";
import Header from "../components/DashboardComponents/Header/Header.jsx";
import Sidebar from "../components/DashboardComponents/Sidebar/Sidebar (1).jsx";
import StatisticCard from "../components/DashboardComponents/StatisticCard/StatisticCard (1).jsx";
import ClassCard from "../components/DashboardComponents/ClassCard/ClassCard (1).jsx";
import AttendanceHeatmap from "../components/DashboardComponents/AttendenceHeatmap/AttendanceHeatmap.jsx";
import { heatmapDays } from "../data/dashboardData";
import { useAttendanceToday } from "../hooks/useAttendanceToday.js";
import { useStudentDashboardData } from "../hooks/useStudentDashboardData.js";
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

function DashboardDesktop() {
  const { currentUser, classes, loadingClasses, classesError, statistics, heatmapMatrix, isResponsible } =
    useStudentDashboardData();
  const { items: attendanceItems } = useAttendanceToday(
    isResponsible ? null : currentUser?.participantId
  );
  const dateLabel = getCurrentDateLabel();
  const userName = currentUser?.fullName?.trim()
    || currentUser?.name?.trim()
    || (currentUser?.username?.includes("@") ? currentUser.username.split("@")[0] : currentUser?.username)
    || (isResponsible ? "Responsável" : "Participante");
  const confirmedAttendanceIds = new Set(
    attendanceItems
      .filter((item) => item.status === "confirmed")
      .map((item) => String(item.eventId))
  );

  return (
    <div className="dashboard dashboard--desktop">
      <Sidebar activeId="dashboard" />

      <div className="dashboard__content">
        <Header
          userName={userName}
          date={dateLabel}
          notificationCount={9}
          variant="desktop"
        />

        <main className="dashboard__main">
          <section className="dashboard__section">
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
                <h2 className="dashboard__section-title">Meus eventos</h2>
              </div>

              {loadingClasses ? (
                <div className="dashboard__state">Carregando seus eventos...</div>
              ) : classesError ? (
                <div className="dashboard__state dashboard__state--error" role="alert">
                  {classesError}
                </div>
              ) : classes.length === 0 ? (
                <EmptyState
                  title="Nenhum evento encontrado"
                  description={isResponsible
                    ? "Você ainda não é responsável por nenhum evento."
                    : "Você ainda não está vinculado a eventos como participante ou responsável."}
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
                      attended={confirmedAttendanceIds.has(String(item.id))}
                    />
                  ))}
                </div>
              )}
            </section>

            {!isResponsible && (
              <section className="dashboard__heatmap-section">
                <AttendanceHeatmap
                  title="Mapa de presença · últimas semanas"
                  days={heatmapDays}
                  matrix={heatmapMatrix}
                />
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardDesktop;
