import { apiFetch } from "../utils/api.js";

export function listParticipants() {
  return apiFetch("/api/v1/participants", {
    method: "GET",
  });
}
