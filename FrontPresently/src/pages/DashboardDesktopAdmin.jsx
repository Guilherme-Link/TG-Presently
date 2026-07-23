import "../styles/theme.css";
import "./DashboardDesktopAdmin.css";
import { useState } from "react";
import Header from "../components/DashboardComponents/Header/Header.jsx";
import SidebarAdmin from "../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
import AttendanceHeatmap from "../components/DashboardComponents/AttendenceHeatmap/AttendanceHeatmap.jsx";
import {
  adminAbsenceHighlights,
  adminHeatmapTitle,
  adminSidebarSections,
  adminStats,
  heatmapDays,
  heatmapMatrix,
} from "../data/dashboardDataAdmin";

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

function toneToClass(tone) {
  if (tone === "danger") return "dashboard-admin__value--danger";
  if (tone === "warning") return "dashboard-admin__value--warning";
  if (tone === "success") return "dashboard-admin__value--success";
  return "dashboard-admin__value--neutral";
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="dashboard-admin__section-header">
      <span className="dashboard-admin__eyebrow">{eyebrow}</span>
      <h2 className="dashboard-admin__section-title">{title}</h2>
      {description ? (
        <p className="dashboard-admin__section-description">{description}</p>
      ) : null}
    </div>
  );
}

function StatCard({ title, value, description, tone }) {
  return (
    <article className="dashboard-admin__stat-card">
      <span className="dashboard-admin__stat-title">{title}</span>
      <strong className={`dashboard-admin__stat-value ${toneToClass(tone)}`}>
        {value}
      </strong>
      <span className="dashboard-admin__stat-description">{description}</span>
    </article>
  );
}

function DashboardDesktopAdmin({
  dateLabel = getCurrentDateLabel(),
  institution = "Fatec Indaiatuba",
}) {
  /* eslint-disable no-unused-vars */
  const [activeItem, setActiveItem] = useState("painel-geral-link");
  
  return (
    <div className="dashboard-admin">
      <SidebarAdmin
        institution={institution}
        sections={adminSidebarSections}
        activeItem={activeItem}
      />

      <div className="dashboard-admin__content">
          <Header
            userName="Administrador"
            date={dateLabel}
            notificationCount={9}
            variant="desktop"
          />

        <main className="dashboard-admin__main">
          <section
            id="painel-geral"
            className="dashboard-admin__section dashboard-admin__section--hero"
          >
            <div className="dashboard-admin__stats-grid">
              {adminStats.map((stat) => (
                <StatCard
                  key={stat.id}
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  tone={stat.tone}
                />
              ))}
            </div>
          </section>

          <section
            id="detalhes-falta"
            className="dashboard-admin__section dashboard-admin__section-grid"
          >
            <article id="salas" className="dashboard-admin__panel">
              <SectionHeader
                title="Disciplinas com mais faltas"
              />

              <div className="dashboard-admin__list">
                {adminAbsenceHighlights.map((subject) => (
                  <div
                    key={subject.id}
                    className="dashboard-admin__progress-item"
                  >
                    <div className="dashboard-admin__progress-row">
                      <span className="dashboard-admin__progress-title">
                        {subject.name}
                      </span>
                      <strong className="dashboard-admin__progress-value">
                        {subject.value}%
                      </strong>
                    </div>
                    <div className="dashboard-admin__progress-bar">
                      <span
                        className="dashboard-admin__progress-fill"
                        style={{ width: `${subject.value * 3}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <AttendanceHeatmap
              title={adminHeatmapTitle}
              days={heatmapDays}
              matrix={heatmapMatrix}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

export default DashboardDesktopAdmin;
