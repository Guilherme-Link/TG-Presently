import { useCallback, useEffect, useState } from "react";
import { adminSidebarSections } from "../data/dashboardDataAdmin";
import {
  MdMail,
  MdEdit,
  MdDeleteOutline,
  MdSwapVert,
  MdKeyboardArrowDown,
  MdRefresh,
  MdInfoOutline,
} from "react-icons/md";
import "../styles/pages/GerenciarUsuarioDesktopAdmin.css";
import SidebarAdmin from "../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
import PageHeader from "../components/PageHeader/PageHeader.jsx";
import { isFetchNetworkError } from "../utils/api.js";
import { deleteUser, listUsers, registerUser, updateUser } from "../services/usersApi.js";

const USER_TYPE_OPTIONS = [
  { label: "Participante", value: "user" },
  { label: "Responsável", value: "responsible" },
  { label: "Administrador", value: "admin" },
];

const DEFAULT_USER_TYPE = USER_TYPE_OPTIONS[0].value;

function getRoleValueFromRoles(roles = []) {
  if (roles.includes("ROLE_ADMIN")) {
    return "admin";
  }

  return roles.includes("ROLE_RESPONSIBLE") ? "responsible" : "user";
}

function DropdownSelect({ label, options, selected, onSelect, id }) {
  return (
    <div className="gua-dropdown">
      <label className="gua-dropdown__label" htmlFor={id}>
        {label}
      </label>
      <div className="gua-dropdown__control">
        <select
          id={id}
          className="gua-dropdown__select"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <MdKeyboardArrowDown size={18} className="gua-dropdown__icon" aria-hidden="true" />
      </div>
    </div>
  );
}

function getUserProfileLabel(roles = []) {
  if (roles.includes("ROLE_ADMIN")) {
    return "Administrador";
  }

  return roles.includes("ROLE_RESPONSIBLE") ? "Responsável" : "Participante";
}

function getUserProfileClass(roles = []) {
  if (roles.includes("ROLE_ADMIN")) {
    return "gua-profile-badge--admin";
  }

  return roles.includes("ROLE_RESPONSIBLE")
    ? "gua-profile-badge--responsible"
    : "gua-profile-badge--student";
}

function normalizeUserType(role) {
  return USER_TYPE_OPTIONS.some((option) => option.value === role)
    ? role
    : DEFAULT_USER_TYPE;
}

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

    if (error.status === 422) {
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

function DeleteConfirmationModal({ user, loading, error, onCancel, onConfirm }) {
  if (!user) {
    return null;
  }

  return (
    <div className="gua-modal" role="presentation" onClick={onCancel}>
      <div
        className="gua-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="gua-modal__title" id="delete-user-title">
          Confirmar exclusão
        </h3>
        <p className="gua-modal__text">
          Você vai excluir o usuário <strong>{user.username}</strong>. Esta ação não pode ser desfeita.
        </p>

        {error && <div className="gua-modal__error">{error}</div>}

        <div className="gua-modal__actions">
          <button type="button" className="gua-modal__button gua-modal__button--secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="gua-modal__button gua-modal__button--danger"
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

function EditUserModal({ user, loading, error, onCancel, onConfirm }) {
  const [email, setEmail] = useState(user?.username ?? "");
  const [userType, setUserType] = useState(() =>
    getRoleValueFromRoles(user?.roles ?? [])
  );

  if (!user) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    onConfirm({
      username: email.trim(),
      role: userType,
    });
  }

  return (
    <div className="gua-modal" role="presentation" onClick={onCancel}>
      <div
        className="gua-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="gua-modal__title" id="edit-user-title">
          Editar usuário
        </h3>

        <form className="gua-modal__form" onSubmit={handleSubmit}>
          <label className="gua-field-label" htmlFor="edit-user-email">
            Email do participante
          </label>
          <div className="gua-input gua-input--modal">
            <MdMail size={17} className="gua-input__icon" />
            <input
              id="edit-user-email"
              type="email"
              placeholder="participante@faculdade.gov.br"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="gua-register__row gua-register__row--modal">
            <DropdownSelect
              id="edit-user-type"
              label="Tipo de usuario"
              options={USER_TYPE_OPTIONS}
              selected={userType}
              onSelect={(value) => setUserType(normalizeUserType(value))}
            />
          </div>

          {error && <div className="gua-modal__error">{error}</div>}

          <div className="gua-modal__actions">
            <button
              type="button"
              className="gua-modal__button gua-modal__button--secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="gua-modal__button gua-modal__button--danger"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RegisterUserCard({ onRegistered }) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState(DEFAULT_USER_TYPE);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    const normalizedUsername = username.trim();
    const normalizedFullName = fullName.trim();

    if (!normalizedUsername) {
      setFeedback({
        kind: "error",
        message: "Informe o email do usuário.",
      });
      return;
    }

    if (!normalizedFullName) {
      setFeedback({
        kind: "error",
        message: "Informe o nome completo do usuário.",
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const createdUser = await registerUser({
        username: normalizedUsername,
        fullName: normalizedFullName,
        password: password.trim(),
        role: userType,
      });

      setUsername("");
      setFullName("");
      setPassword("");
      setUserType(DEFAULT_USER_TYPE);

      const refreshed = onRegistered ? await onRegistered() : true;
      const generatedPassword = createdUser?.generatedPassword;

      setFeedback({
        kind: "success",
        message: generatedPassword
          ? refreshed
            ? `Usuário criado com sucesso. Senha gerada automaticamente: ${generatedPassword}`
            : `Usuário criado com sucesso, mas a lista não pôde ser atualizada agora. Senha gerada: ${generatedPassword}`
          : refreshed
            ? "Usuário criado com sucesso com a senha informada."
            : "Usuário criado com sucesso, mas a lista não pôde ser atualizada agora.",
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message: getFriendlyErrorMessage(
          error,
          "Não foi possível criar o usuário."
        ),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="gua-register">
      <h2 className="gua-register__title">Cadastro de usuário</h2>

      {feedback && (
        <div
          className={`gua-alert gua-alert--${feedback.kind}`}
          role="alert"
          aria-live="polite"
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label className="gua-field-label" htmlFor="student-email">
          Email do usuário
        </label>
        <div className="gua-input">
          <MdMail size={17} className="gua-input__icon" />
          <input
            id="student-email"
            type="email"
              placeholder="participante@faculdade.gov.br"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="email"
            disabled={submitting}
          />
        </div>

        <label className="gua-field-label" htmlFor="student-fullname">
          Nome completo
        </label>
        <div className="gua-input">
          <input
            id="student-fullname"
            type="text"
            placeholder="Nome completo do usuário"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            disabled={submitting}
          />
        </div>

        <label className="gua-field-label" htmlFor="student-password">
          Senha do usuário
        </label>
        <p className="gua-field-note">
          <MdInfoOutline size={14} className="gua-field-note__icon" aria-hidden="true" />
          Obrigatória. O backend exige uma senha válida para criar o usuário.
        </p>
        <div className="gua-input">
          <input
            id="student-password"
            type="password"
            placeholder="Digite uma senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={submitting}
          />
        </div>

        <div className="gua-register__row">
          <DropdownSelect
            id="user-type"
            label="Tipo de usuario"
            options={USER_TYPE_OPTIONS}
            selected={userType}
            onSelect={setUserType}
          />
        </div>

        <button type="submit" className="gua-register__submit" disabled={submitting}>
          {submitting ? "Criando..." : "+ Criar usuário"}
        </button>
      </form>
    </section>
  );
}

function UserListCard({ users, loading, error, onRetry }) {
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [pendingEditUser, setPendingEditUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    if (!pendingDeleteUser && !pendingEditUser) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setPendingDeleteUser(null);
        setDeleteError(null);
        setPendingEditUser(null);
        setEditError(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingDeleteUser, pendingEditUser]);

  function requestEdit(user) {
    setPendingEditUser(user);
    setEditError(null);
  }

  function requestDelete(user) {
    setPendingEditUser(null);
    setEditError(null);
    setPendingDeleteUser(user);
    setDeleteError(null);
  }

  function cancelDelete() {
    if (deleting) {
      return;
    }

    setPendingDeleteUser(null);
    setDeleteError(null);
  }

  function cancelEdit() {
    if (editing) {
      return;
    }

    setPendingEditUser(null);
    setEditError(null);
  }

  async function confirmDelete() {
    if (!pendingDeleteUser) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteUser(pendingDeleteUser.id);
      setPendingDeleteUser(null);
      await onRetry();
    } catch (error) {
      setDeleteError(
        getFriendlyErrorMessage(error, "Não foi possível excluir o usuário.")
      );
    } finally {
      setDeleting(false);
    }
  }

  async function confirmEdit(payload) {
    if (!pendingEditUser) {
      return;
    }

    if (!payload.username?.trim()) {
      setEditError("Informe o e-mail do participante.");
      return;
    }

    setEditing(true);
    setEditError(null);

    try {
      await updateUser(pendingEditUser.id, payload);
      setPendingEditUser(null);
      await onRetry();
    } catch (error) {
      setEditError(
        getFriendlyErrorMessage(error, "Não foi possível salvar as alterações.")
      );
    } finally {
      setEditing(false);
    }
  }

  return (
    <section className="gua-list">
      <div className="gua-list__header">
        <h2 className="gua-list__title">Lista de usuários</h2>
        <button type="button" className="gua-list__refresh" onClick={onRetry} disabled={loading}>
          <MdRefresh size={16} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="gua-alert gua-alert--error" role="alert">
          <span>{error}</span>
          <button type="button" className="gua-alert__retry" onClick={onRetry}>
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="gua-list__state">Carregando usuários...</div>
      ) : users.length === 0 ? (
        <div className="gua-list__state">Nenhum usuário cadastrado ainda.</div>
      ) : (
        <div className="gua-table">
          <div className="gua-table__head">
            <span className="gua-table__col gua-table__col--profile">
              Perfil <MdSwapVert size={14} />
            </span>
            <span className="gua-table__col gua-table__col--email">
              Email <MdSwapVert size={14} />
            </span>
            <span className="gua-table__col gua-table__col--action">Editar</span>
            <span className="gua-table__col gua-table__col--action">Excluir</span>
          </div>

          <div className="gua-table__body">
            {users.map((user) => (
              <div key={user.id} className="gua-table__row">
                <span className={`gua-profile-badge ${getUserProfileClass(user.roles)}`}>
                  <span className="gua-profile-badge__dot" />
                  {getUserProfileLabel(user.roles)}
                </span>
                <span className="gua-table__email">{user.username}</span>
                <button
                  type="button"
                  className="gua-icon-btn gua-icon-btn--edit"
                  aria-label="Editar usuário"
                  onClick={() => requestEdit(user)}
                >
                  <MdEdit size={16} />
                </button>
                <button
                  type="button"
                  className="gua-icon-btn gua-icon-btn--delete"
                  aria-label="Excluir usuário"
                  onClick={() => requestDelete(user)}
                >
                  <MdDeleteOutline size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <DeleteConfirmationModal
        user={pendingDeleteUser}
        loading={deleting}
        error={deleteError}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      <EditUserModal
        key={pendingEditUser?.id ?? "empty"}
        user={pendingEditUser}
        loading={editing}
        error={editError}
        onCancel={cancelEdit}
        onConfirm={confirmEdit}
      />
    </section>
  );
}

/**
 * GerenciarUsuarioDesktopAdmin
 * ------------------------------------------------------------------
 * Tela administrativa de gerenciamento de usuários: cadastro de um
 * novo usuário e listagem dos usuários existentes.
 */
function GerenciarUsuarioDesktopAdmin({
  institution = "Fatec Indaiatuba",
}) {
  const [activeItem] = useState("usuarios-link");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUsersError(null);

    try {
      const response = await listUsers();
      setUsers(Array.isArray(response) ? response : []);
      return true;
    } catch (error) {
      setUsersError(
        getFriendlyErrorMessage(error, "Não foi possível carregar a lista de usuários.")
      );
      return false;
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUsers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  return (
    <div className="gua">
      <SidebarAdmin
        institution={institution}
        sections={adminSidebarSections}
        activeItem={activeItem}
      />

      <div className="gua-content">
        <PageHeader breadcrumb="Início › Usuários" title="Usuários" className="gua-header" breadcrumbClassName="gua-breadcrumb" titleClassName="gua-title" />

        <main className="gua-main">
          <RegisterUserCard onRegistered={loadUsers} />
          <UserListCard
            users={users}
            loading={loadingUsers}
            error={usersError}
            onRetry={loadUsers}
          />
        </main>
      </div>
    </div>
  );
}

export default GerenciarUsuarioDesktopAdmin;
