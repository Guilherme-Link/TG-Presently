import "../styles/theme.css";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState/EmptyState.jsx";
import Header from "../components/DashboardComponents/Header/Header.jsx";
import BottomNavigation from "../components/DashboardComponents/BottomNavigation/BottomNavigation (1).jsx";
import StatisticCard from "../components/DashboardComponents/StatisticCard/StatisticCard (1).jsx";
import ClassCard from "../components/DashboardComponents/ClassCard/ClassCard (1).jsx";
import QuickAccessCard from "../components/DashboardComponents/QuickAccessCard/QuickAccessCard (1).jsx";
import { statistics, shortcuts } from "../data/dashboardData";
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

function DashboardMobile() {
  const navigate = useNavigate();
  const { currentUser, classes, loadingClasses, classesError } =
    useStudentDashboardData();
  const dateLabel = getCurrentDateLabel();
  const userName = currentUser?.username ?? "Aluno";

  return (
    <div className="dashboard dashboard--mobile">
      <div className="dashboard__content">
        <Header
          userName={userName}
          date={dateLabel}
          notificationCount={9}
          variant="mobile"
        />

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
                <button
                  type="button"
                  className="dashboard__attendance-btn"
                  onClick={() => navigate("/presenca")}
                >
                  <span
                    className="dashboard__attendance-emoji"
                    aria-hidden="true"
                  >
                    🤚
                  </span>
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

export default DashboardMobile;
