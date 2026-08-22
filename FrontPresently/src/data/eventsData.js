export const EVENT_TYPE_OPTIONS = [
  { label: "Único", value: "SINGLE" },
  { label: "Recorrente", value: "RECURRING" },
];

export const DEFAULT_INTERVAL_DAYS = "7";

export function getEventTypeLabel(eventType) {
  if (eventType === "RECURRING") {
    return "Recorrente";
  }

  return "Único";
}

export function createEmptyEvent() {
  return {
    id: null,
    name: "",
    description: "",
    responsible: "",
    location: "",
    eventType: "",
    intervalDays: DEFAULT_INTERVAL_DAYS,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    participants: [],
  };
}

export function toDisplayDate(value) {
  if (!value) {
    return "";
  }

  if (value.includes("/")) {
    return value;
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export function toApiDate(value) {
  if (!value) {
    return "";
  }

  if (value.includes("-")) {
    return value;
  }

  const [day, month, year] = value.split("/");
  if (!day || !month || !year) {
    return value;
  }

  return `${year}-${month}-${day}`;
}

export function toParticipantRecord(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.username,
    email: user.username,
  };
}

export function buildMockParticipantLists(users = []) {
  const participants = users.map(toParticipantRecord).filter(Boolean);
  const chunks = [participants.slice(0, 3), participants.slice(3, 5), participants.slice(5, 8)];
  const names = [
    "Turma A - Mockup",
    "Turma B - Mockup",
    "Turma C - Mockup",
  ];

  return chunks
    .filter((chunk) => chunk.length > 0)
    .map((members, index) => ({
      id: `mock-list-${index + 1}`,
      name: names[index] ?? `Lista mock ${index + 1}`,
      description: `${members.length} participante(s) no mockup do front.`,
      members,
    }));
}

export function hydrateEventFromApi(event, ambientsById = new Map(), usersById = new Map()) {
  const ambient = ambientsById.get(event.ambientId);
  const responsibleUser = usersById.get(event.responsibleUserId);
  const participants = Array.from(event.participantIds ?? [])
    .map((participantId) => usersById.get(participantId))
    .filter(Boolean)
    .map(toParticipantRecord)
    .filter(Boolean);

  return {
    id: event.id,
    name: event.name ?? "",
    description: event.description ?? "",
    responsible: event.responsible ?? responsibleUser?.username ?? "",
    responsibleUserId: event.responsibleUserId ?? null,
    location: event.ambientId != null ? String(event.ambientId) : "",
    ambientId: event.ambientId ?? null,
    ambientName: ambient?.name ?? "",
    eventType: event.eventType ?? "",
    intervalDays: String(event.intervalDays ?? DEFAULT_INTERVAL_DAYS),
    startDate: toDisplayDate(event.startDate),
    endDate: toDisplayDate(event.endDate),
    startTime: event.startTime ?? "",
    endTime: event.endTime ?? "",
    participantIds: Array.from(event.participantIds ?? []),
    participants,
  };
}

export function buildEventPayload(values) {
  return {
    name: values.name,
    description: values.description,
    startDate: toApiDate(values.startDate),
    endDate: toApiDate(values.endDate),
    startTime: values.startTime,
    endTime: values.endTime,
    eventType: values.eventType,
    intervalDays: Number(values.intervalDays || 0),
    responsible: values.responsible.trim(),
    responsibleUserId: null,
    ambientId: Number(values.location),
    participantIds: values.participants.map((participant) => Number(participant.id)),
  };
}
