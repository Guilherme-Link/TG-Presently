import { apiFetch } from "../utils/api.js";

export function listTerminals() {
  return apiFetch("/api/v1/terminals");
}

export function approveTerminal(id) {
  return apiFetch(`/api/v1/terminals/${id}/approve`, { method: "PATCH" });
}

export function setTerminalAmbient(id, ambientId) {
  const params = new URLSearchParams({ ambientId: String(ambientId) });
  return apiFetch(`/api/v1/terminals/${id}/updateAmbient?${params}`, { method: "PUT" });
}

export function deleteTerminal(id) {
  return apiFetch(`/api/v1/terminals/${id}`, { method: "DELETE" });
}
