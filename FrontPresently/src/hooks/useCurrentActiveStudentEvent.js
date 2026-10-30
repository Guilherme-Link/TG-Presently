import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../utils/api.js";
import { getCurrentActiveParticipantEvent } from "../services/eventsApi.js";

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
  const [year, month, day] = String(event.eventDate ?? "").split("-").map(Number);
  const eventDay = year && month && day
    ? new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(new Date(year, month - 1, day))
    : "";

  return {
    id: event.id,
    time,
    day: eventDay,
    subject: event.name,
    room: event.ambientName,
    professor: event.responsibleName,
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

        const activeEventData = await getCurrentActiveParticipantEvent(participantId);

        if (cancelled) {
          return;
        }

        setActiveEvent(buildLessonCard(activeEventData));

        if (!activeEventData) {
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
