import { apiFetch } from "../utils/api.js";

export function listAmbients() {
  return apiFetch("/api/v1/ambients", {
    method: "GET",
  });
}

export function createAmbient(payload) {
  return apiFetch("/api/v1/ambients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAmbient(id, payload) {
  return apiFetch(`/api/v1/ambients/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAmbient(id) {
  return apiFetch(`/api/v1/ambients/${id}`, {
    method: "DELETE",
  });
}
