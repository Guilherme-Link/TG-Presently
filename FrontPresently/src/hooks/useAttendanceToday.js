import { useCallback, useEffect, useRef, useState } from "react";
import { listTodayAttendance } from "../services/attendanceApi.js";
import { listAmbients } from "../services/ambientsApi.js";
import { listParticipatingEvents } from "../services/eventsApi.js";
import { listParticipants } from "../services/participantsApi.js";

function formatLocalDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
}

function parseLocalDate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
}

function isScheduledToday(event, today = new Date()) {
  const startDate = parseLocalDate(event?.startDate);
  const endDate = parseLocalDate(event?.endDate);
  if (!startDate || !endDate) return false;

  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (currentDate < startDate || currentDate > endDate) return false;

  if (event.eventType !== "RECURRING") return true;

  const intervalDays = Number(event.intervalDays);
  const startUtc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const currentUtc = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const differenceInDays = Math.floor((currentUtc - startUtc) / 86400000);

  return Number.isFinite(intervalDays) && intervalDays > 0 && differenceInDays % intervalDays === 0;
}

function formatTime(value) {
  return value ? String(value).slice(0, 5) : "";
}

function hasEventFinished(item, referenceDate = new Date()) {
  if (!item?.eventDate || item.eventDate !== formatLocalDate(referenceDate)) {
    return false;
  }

  const endTime = String(item.time ?? "").split(" - ")[1];
  if (!/^\d{2}:\d{2}$/.test(endTime ?? "")) {
    return false;
  }

  const [hour, minute] = endTime.split(":").map(Number);
  const eventEndInMinutes = hour * 60 + minute;
  const currentTimeInMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();

  return currentTimeInMinutes > eventEndInMinutes;
}

function toScheduledAttendanceItem(event, participantsById, ambientsById, date) {
  const startTime = formatTime(event.startTime);
  const endTime = formatTime(event.endTime);
  const responsible = participantsById.get(String(event.responsibleId ?? ""));
  const ambient = ambientsById.get(String(event.ambientId ?? ""));
  const detail = [ambient?.name, responsible?.name].filter(Boolean).join(" · ");

  return {
    occurrenceId: null,
    eventId: event.id,
    title: event.name ?? "Evento",
    time: startTime && endTime ? `${startTime} - ${endTime}` : startTime || endTime || "—",
    detail: detail || "Sem detalhes",
    status: "pending",
    eventDate: date,
    checkInTime: null,
    closed: false,
    present: false,
  };
}

function mergeTodayEvents(attendanceRecords, events, participants, ambients, date) {
  const participantsById = new Map((Array.isArray(participants) ? participants : []).map((participant) => [String(participant.id), participant]));
  const ambientsById = new Map((Array.isArray(ambients) ? ambients : []).map((ambient) => [String(ambient.id), ambient]));
  const recordsByEventId = new Map((Array.isArray(attendanceRecords) ? attendanceRecords : []).map((record) => [String(record.eventId), record]));

  (Array.isArray(events) ? events : [])
    .filter((event) => event?.id && isScheduledToday(event))
    .forEach((event) => {
      const key = String(event.id);
      if (!recordsByEventId.has(key)) {
        recordsByEventId.set(key, toScheduledAttendanceItem(event, participantsById, ambientsById, date));
      }
    });

  return Array.from(recordsByEventId.values())
    .map((item) => ({
      ...item,
      status: !item.present && hasEventFinished(item) ? "missing" : item.status,
    }))
    .sort((left, right) => String(left.time ?? "").localeCompare(String(right.time ?? "")));
}

export function useAttendanceToday(participantId, { refreshMs = 6000 } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(participantId));
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);
  const signatureRef = useRef("");

  const load = useCallback(async (options = {}) => {
    const { silent = false } = options;

    if (!participantId) {
      setItems([]);
      setLoading(false);
      setError("");
      hasLoadedRef.current = false;
      signatureRef.current = "";
      return;
    }

    if (!silent && !hasLoadedRef.current) {
      setLoading(true);
      setError("");
    }

    try {
      const today = formatLocalDate();
      const [attendanceRecords, participatingEvents, participants, ambients] = await Promise.all([
        listTodayAttendance(participantId, today),
        listParticipatingEvents(participantId),
        listParticipants(),
        listAmbients(),
      ]);
      const nextItems = mergeTodayEvents(
        attendanceRecords,
        participatingEvents,
        participants,
        ambients,
        today,
      );
      const nextSignature = JSON.stringify(nextItems);

      if (nextSignature !== signatureRef.current) {
        setItems(nextItems);
        signatureRef.current = nextSignature;
      }

      setError("");
      hasLoadedRef.current = true;
    } catch {
      if (!silent || !hasLoadedRef.current) {
        setItems([]);
        setError("Não foi possível carregar o histórico de presença de hoje.");
      }
    } finally {
      if (!silent || !hasLoadedRef.current) {
        setLoading(false);
      }
    }
  }, [participantId]);

  useEffect(() => {
    if (!participantId) {
      return undefined;
    }

    const initialLoad = window.setTimeout(() => {
      void load({ silent: false });
    }, 0);

    const intervalId = window.setInterval(() => {
      void load({ silent: true });
    }, refreshMs);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(intervalId);
    };
  }, [load, participantId, refreshMs]);

  return {
    items,
    loading,
    error,
    refresh: load,
  };
}
