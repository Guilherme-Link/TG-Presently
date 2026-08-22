import "../styles/theme.css";
import Header from "../components/DashboardComponents/Header/Header.jsx";
import Sidebar from "../components/DashboardComponents/Sidebar/Sidebar (1).jsx";
import StatisticCard from "../components/DashboardComponents/StatisticCard/StatisticCard (1).jsx";
import ClassCard from "../components/DashboardComponents/ClassCard/ClassCard (1).jsx";
import AttendanceHeatmap from "../components/DashboardComponents/AttendenceHeatmap/AttendanceHeatmap.jsx";
import {
  statistics,
  classes,
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

function DashboardDesktop() {
  const dateLabel = getCurrentDateLabel();

  return (
    <div className="dashboard dashboard--desktop">
      <Sidebar activeId="dashboard" />

      <div className="dashboard__content">
        <Header
          userName="Aluno"
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
                <h2 className="dashboard__section-title">Minhas aulas</h2>
              </div>

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
            </section>

            <section className="dashboard__heatmap-section">
              <AttendanceHeatmap
                title={heatmapTitle}
                days={heatmapDays}
                matrix={heatmapMatrix}
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardDesktop;
