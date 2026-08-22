import { useEffect, useMemo, useState } from "react";
import SidebarAdmin from "../../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
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
  users = [],
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

  const ambientOptions = useMemo(
    () =>
      ambients.map((ambient) => ({
        label: ambient.name,
        value: String(ambient.id),
      })),
    [ambients]
  );

  const mockParticipantLists = useMemo(
    () => buildMockParticipantLists(users),
    [users]
  );

  useEffect(() => {
    if (eventToEdit?.location && values.location !== String(eventToEdit.location)) {
      setField("location", String(eventToEdit.location));
    }
  }, [eventToEdit?.location, setField, values.location]);

  async function handleSubmit() {
    setSaving(true);

    try {
      const payload = buildEventPayload(values);
      await onSave?.(payload);
    } finally {
      setSaving(false);
    }
  }

  function handleAddSelectedItems(selectedItems) {
    if (!selectedItems.length) {
      return;
    }

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
      );
      addParticipants(participantsFromLists);
    }

    setActiveModal(null);
  }

  return (
    <div className="cee">
      <SidebarAdmin institution="Fatec Indaiatuba" sections={adminSidebarSections} activeItem="eventos-link" />

      <div className="cee-content">
        <header className="cee-header">
          <span className="cee-breadcrumb">Início &gt; Eventos</span>
          <h1 className="cee-title">{isEditing ? "Editar evento" : "Criar evento"}</h1>
        </header>

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
                      ambients={ambientOptions}
                      loadingAmbients={loadingData}
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
          participants={users.map((user) => ({
            id: user.id,
            name: user.username,
            email: user.username,
          }))}
          participantLists={mockParticipantLists}
          onClose={() => setActiveModal(null)}
          onConfirm={handleAddSelectedItems}
        />
      )}
    </div>
  );
}

export default CriarEditarEvento;
