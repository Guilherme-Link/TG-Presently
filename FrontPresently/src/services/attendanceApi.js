import { apiFetch } from "../utils/api.js";

export function listTodayAttendance(participantId) {
  return apiFetch(`/api/v1/attendance/today/${participantId}`, {
    method: "GET",
  });
}
