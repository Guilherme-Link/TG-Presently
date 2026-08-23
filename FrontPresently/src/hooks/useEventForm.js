import { useState } from "react";
import { createEmptyEvent } from "../data/eventsData";

function parseDisplayDate(value) {
  if (!value) {
    return null;
  }

  const parts = String(value).split("/");
  if (parts.length !== 3) {
    return null;
  }

  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseDisplayTime(value) {
  if (!value) {
    return null;
  }

  const parts = String(value).split(":");
  if (parts.length !== 2) {
    return null;
  }

  const [hour, minute] = parts.map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return hour * 60 + minute;
}

function normalizeEvent(event) {
  if (!event) {
    return createEmptyEvent();
  }

  const normalizedParticipants = Array.isArray(event.participants)
    ? event.participants
        .map((participant, index) => {
          if (typeof participant === "string") {
            return {
              id: `legacy-${index}-${participant}`,
              name: participant,
              email: participant,
              sourceLabel: "Registro legado",
            };
          }

          return participant;
        })
        .filter(Boolean)
    : [];

  return {
    ...createEmptyEvent(),
    ...event,
    eventType: event.eventType ?? event.type ?? "",
    intervalDays: event.intervalDays ?? createEmptyEvent().intervalDays,
    participants: normalizedParticipants,
  };
}

export function useEventForm(initialEvent) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(() => normalizeEvent(initialEvent));
  const [errors, setErrors] = useState({});

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateStep1() {
    const nextErrors = {};

    if (!values.name.trim()) nextErrors.name = "Informe o nome do evento.";
    if (!values.responsible.trim()) nextErrors.responsible = "Informe o responsavel.";
    if (!values.location.trim()) nextErrors.location = "Selecione o local do evento.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateStep2() {
    const nextErrors = {};
    const startDate = parseDisplayDate(values.startDate);
    const endDate = parseDisplayDate(values.endDate);
    const startTime = parseDisplayTime(values.startTime);
    const endTime = parseDisplayTime(values.endTime);

    if (!values.eventType.trim()) nextErrors.eventType = "Selecione o tipo do evento.";
    if (!values.startDate.trim()) nextErrors.startDate = "Informe a data inicial.";
    if (!values.endDate.trim()) nextErrors.endDate = "Informe a data final.";
    if (!values.startTime.trim()) nextErrors.startTime = "Informe a hora inicial.";
    if (!values.endTime.trim()) nextErrors.endTime = "Informe a hora final.";

    if (values.startDate.trim() && values.endDate.trim()) {
      if (!startDate) {
        nextErrors.startDate = "Informe uma data inicial válida.";
      }

      if (!endDate) {
        nextErrors.endDate = "Informe uma data final válida.";
      }

      if (startDate && endDate && startDate > endDate) {
        nextErrors.endDate = "A data final deve ser maior ou igual à data inicial.";
      }
    }

    if (values.startTime.trim() && values.endTime.trim()) {
      if (!startTime) {
        nextErrors.startTime = "Informe uma hora inicial válida.";
      }

      if (!endTime) {
        nextErrors.endTime = "Informe uma hora final válida.";
      }

      if (startTime !== null && endTime !== null && startTime > endTime) {
        nextErrors.endTime = "A hora final deve ser maior ou igual à hora inicial.";
      }
    }

    if (values.eventType === "RECURRING" && !String(values.intervalDays || "").trim()) {
      nextErrors.intervalDays = "Informe o intervalo da recorrencia.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;

    setStep((current) => Math.min(current + 1, 3));
  }

  function goBack() {
    setErrors({});
    setStep((current) => Math.max(current - 1, 1));
  }

  function addParticipants(participantsToAdd = []) {
    if (!participantsToAdd.length) return;

    const existing = new Set(values.participants.map((participant) => participant.id));
    const nextParticipants = [...values.participants];

    participantsToAdd.forEach((participant) => {
      if (existing.has(participant.id)) {
        return;
      }

      nextParticipants.push(participant);
      existing.add(participant.id);
    });

    setField("participants", nextParticipants);
  }

  function removeParticipant(participantId) {
    setField(
      "participants",
      values.participants.filter((item) => item.id !== participantId)
    );
  }

  return {
    step,
    values,
    errors,
    setField,
    goNext,
    goBack,
    addParticipants,
    removeParticipant,
  };
}
