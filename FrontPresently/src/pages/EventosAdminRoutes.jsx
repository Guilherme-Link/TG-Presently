import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import EventosListagem from "./EventosListagem/EventosListagem";
import CriarEditarEvento from "./CriarEditarEvento/CriarEditarEvento";
import { deleteEvent, createEvent, listEvents, updateEvent } from "../services/eventsApi.js";
import { listAmbients } from "../services/ambientsApi.js";
import { listUsers } from "../services/usersApi.js";
import { apiFetch } from "../utils/api.js";
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

function EditEventRoute({
  events,
  ambientsById,
  usersById,
  currentUser,
  loadingData,
  onCancel,
  onSave,
}) {
  const params = useParams();
  const eventId = Number(params.id);

  const eventToEdit = useMemo(
    () => events.find((event) => event.id === eventId) ?? null,
    [events, eventId]
  );

  if (!eventToEdit && !loadingData) {
    return <Navigate to="/eventos" replace />;
  }

  return (
    <CriarEditarEvento
      key={eventToEdit?.id ?? "eventos-edit-loading"}
      eventToEdit={eventToEdit}
      ambients={Array.from(ambientsById.values())}
      users={Array.from(usersById.values())}
      currentUser={currentUser}
      loadingData={loadingData}
      onCancel={onCancel}
      onSave={(payload) => onSave(eventId, payload)}
    />
  );
}

function EventosAdminRoutes() {
  const [events, setEvents] = useState([]);
  const [ambients, setAmbients] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(getStoredCurrentUser());
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [mutating, setMutating] = useState(false);
  const navigate = useNavigate();

  const ambientsById = useMemo(
    () => new Map(ambients.map((ambient) => [ambient.id, ambient])),
    [ambients]
  );

  const usersById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users]
  );

  const hydratedEvents = useMemo(
    () => events.map((event) => hydrateEventFromApi(event, ambientsById, usersById)),
    [ambientsById, events, usersById]
  );

  const reloadData = useCallback(async () => {
    setLoadingData(true);
    setDataError(null);

    try {
      const [eventsResponse, ambientsResponse, usersResponse, meResponse] = await Promise.all([
        listEvents(),
        listAmbients(),
        listUsers(),
        apiFetch("/security/v1/me", { method: "GET" }),
      ]);

      setEvents(Array.isArray(eventsResponse) ? eventsResponse : []);
      setAmbients(Array.isArray(ambientsResponse) ? ambientsResponse : []);
      setUsers(Array.isArray(usersResponse) ? usersResponse : []);
      setCurrentUser(meResponse ?? getStoredCurrentUser());
    } catch {
      setDataError("Nao foi possivel carregar os eventos cadastrados.");
      setEvents([]);
      setAmbients([]);
      setUsers([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reloadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [reloadData]);

  async function handleCreateEvent() {
    navigate("/eventos/novo");
  }

  async function handleEditEvent(event) {
    navigate(`/eventos/${event.id}/editar`);
  }

  async function handleDeleteEvent(event) {
    setMutating(true);

    try {
      await deleteEvent(event.id);
      await reloadData();
    } finally {
      setMutating(false);
    }
  }

  async function handleSaveEvent(eventId, payload) {
    setMutating(true);

    try {
      if (eventId) {
        await updateEvent(eventId, payload);
      } else {
        await createEvent(payload);
      }

      await reloadData();
      navigate("/eventos");
    } finally {
      setMutating(false);
    }
  }

  function handleCancel() {
    navigate("/eventos");
  }

  return (
    <Routes>
      <Route
        index
        element={
          <EventosListagem
            events={hydratedEvents}
            loading={loadingData}
            error={dataError}
            onReload={reloadData}
            onCreateEvent={handleCreateEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            mutating={mutating}
          />
        }
      />

      <Route
        path="novo"
        element={
          <CriarEditarEvento
            key="eventos-novo"
            ambients={ambients}
            users={users}
            currentUser={currentUser}
            loadingData={loadingData}
            dataError={dataError}
            onCancel={handleCancel}
            onSave={(payload) => handleSaveEvent(null, payload)}
          />
        }
      />

      <Route
        path=":id/editar"
        element={
          <EditEventRoute
            events={hydratedEvents}
            ambientsById={ambientsById}
            usersById={usersById}
            currentUser={currentUser}
            loadingData={loadingData}
            onCancel={handleCancel}
            onSave={handleSaveEvent}
          />
        }
      />

      <Route path="*" element={<Navigate to="/eventos" replace />} />
    </Routes>
  );
}

export default EventosAdminRoutes;
