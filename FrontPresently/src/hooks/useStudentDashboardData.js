import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api.js";
import { listAmbients } from "../services/ambientsApi.js";
import { listParticipatingEvents, listResponsibleEvents } from "../services/eventsApi.js";
import { listParticipants } from "../services/participantsApi.js";
import { listTodayAttendance } from "../services/attendanceApi.js";
import { toDisplayTime } from "../data/eventsData";

function formatLocalDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseLocalDate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
}

function isScheduledOn(event, date) {
  const start = parseLocalDate(event?.startDate);
  const end = parseLocalDate(event?.endDate);
  if (!start || !end || date < start || date > end) return false;
  if (event.eventType !== "RECURRING") return true;
  const interval = Number(event.intervalDays);
  if (!Number.isFinite(interval) || interval <= 0) return false;
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((dateUtc - startUtc) / 86400000) % interval === 0;
}

function eventHasFinished(event, date, today) {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (date < todayStart) return true;
  if (date > todayStart) return false;
  const end = String(event?.endTime ?? "").slice(0, 5);
  if (!/^\d{2}:\d{2}$/.test(end)) return false;
  const [hours, minutes] = end.split(":").map(Number);
  return today.getHours() * 60 + today.getMinutes() > hours * 60 + minutes;
}

function buildScheduledOccurrences(events, today = new Date()) {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const occurrences = [];

  events.forEach((event) => {
    const start = parseLocalDate(event?.startDate);
    const end = parseLocalDate(event?.endDate);
    if (!start || !end) return;
    const last = end < todayStart ? end : todayStart;
    const interval = event.eventType === "RECURRING" ? Math.max(Number(event.intervalDays) || 1, 1) : 1;
    for (let date = new Date(start); date <= last; date.setDate(date.getDate() + interval)) {
      if (isScheduledOn(event, date)) occurrences.push({ event, date: formatLocalDate(date), dateObject: new Date(date) });
    }
  });

  return occurrences;
}

async function buildRealStatistics(participatingEvents) {
  const today = new Date();
  const occurrences = buildScheduledOccurrences(participatingEvents, today).filter(({ event, dateObject }) => eventHasFinished(event, dateObject, today));
  const dates = Array.from(new Set(occurrences.map(({ date }) => date)));
  const responses = await Promise.all(dates.map((date) => listTodayAttendanceForSummary(date, participatingEvents)));
  const records = responses.flat();
  const recordsByOccurrence = new Map(records.map((record) => [`${record.eventId}|${record.eventDate}`, record]));
  let absences = 0;
  let attended = 0;

  occurrences.forEach(({ event, date }) => {
    const record = recordsByOccurrence.get(`${event.id}|${date}`);
    if (record?.present) attended += 1;
    else absences += 1;
  });

  const total = absences + attended;
  const todayDate = formatLocalDate(today);
  const classesToday = participatingEvents.filter((event) => isScheduledOn(event, today)).length;
  const heatmapMatrix = Array.from({ length: 5 }, () => Array(7).fill(0));
  occurrences.forEach(({ event, date, dateObject }) => {
    const daysAgo = Math.floor((today - dateObject) / 86400000);
    const weeksAgo = Math.floor(daysAgo / 7);
    if (weeksAgo < 0 || weeksAgo >= 5) return;
    const record = recordsByOccurrence.get(`${event.id}|${date}`);
    const row = 4 - weeksAgo;
    const column = dateObject.getDay();
    heatmapMatrix[row][column] = record?.present ? 1 : 3;
  });

  return {
    statistics: [
    { id: "faltas-totais", title: "Faltas totais", value: absences, description: `${new Set(participatingEvents.map((event) => event.id)).size} disciplinas`, valueColor: "var(--color-primary)" },
    { id: "frequencia-media", title: "Frequência média", value: `${total ? Math.round((attended / total) * 100) : 0}%`, description: "eventos encerrados", valueColor: "var(--color-success)" },
    { id: "aulas-hoje", title: "Eventos hoje", value: classesToday, description: todayDate, valueColor: "var(--color-text)" },
    { id: "presencas-confirmadas", title: "Presenças confirmadas", value: attended, description: "eventos encerrados", valueColor: "var(--color-primary)" },
    ],
    heatmapMatrix,
  };
}

async function listTodayAttendanceForSummary(date, events) {
  const participantId = events?.[0]?.__participantId;
  if (!participantId) return [];
  return listTodayAttendance(participantId, date);
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

      const time =
        event.startTime && event.endTime
          ? `${toDisplayTime(event.startTime)} - ${toDisplayTime(event.endTime)}`
          : toDisplayTime(event.startTime) || toDisplayTime(event.endTime) || "—";

      return {
        id: event.id,
        time,
        subject: event.name ?? "Evento",
        room: ambient?.name ?? event.ambientName ?? "Ambiente não informado",
        professor: responsible?.name ?? currentUser?.username ?? "Responsável não informado",
        startDate: event.startDate ?? "",
        startTime: event.startTime ?? "",
      };
    })
    .sort((left, right) => {
      const leftKey = `${left.startDate ?? ""} ${left.startTime ?? ""}`.trim();
      const rightKey = `${right.startDate ?? ""} ${right.startTime ?? ""}`.trim();
      return leftKey.localeCompare(rightKey);
    });
}

export function useStudentDashboardData() {
  const [currentUser, setCurrentUser] = useState(() => getStoredCurrentUser());
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState("");
  const [statistics, setStatistics] = useState([]);
  const [heatmapMatrix, setHeatmapMatrix] = useState(() => Array.from({ length: 5 }, () => Array(7).fill(0)));
  const [isResponsible, setIsResponsible] = useState(() =>
    getStoredCurrentUser()?.roles?.includes("ROLE_RESPONSIBLE") ?? false
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingClasses(true);
      setClassesError("");

      try {
        const me = await apiFetch("/security/v1/me", { method: "GET" });

        if (cancelled) {
          return;
        }

        setCurrentUser(me ?? getStoredCurrentUser());
        const currentUser = me ?? getStoredCurrentUser();
        const userIsResponsible = currentUser?.roles?.includes("ROLE_RESPONSIBLE") ?? false;
        setIsResponsible(userIsResponsible);

        const participantId = me?.participantId;
        if (!participantId) {
          setClasses([]);
          setClassesError("Seu usuário não está vinculado a um participante.");
          return;
        }

        const [participantsResponse, ambientsResponse, responsibleEvents, participatingEvents] = await Promise.all([
          listParticipants(),
          listAmbients(),
          listResponsibleEvents(participantId),
          listParticipatingEvents(participantId),
        ]);

        if (cancelled) {
          return;
        }

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
        const dashboardEvents = userIsResponsible
          ? responsibleEvents
          : [...(Array.isArray(responsibleEvents) ? responsibleEvents : []), ...(Array.isArray(participatingEvents) ? participatingEvents : [])];

        (Array.isArray(dashboardEvents) ? dashboardEvents : []).forEach(
          (event) => {
            if (!event?.id || mergedEvents.has(event.id)) {
              return;
            }

            mergedEvents.set(event.id, event);
          }
        );

        setClasses(
          buildClassItems(
            Array.from(mergedEvents.values()),
            participantsById,
            ambientsById,
            me ?? getStoredCurrentUser()
          )
        );
        if (userIsResponsible) {
          const responsibleClasses = Array.isArray(responsibleEvents) ? responsibleEvents : [];
          const classesToday = responsibleClasses.filter((event) => isScheduledOn(event, new Date())).length;
          setStatistics([
            { id: "responsible-classes", title: "Eventos como responsável", value: responsibleClasses.length, description: "eventos vinculados", valueColor: "var(--color-primary)" },
            { id: "classes-today", title: "Eventos hoje", value: classesToday, description: formatLocalDate(new Date()), valueColor: "var(--color-text)" },
          ]);
          setHeatmapMatrix(Array.from({ length: 5 }, () => Array(7).fill(0)));
        } else {
          const eventsForSummary = (Array.isArray(participatingEvents) ? participatingEvents : []).map((event) => ({ ...event, __participantId: participantId }));
          const summary = await buildRealStatistics(eventsForSummary);
          setStatistics(summary.statistics);
          setHeatmapMatrix(summary.heatmapMatrix);
        }
      } catch {
        if (!cancelled) {
          setClasses([]);
          setClassesError("Não foi possível carregar seus eventos agora.");
          setStatistics([]);
          setHeatmapMatrix(Array.from({ length: 5 }, () => Array(7).fill(0)));
        }
      } finally {
        if (!cancelled) {
          setLoadingClasses(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    currentUser,
    classes,
    loadingClasses,
    classesError,
    statistics,
    heatmapMatrix,
    isResponsible,
  };
}
