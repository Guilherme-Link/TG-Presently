import { apiFetch } from "../utils/api.js";

function formatLocalDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 5);
}

function toAttendanceItem(record) {
  const startedAt = formatTime(record?.startedAt);
  const finishedAt = formatTime(record?.finishedAt);
  const time =
    startedAt && finishedAt
      ? `${startedAt} - ${finishedAt}`
      : startedAt || finishedAt || "—";
  const detail = [record?.ambient, record?.responsible]
    .filter(Boolean)
    .join(" · ");

  return {
    occurrenceId: record?.occurrenceId ?? null,
    eventId: record?.eventId ?? null,
    title: record?.eventName ?? "Evento",
    time,
    detail: detail || "Sem detalhes",
    status: record?.present ? "confirmed" : record?.closed ? "missing" : "pending",
    eventDate: record?.eventDate ?? null,
    checkInTime: record?.checkInTime ?? null,
    closed: Boolean(record?.closed),
    present: Boolean(record?.present),
  };
}

export function listTodayAttendance(participantId, date = formatLocalDate()) {
  if (!participantId) {
    return Promise.resolve([]);
  }

  return apiFetch(
    `/api/v1/attendanceReport/participants/${participantId}?date=${encodeURIComponent(date)}`,
    {
      method: "GET",
    }
  ).then((response) => (Array.isArray(response) ? response.map(toAttendanceItem) : []));
}

export function listAttendanceRange(participantId, startDate, endDate, eventIds = []) {
  if (!participantId || !startDate || !endDate || eventIds.length === 0) {
    return Promise.resolve([]);
  }

  const params = new URLSearchParams({ startDate, endDate, eventIds: eventIds.join(",") });
  return apiFetch(
    `/api/v1/attendanceReport/participants/${participantId}/range?${params.toString()}`,
    { method: "GET" }
  ).then((response) => (Array.isArray(response) ? response.map(toAttendanceItem) : []));
}

export function listDailyAttendanceReport(date = formatLocalDate(), responsibleId) {
  const params = new URLSearchParams({ date });

  if (responsibleId) {
    params.set("responsibleId", String(responsibleId));
  }

  return apiFetch(`/api/v1/attendanceReport/report?${params.toString()}`, {
    method: "GET",
  });
}

export function getAttendanceOccurrence(occurrenceId) {
  return apiFetch(`/api/v1/attendanceReport/${occurrenceId}`, {
    method: "GET",
  });
}
