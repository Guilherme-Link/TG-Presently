import { useState } from "react";
import { adminSidebarSections } from "../data/dashboardDataAdmin";
import {
  MdMail,
  MdEdit,
  MdDeleteOutline,
  MdSwapVert,
  MdKeyboardArrowDown,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import "./GerenciarUsuarioDesktopAdmin.css";
import SidebarAdmin from "../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";

const USER_TYPE_OPTIONS = ["Aluno", "Administrador"];
const PASSWORD_TYPE_OPTIONS = ["RA", "CPF", "RG"];

const USERS = [
  { id: 1, status: "active", email: "eduardo@faculdade.sp.gov.br" },
  { id: 2, status: "inactive", email: "guilherme@faculdade.sp.gov.br" },
];

const PAGES = [1, 2, 3, "…", 10, 11];

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
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <MdKeyboardArrowDown size={18} className="gua-dropdown__icon" aria-hidden="true" />
      </div>
    </div>
  );
}

function RegisterUserCard() {
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState(USER_TYPE_OPTIONS[0]);
  const [passwordType, setPasswordType] = useState(PASSWORD_TYPE_OPTIONS[0]);

  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <section className="gua-register">
      <h2 className="gua-register__title">Cadastro de usuário</h2>

      <form onSubmit={handleSubmit}>
        <label className="gua-field-label" htmlFor="student-email">
          Email do aluno
        </label>
        <div className="gua-input">
          <MdMail size={17} className="gua-input__icon" />
          <input
            id="student-email"
            type="email"
            placeholder="aluno@faculdade.gov.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <DropdownSelect
            id="password-type"
            label="Senha"
            options={PASSWORD_TYPE_OPTIONS}
            selected={passwordType}
            onSelect={setPasswordType}
          />
        </div>

        <button type="submit" className="gua-register__submit">
          + Criar usuário
        </button>
      </form>
    </section>
  );
}

function UserListCard({ users }) {
  return (
    <section className="gua-list">
      <h2 className="gua-list__title">Lista de usuários</h2>

      <div className="gua-table">
        <div className="gua-table__head">
          <span className="gua-table__col gua-table__col--status">Status</span>
          <span className="gua-table__col gua-table__col--email">
            Email <MdSwapVert size={14} />
          </span>
          <span className="gua-table__col gua-table__col--action">Editar</span>
          <span className="gua-table__col gua-table__col--action">Excluir</span>
        </div>

        <div className="gua-table__body">
          {users.map((user) => (
            <div key={user.id} className="gua-table__row">
              <span className={`gua-status gua-status--${user.status}`}>
                <span className="gua-status__dot" />
                {user.status === "active" ? "Ativo" : "Inativo"}
              </span>
              <span className="gua-table__email">{user.email}</span>
              <button
                type="button"
                className="gua-icon-btn gua-icon-btn--edit"
                aria-label="Editar usuário"
              >
                <MdEdit size={16} />
              </button>
              <button
                type="button"
                className="gua-icon-btn gua-icon-btn--delete"
                aria-label="Excluir usuário"
              >
                <MdDeleteOutline size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="gua-pagination">
        <button type="button" className="gua-pagination__nav">
          <MdChevronLeft size={16} />
          Anterior
        </button>

        <div className="gua-pagination__pages">
          {PAGES.map((page, index) => (
            <span
              key={`${page}-${index}`}
              className={`gua-pagination__page ${page === 1 ? "gua-pagination__page--active" : ""} ${
                page === "…" ? "gua-pagination__page--ellipsis" : ""
              }`}
            >
              {typeof page === "number" ? String(page).padStart(2, "0") : page}
            </span>
          ))}
        </div>

        <button type="button" className="gua-pagination__nav">
          Próximo
          <MdChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}

/**
 * GerenciarUsuarioDesktopAdmin
 * ------------------------------------------------------------------
 * Tela administrativa de gerenciamento de usuários: cadastro de um
 * novo usuário e listagem paginada dos usuários existentes.
 */
function GerenciarUsuarioDesktopAdmin({
  // dateLabel = getCurrentDateLabel(),
  institution = "Fatec Indaiatuba",
  users = USERS,
}) {

  /* eslint-disable no-unused-vars */
  const [activeItem, setActiveItem] = useState("usuarios-link");
  return (
    <div className="gua">
      <SidebarAdmin
        institution={institution}
        sections={adminSidebarSections}
        activeItem={activeItem}
      />

      <div className="gua-content">
        <header className="gua-header">
          <span className="gua-breadcrumb">Início &gt; Usuários</span>
          <h1 className="gua-title">Usuários</h1>
        </header>

        <main className="gua-main">
          <RegisterUserCard />
          <UserListCard users={users} />
        </main>
      </div>
    </div>
  );
}

export default GerenciarUsuarioDesktopAdmin;
