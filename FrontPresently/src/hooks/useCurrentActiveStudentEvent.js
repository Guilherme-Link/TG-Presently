import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../utils/api.js";
import { listAmbients } from "../services/ambientsApi.js";
import { listParticipatingEvents, listResponsibleEvents } from "../services/eventsApi.js";
import { listParticipants } from "../services/participantsApi.js";
import { hydrateEventFromApi } from "../data/eventsData";

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

function parseLocalDate(value) {
  if (!value) {
    return null;
  }

  const raw = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  return null;
}

function parseLocalTimeToMinutes(value) {
  if (!value) {
    return null;
  }

  const raw = String(value).trim();
  const normalized = raw.length === 8 ? raw.slice(0, 5) : raw;

  if (!/^\d{2}:\d{2}$/.test(normalized)) {
    return null;
  }

  const [hour, minute] = normalized.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

function isEventActiveAt(event, referenceDate = new Date()) {
  const startDate = parseLocalDate(event.startDate);
  const endDate = parseLocalDate(event.endDate);
  const startMinutes = parseLocalTimeToMinutes(event.startTime);
  const endMinutes = parseLocalTimeToMinutes(event.endTime);

  if (!startDate || !endDate || startMinutes === null || endMinutes === null) {
    return false;
  }

  const currentDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  if (currentDate < startDate || currentDate > endDate) {
    return false;
  }

  const currentMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();
  if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
    return false;
  }

  if (event.eventType === "RECURRING") {
    const intervalDays = Number(event.intervalDays || 0);
    if (!Number.isFinite(intervalDays) || intervalDays <= 0) {
      return false;
    }

    const startUtc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const currentUtc = Date.UTC(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const diffDays = Math.floor((currentUtc - startUtc) / 86400000);

    if (diffDays < 0 || diffDays % intervalDays !== 0) {
      return false;
    }
  }

  return true;
}

function buildLessonCard(event) {
  if (!event) {
    return null;
  }

  const startTime = String(event.startTime ?? "").slice(0, 5);
  const endTime = String(event.endTime ?? "").slice(0, 5);
  const time =
    startTime && endTime
      ? `${startTime} - ${endTime}`
      : startTime || endTime || "—";

  return {
    id: event.id,
    time,
    subject: event.name ?? "Evento",
    room: event.ambientName || event.location || "Ambiente não informado",
    professor: event.responsible || "Responsável não informado",
  };
}

export function useCurrentActiveStudentEvent() {
  const [currentUser, setCurrentUser] = useState(() => getStoredCurrentUser());
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const me = await apiFetch("/security/v1/me", { method: "GET" });

        if (cancelled) {
          return;
        }

        setCurrentUser(me ?? getStoredCurrentUser());

        const participantId = me?.participantId;
        if (!participantId) {
          setActiveEvent(null);
          setError("Seu usuário não está vinculado a um participante.");
          return;
        }

        const [participantsResponse, ambientsResponse, responsibleEvents, participatingEvents] =
          await Promise.all([
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
        [
          ...(Array.isArray(responsibleEvents) ? responsibleEvents : []),
          ...(Array.isArray(participatingEvents) ? participatingEvents : []),
        ].forEach((event) => {
          if (!event?.id || mergedEvents.has(event.id)) {
            return;
          }

          if (!isEventActiveAt(event, new Date())) {
            return;
          }

          mergedEvents.set(event.id, event);
        });

        const activeHydratedEvent = Array.from(mergedEvents.values())
          .sort((left, right) => {
            const leftKey = `${left.startDate ?? ""} ${left.startTime ?? ""}`.trim();
            const rightKey = `${right.startDate ?? ""} ${right.startTime ?? ""}`.trim();
            return leftKey.localeCompare(rightKey);
          })
          .map((event) => hydrateEventFromApi(event, participantsById, ambientsById))[0] ?? null;

        setActiveEvent(buildLessonCard(activeHydratedEvent));

        if (!activeHydratedEvent) {
          setError("Não existe nenhum evento ativo agora para este participante.");
        }
      } catch {
        if (!cancelled) {
          setActiveEvent(null);
          setError("Não foi possível carregar o evento atual.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(
    () => ({
      currentUser,
      activeEvent,
      loading,
      error,
    }),
    [activeEvent, currentUser, error, loading]
  );
}
