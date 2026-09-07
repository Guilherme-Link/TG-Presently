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
