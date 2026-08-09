import { apiFetch } from "../utils/api.js";

export function listUsers() {
  return apiFetch("/security/v1/users", {
    method: "GET",
  });
}

export function registerUser(payload) {
  return apiFetch("/security/v1/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(id, payload) {
  return apiFetch(`/security/v1/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id) {
  return apiFetch(`/security/v1/${id}`, {
    method: "DELETE",
  });
}
