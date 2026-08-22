import { useCallback, useEffect, useState } from "react";
import {
  MdDeleteOutline,
  MdDesktopWindows,
  MdMenuBook,
  MdNotes,
  MdRefresh,
  MdRoom,
} from "react-icons/md";
import "../styles/pages/GerenciamentoDeSalas.css";
import SidebarAdmin from "../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
import { adminSidebarSections } from "../data/dashboardDataAdmin";
import {
  createAmbient,
  deleteAmbient,
  listAmbients,
  updateAmbient,
} from "../services/ambientsApi.js";
import { isFetchNetworkError } from "../utils/api.js";

function getFriendlyErrorMessage(error, fallbackMessage) {
  if (isFetchNetworkError(error)) {
    return navigator.onLine
      ? "Não foi possível conectar ao servidor. Verifique se o backend está ativo."
      : "Você está sem conexão com a internet.";
  }

  if (error && typeof error === "object" && "status" in error) {
    if (error.status === 401 || error.status === 403) {
      return "Você não tem permissão para executar essa ação.";
    }

    if (error.status === 404) {
      return error.message || "O ambiente solicitado não foi encontrado.";
    }

    if (error.status === 409) {
      return error.message || "Já existe um ambiente com esses dados.";
    }

    if (error.status === 400) {
      return error.message || "Os dados informados são inválidos.";
    }

    if (error.status >= 500) {
      return "O servidor encontrou um problema. Tente novamente em instantes.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function AmbientFormCard({
  ambient,
  loading,
  saving,
  onSubmit,
  onCancelEdit,
}) {
  const [name, setName] = useState(ambient?.name ?? "");
  const [description, setDescription] = useState(ambient?.description ?? "");
  const [feedback, setFeedback] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      name: name.trim(),
      description: description.trim(),
    };

    if (!payload.name || !payload.description) {
      setFeedback({
        kind: "error",
        message: "Preencha o nome e a descrição do ambiente.",
      });
      return;
    }

    setFeedback(null);
    await onSubmit(payload, {
      resetForm: () => {
        setName("");
        setDescription("");
      },
      setLocalFeedback: setFeedback,
    });
  }

  return (
    <section className="gds-card gds-card--form">
      <div className="gds-card__header">
        <div>
          <p className="gds-card__eyebrow">Administração</p>
          <h2 className="gds-card__title">
            {ambient ? "Editar sala" : "Criar nova sala"}
          </h2>
        </div>
      </div>

      <p className="gds-card__description">
        Cadastre e mantenha atualizadas as salas e laboratórios usados nos
        eventos e na marcação de presença.
      </p>

      {feedback && (
        <div className={`gds-alert gds-alert--${feedback.kind}`} role="alert">
          {feedback.message}
        </div>
      )}

      <form className="gds-form" onSubmit={handleSubmit}>
        <label className="gds-field-label" htmlFor="ambient-name">
          Nome da sala
        </label>
        <div className="gds-input-shell">
          <MdRoom size={18} className="gds-input-shell__icon" aria-hidden="true" />
          <input
            id="ambient-name"
            type="text"
            className="gds-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Sala 06"
            disabled={loading || saving}
          />
        </div>

        <label className="gds-field-label" htmlFor="ambient-description">
          Descrição
        </label>
        <div className="gds-input-shell gds-input-shell--textarea">
          <MdNotes size={18} className="gds-input-shell__icon" aria-hidden="true" />
          <textarea
            id="ambient-description"
            className="gds-input gds-input--textarea"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex.: Térreo, bloco principal, laboratório de apoio"
            rows={5}
            disabled={loading || saving}
          />
        </div>

        <div className="gds-form__actions">
          <button
            type="submit"
            className="gds-btn gds-btn--primary"
            disabled={loading || saving}
          >
            {saving ? "Salvando..." : ambient ? "Salvar alterações" : "Criar sala"}
          </button>

          {ambient ? (
            <button
              type="button"
              className="gds-btn gds-btn--ghost"
              onClick={onCancelEdit}
              disabled={loading || saving}
            >
              Cancelar edição
            </button>
          ) : (
            <button
              type="button"
              className="gds-btn gds-btn--ghost"
              onClick={() => {
                setName("");
                setDescription("");
                setFeedback(null);
              }}
              disabled={loading || saving}
            >
              Limpar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function AmbientCard({ ambient, onEdit, onDelete }) {
  const Icon = ambient.name?.toLowerCase().startsWith("lab")
    ? MdDesktopWindows
    : MdMenuBook;

  return (
    <article className="gds-room-card">
      <div className="gds-room-card__icon" aria-hidden="true">
        <Icon size={26} />
      </div>

      <button
        type="button"
        className="gds-room-card__content"
        onClick={() => onEdit(ambient)}
      >
        <div className="gds-room-card__topline">
          <strong className="gds-room-card__name">{ambient.name}</strong>
        </div>
        <p className="gds-room-card__meta">{ambient.description}</p>
      </button>

      <div className="gds-room-card__actions">
        <button
          type="button"
          className="gds-icon-btn gds-icon-btn--delete"
          onClick={() => onDelete(ambient)}
          aria-label={`Excluir ${ambient.name}`}
        >
          <MdDeleteOutline size={16} />
          <span className="gds-icon-btn__label">Excluir</span>
        </button>
      </div>
    </article>
  );
}

function DeleteAmbientModal({ ambient, loading, error, onCancel, onConfirm }) {
  if (!ambient) {
    return null;
  }

  return (
    <div className="gds-modal" role="presentation" onClick={onCancel}>
      <div
        className="gds-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-ambient-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="gds-modal__title" id="delete-ambient-title">
          Confirmar exclusão
        </h3>
        <p className="gds-modal__text">
          Você vai excluir a sala <strong>{ambient.name}</strong>. Esta ação
          não pode ser desfeita.
        </p>

        {error && <div className="gds-modal__error">{error}</div>}

        <div className="gds-modal__actions">
          <button
            type="button"
            className="gds-modal__button gds-modal__button--secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="gds-modal__button gds-modal__button--danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AmbientListCard({
  ambients,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
}) {
  return (
    <section className="gds-card gds-card--list">
      <div className="gds-card__header">
        <div>
          <p className="gds-card__eyebrow">Inventário</p>
          <h2 className="gds-card__title">Salas cadastradas</h2>
        </div>

        <button
          type="button"
          className="gds-card__refresh"
          onClick={onRetry}
          disabled={loading}
        >
          <MdRefresh size={16} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="gds-alert gds-alert--error" role="alert">
          <span>{error}</span>
          <button type="button" className="gds-alert__retry" onClick={onRetry}>
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="gds-state">Carregando salas...</div>
      ) : ambients.length === 0 ? (
        <div className="gds-state">
          Nenhuma sala cadastrada ainda. Crie a primeira ao lado.
        </div>
      ) : (
        <div className="gds-room-grid">
          {ambients.map((ambient) => (
            <AmbientCard
              key={ambient.id}
              ambient={ambient}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      <div className="gds-card__footer">
        <span className="gds-card__count">
          {ambients.length} salas cadastradas
        </span>
      </div>
    </section>
  );
}

function GerenciamentoDeSalas({ institution = "Fatec Indaiatuba" }) {
  const [activeItem] = useState("salas-link");
  const [ambients, setAmbients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingAmbient, setEditingAmbient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const loadAmbients = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const response = await listAmbients();
      setAmbients(Array.isArray(response) ? response : []);
      return true;
    } catch (error) {
      setLoadError(
        getFriendlyErrorMessage(error, "Não foi possível carregar os ambientes.")
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAmbients();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAmbients]);

  async function handleSave(payload, helpers) {
    setSaving(true);

    try {
      if (editingAmbient) {
        await updateAmbient(editingAmbient.id, payload);
      } else {
        await createAmbient(payload);
      }

      await loadAmbients();
      setEditingAmbient(null);
      helpers.resetForm();
      helpers.setLocalFeedback({
        kind: "success",
        message: editingAmbient
          ? "Ambiente atualizado com sucesso."
          : "Ambiente criado com sucesso.",
      });
    } catch (error) {
      helpers.setLocalFeedback({
        kind: "error",
        message: getFriendlyErrorMessage(
          error,
          editingAmbient
            ? "Não foi possível salvar as alterações."
            : "Não foi possível criar o ambiente."
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(ambient) {
    setEditingAmbient(ambient);
    setDeleteTarget(null);
    setDeleteError(null);
  }

  function handleCancelEdit() {
    setEditingAmbient(null);
  }

  function handleDeleteRequest(ambient) {
    setDeleteTarget(ambient);
    setEditingAmbient(null);
    setDeleteError(null);
  }

  function handleCancelDelete() {
    if (deleting) {
      return;
    }

    setDeleteTarget(null);
    setDeleteError(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteAmbient(deleteTarget.id);
      setDeleteTarget(null);
      setDeleteError(null);
      await loadAmbients();
    } catch (error) {
      setDeleteError(
        getFriendlyErrorMessage(error, "Não foi possível excluir o ambiente.")
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="gds">
      <SidebarAdmin
        institution={institution}
        sections={adminSidebarSections}
        activeItem={activeItem}
      />

      <div className="gds-content">
        <header className="gds-header">
          <span className="gds-breadcrumb">Início &gt; Salas</span>
          <h1 className="gds-title">Salas</h1>
        </header>

        <main className="gds-main">
          <AmbientFormCard
            key={editingAmbient?.id ?? "new-ambient"}
            ambient={editingAmbient}
            loading={loading}
            saving={saving}
            onSubmit={handleSave}
            onCancelEdit={handleCancelEdit}
          />

          <AmbientListCard
            ambients={ambients}
            loading={loading}
            error={loadError}
            onRetry={loadAmbients}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        </main>
      </div>

      <DeleteAmbientModal
        ambient={deleteTarget}
        loading={deleting}
        error={deleteError}
        onCancel={handleCancelDelete}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default GerenciamentoDeSalas;
