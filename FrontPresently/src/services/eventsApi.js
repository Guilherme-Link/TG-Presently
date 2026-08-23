import { apiFetch } from "../utils/api.js";

export function listEvents() {
  return apiFetch("/api/v1/events", {
    method: "GET",
  });
}

export function createEvent(payload) {
  return apiFetch("/api/v1/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateEvent(id, payload) {
  return apiFetch(`/api/v1/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteEvent(id) {
  return apiFetch(`/api/v1/events/${id}`, {
    method: "DELETE",
  });
}
