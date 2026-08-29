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
    responsibleId: null,
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

export function toDisplayTime(value) {
  if (!value) {
    return "";
  }

  const raw = String(value).trim();

  if (/^\d{2}:\d{2}$/.test(raw)) {
    return raw;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) {
    return raw.slice(0, 5);
  }

  return raw;
}

export function toParticipantRecord(user) {
  if (!user) {
    return null;
  }

  const id = user.id ?? null;
  const name = user.name ?? user.username ?? "";

  if (id === null || id === undefined) {
    return null;
  }

  return {
    id: String(id),
    name,
    email:
      user.email ??
      user.username ??
      (user.userId !== null && user.userId !== undefined ? `Usuário #${user.userId}` : name),
    userId: user.userId ?? user.id ?? null,
  };
}

export function buildMockParticipantLists(participants = []) {
  const normalizedParticipants = participants.map(toParticipantRecord).filter(Boolean);
  const chunks = [
    normalizedParticipants.slice(0, 3),
    normalizedParticipants.slice(3, 5),
    normalizedParticipants.slice(5, 8),
  ];
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

export function hydrateEventFromApi(
  event,
  participantsById = new Map(),
  ambientsById = new Map()
) {
  const ambient = ambientsById.get(event.ambientId);
  const responsibleId = event.responsibleId ?? event.responsibleUserId ?? null;
  const responsibleParticipant =
    responsibleId !== null && responsibleId !== undefined
      ? participantsById.get(String(responsibleId))
      : null;
  const participants = Array.from(event.participantIds ?? [])
    .map((participantId) => participantsById.get(String(participantId)))
    .filter(Boolean)
    .map(toParticipantRecord)
    .filter(Boolean);

  return {
    id: event.id,
    name: event.name ?? "",
    description: event.description ?? "",
    responsible: event.responsible ?? responsibleParticipant?.name ?? "",
    responsibleUserId: event.responsibleUserId ?? null,
    responsibleId: responsibleId !== null && responsibleId !== undefined ? String(responsibleId) : null,
    location: event.ambientId != null ? String(event.ambientId) : "",
    ambientId: event.ambientId ?? null,
    ambientName: ambient?.name ?? "",
    eventType: event.eventType ?? "",
    intervalDays: String(event.intervalDays ?? DEFAULT_INTERVAL_DAYS),
    startDate: toDisplayDate(event.startDate),
    endDate: toDisplayDate(event.endDate),
    startTime: toDisplayTime(event.startTime),
    endTime: toDisplayTime(event.endTime),
    participantIds: Array.from(event.participantIds ?? []).map(String),
    participants,
  };
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
}

export function buildEventPayload(values, fallbackResponsibleId = null) {
  const responsibleId = toNullableNumber(values.responsibleId ?? fallbackResponsibleId);
  const filteredParticipantIds = values.participants
    .filter((participant) => String(participant.id) !== String(responsibleId ?? ""))
    .map((participant) => Number(participant.id));

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
    responsibleId,
    ambientId: Number(values.location),
    participantIds: filteredParticipantIds,
  };
}
