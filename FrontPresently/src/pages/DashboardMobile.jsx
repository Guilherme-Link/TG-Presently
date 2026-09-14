import "../styles/theme.css";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState/EmptyState.jsx";
import Header from "../components/DashboardComponents/Header/Header.jsx";
import BottomNavigation from "../components/DashboardComponents/BottomNavigation/BottomNavigation (1).jsx";
import StatisticCard from "../components/DashboardComponents/StatisticCard/StatisticCard (1).jsx";
import ClassCard from "../components/DashboardComponents/ClassCard/ClassCard (1).jsx";
import QuickAccessCard from "../components/DashboardComponents/QuickAccessCard/QuickAccessCard (1).jsx";
import { shortcuts } from "../data/dashboardData";
import { useStudentDashboardData } from "../hooks/useStudentDashboardData.js";
import { useAttendanceToday } from "../hooks/useAttendanceToday.js";
import { useCurrentActiveStudentEvent } from "../hooks/useCurrentActiveStudentEvent.js";
import "../styles/pages/Dashboard.css";

function AttendanceButtonIcon() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      height="18"
      width="18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
    </svg>
  );
}

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

function DashboardMobile() {
  const navigate = useNavigate();
  const { currentUser, classes, loadingClasses, classesError, statistics, isResponsible } =
    useStudentDashboardData();
  const { items: attendanceItems } = useAttendanceToday(
    isResponsible ? null : currentUser?.participantId
  );
  const { activeEvent } = useCurrentActiveStudentEvent();
  const confirmedAttendanceIds = new Set(
    attendanceItems.filter((item) => item.status === "confirmed").map((item) => String(item.eventId)),
  );
  const hasConfirmedActiveAttendance = Boolean(
    activeEvent?.id && confirmedAttendanceIds.has(String(activeEvent.id))
  );
  const dateLabel = getCurrentDateLabel();
  const userName = currentUser?.username ?? (isResponsible ? "Responsável" : "Aluno");

  return (
    <div className="dashboard dashboard--mobile">
      <div className="dashboard__content">
        <Header
          userName={userName}
          date={dateLabel}
          notificationCount={9}
          variant="mobile"
          showMobileLogout
        />

        <main className="dashboard__main">
          <section className="dashboard__section">
            <h2 className="dashboard__section-title dashboard__section-title--mobile-only">Dados do semestre</h2>
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
                {!isResponsible && (
                  <button
                    type="button"
                    className="dashboard__attendance-btn"
                    onClick={() => navigate("/presenca")}
                    disabled={hasConfirmedActiveAttendance}
                  >
                    <AttendanceButtonIcon />
                    {hasConfirmedActiveAttendance ? "Presença registrada" : "Marcar presença"}
                  </button>
                )}
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
                  description={isResponsible
                    ? "Você ainda não é responsável por nenhuma aula."
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
          </div>

          {!isResponsible && <section className="dashboard__shortcuts">
            <h2 className="dashboard__section-title dashboard__section-title--mobile-only">
              Atalhos
            </h2>
            <div className="dashboard__shortcuts-grid">
              {shortcuts.map((shortcut) => (
                <QuickAccessCard
                  key={shortcut.id}
                  label={shortcut.label}
                  icon={shortcut.icon}
                  onClick={() => navigate(shortcut.id === "relatorio-faltas" ? "/relatorio" : "/grade")}
                />
              ))}
            </div>
          </section>}
        </main>
      </div>

      <BottomNavigation activeId="dashboard" scanDisabled={hasConfirmedActiveAttendance} />
    </div>
  );
}

export default DashboardMobile;
