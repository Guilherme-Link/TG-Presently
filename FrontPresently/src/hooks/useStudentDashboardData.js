import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api.js";
import { listAmbients } from "../services/ambientsApi.js";
import { listParticipatingEvents, listResponsibleEvents } from "../services/eventsApi.js";
import { listParticipants } from "../services/participantsApi.js";
import { toDisplayTime } from "../data/eventsData";

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
        room: ambient?.name ?? event.ambientName ?? "Sala não informada",
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

        [...(Array.isArray(responsibleEvents) ? responsibleEvents : []), ...(Array.isArray(participatingEvents) ? participatingEvents : [])].forEach(
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
      } catch {
        if (!cancelled) {
          setClasses([]);
          setClassesError("Não foi possível carregar suas aulas agora.");
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
  };
}
