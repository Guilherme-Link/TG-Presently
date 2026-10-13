import { useEffect, useMemo, useState } from "react";
import SidebarAdmin from "../../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
import PageHeader from "../../components/PageHeader/PageHeader.jsx";
import { adminSidebarSections } from "../../data/dashboardDataAdmin";
import Button from "../../components/Button/Button";
import Stepper from "../../components/Stepper/Stepper";
import ParticipantsPanel from "../../components/ParticipantsPanel/ParticipantsPanel";
import ParticipantSelectionModal from "../../components/ParticipantSelectionModal/ParticipantSelectionModal.jsx";
import StepDadosIniciais from "./steps/StepDadosIniciais";
import StepConfiguracoes from "./steps/StepConfiguracoes";
import StepParticipantes from "./steps/StepParticipantes";
import { useEventForm } from "../../hooks/useEventForm";
import { buildEventPayload, buildMockParticipantLists } from "../../data/eventsData";
import "../../styles/theme.css";
import "../../styles/pages/CriarEditarEvento/CriarEditarEvento.css";

function CriarEditarEvento({
  eventToEdit,
  ambients = [],
  participants = [],
  currentUser = null,
  loadingData = false,
  dataError = null,
  onCancel,
  onSave,
}) {
  const isEditing = Boolean(eventToEdit);
  const [activeModal, setActiveModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const {
    step,
    values,
    errors,
    setField,
    goNext,
    goBack,
    addParticipants,
    removeParticipant,
  } = useEventForm(eventToEdit);

  const participantsById = useMemo(
    () => new Map(participants.map((participant) => [String(participant.id), participant])),
    [participants]
  );

  const ambientOptions = useMemo(
    () =>
      ambients.map((ambient) => ({
        label: ambient.name,
        value: String(ambient.id),
      })),
    [ambients]
  );

  const responsibleOptions = useMemo(
    () =>
      participants
        .filter((participant) => participant.canBeResponsible)
        .map((participant) => ({
        label: participant.name,
        value: String(participant.id),
        })),
    [participants]
  );

  const mockParticipantLists = useMemo(
    () => buildMockParticipantLists(participants),
    [participants]
  );

  useEffect(() => {
    if (isEditing) {
      return;
    }

    if (String(values.responsibleId ?? "").trim()) {
      return;
    }

    const fallbackResponsibleId = currentUser?.participantId;
    if (fallbackResponsibleId === null || fallbackResponsibleId === undefined) {
      return;
    }

    const fallbackKey = String(fallbackResponsibleId);
    const fallbackParticipant = participantsById.get(fallbackKey);

    if (!fallbackParticipant?.canBeResponsible) {
      return;
    }

    setField("responsibleId", fallbackKey);
    setField("responsible", fallbackParticipant.name ?? "");
  }, [currentUser?.participantId, isEditing, participantsById, setField, values.responsibleId]);

  useEffect(() => {
    const responsibleId = String(values.responsibleId ?? "");
    if (!responsibleId) {
      return;
    }

    const hasResponsibleAsParticipant = values.participants.some(
      (participant) => String(participant.id) === responsibleId
    );

    if (!hasResponsibleAsParticipant) {
      return;
    }

    setField(
      "participants",
      values.participants.filter((participant) => String(participant.id) !== responsibleId)
    );
  }, [setField, values.participants, values.responsibleId]);

  async function handleSubmit() {
    setSaving(true);

    try {
      const payload = buildEventPayload(values, currentUser?.participantId ?? eventToEdit?.responsibleId ?? null);
      await onSave?.(payload);
    } finally {
      setSaving(false);
    }
  }

  function handleAddSelectedItems(selectedItems) {
    if (!selectedItems.length) {
      return;
    }

    const responsibleId = String(values.responsibleId ?? "");

    if (activeModal === "participants") {
      addParticipants(
        selectedItems
          .map((item) =>
            item.payload
              ? {
                  ...item.payload,
                  sourceLabel: "Adicionado manualmente",
                }
              : null
          )
          .filter(Boolean)
          .filter((participant) => String(participant.id) !== responsibleId)
      );
    }

    if (activeModal === "lists") {
      const participantsFromLists = selectedItems.flatMap((item) =>
        Array.isArray(item.payload)
          ? item.payload.map((participant) => ({
              ...participant,
              sourceLabel: item.title,
            }))
          : []
      ).filter((participant) => String(participant.id) !== responsibleId);
      addParticipants(participantsFromLists);
    }

    setActiveModal(null);
  }

  return (
    <div className="cee">
      <SidebarAdmin institution="Fatec Indaiatuba" sections={adminSidebarSections} activeItem="eventos-link" />

      <div className="cee-content">
        <PageHeader breadcrumb="Início › Eventos" title={isEditing ? "Editar evento" : "Criar evento"} className="cee-header" breadcrumbClassName="cee-breadcrumb" titleClassName="cee-title" />

        <main className="cee-main">
          <div className={`cee-card ${step === 3 ? "cee-card--wide" : ""}`}>
            <div className="cee-card__form">
              <h2 className="cee-card__title">{isEditing ? "Editar evento" : "Criar evento"}</h2>

              <Stepper currentStep={step} />

              {dataError && step === 1 && (
                <div className="cee-alert" role="alert">
                  {dataError}
                </div>
              )}

              {loadingData && step === 1 ? (
                <div className="cee-loading">Carregando dados do evento...</div>
              ) : (
                <>
                  {step === 1 && (
                    <StepDadosIniciais
                      values={values}
                      errors={errors}
                      setField={setField}
                      responsibleOptions={responsibleOptions}
                      loadingResponsibleOptions={loadingData || responsibleOptions.length === 0}
                      ambients={ambientOptions}
                      loadingAmbients={loadingData}
                      onResponsibleChange={(responsibleId) => {
                        const responsibleParticipant = participantsById.get(String(responsibleId));
                        setField("responsibleId", String(responsibleId));
                        setField("responsible", responsibleParticipant?.name ?? "");
                      }}
                    />
                  )}

                  {step === 2 && (
                    <StepConfiguracoes values={values} errors={errors} setField={setField} />
                  )}

                  {step === 3 && (
                    <StepParticipantes
                      onOpenParticipants={() => setActiveModal("participants")}
                      onOpenParticipantLists={() => setActiveModal("lists")}
                    />
                  )}
                </>
              )}

              <div className="cee-actions">
                {step > 1 && (
                  <Button variant="outline" onClick={goBack}>
                    Voltar
                  </Button>
                )}

                {step < 3 && (
                  <Button variant="primary" onClick={goNext} disabled={loadingData}>
                    Proximo passo
                  </Button>
                )}

                {step === 3 && (
                  <Button variant="primary" onClick={handleSubmit} disabled={saving || loadingData}>
                    {saving ? "Salvando..." : isEditing ? "Salvar alteracoes" : "Criar evento"}
                  </Button>
                )}

                <Button variant="muted" onClick={onCancel} disabled={saving}>
                  Cancelar
                </Button>
              </div>
            </div>

            {step === 3 && (
              <ParticipantsPanel participants={values.participants} onRemove={removeParticipant} />
            )}
          </div>
        </main>
      </div>

      {activeModal && (
        <ParticipantSelectionModal
          key={activeModal}
          mode={activeModal}
          participants={participants.filter(
            (participant) => String(participant.id) !== String(values.responsibleId ?? "")
          )}
          participantLists={mockParticipantLists}
          onClose={() => setActiveModal(null)}
          onConfirm={handleAddSelectedItems}
        />
      )}
    </div>
  );
}

export default CriarEditarEvento;
