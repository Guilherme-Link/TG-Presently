import { useEffect, useMemo, useRef, useState } from "react";
import { MdChevronLeft, MdChevronRight, MdClose, MdDevices, MdRefresh, MdSearch } from "react-icons/md";
import SidebarAdmin from "../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
import PageHeader from "../components/PageHeader/PageHeader.jsx";
import { adminSidebarSections } from "../data/dashboardDataAdmin";
import "../styles/theme.css";
import "../styles/pages/GerenciamentoDeTerminais.css";

const PAGE_SIZE = 10;
const CONNECT_DELAY_MS = 2200;
const STATUS_LABEL = { pending: "Aguardando", connecting: "Conectando", connected: "Conectado", disconnected: "Desconectado" };
const INITIAL_TERMINALS = [
  { id: "esp-01", name: "ESP32 ENSKFBEWY", ambientId: "", status: "pending" },
  { id: "esp-02", name: "ESP32 JAHJEOISN", ambientId: "lab-11", status: "disconnected" },
  { id: "esp-03", name: "ESP32 ZORFHWOW", ambientId: "lab-10", status: "connecting" },
  { id: "esp-04", name: "ESP32 QPLMXVTRA", ambientId: "sala-01", status: "connected" },
];
const AMBIENTS = [
  { id: "sala-01", name: "Sala 01" },
  { id: "sala-02", name: "Sala 02" },
  { id: "lab-10", name: "Lab 10" },
  { id: "lab-11", name: "Lab 11" },
  { id: "lab-12", name: "Lab 12" },
];

function ConfirmConnectionModal({ terminal, onCancel, onConfirm }) {
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === "Escape") onCancel(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onCancel]);

  return (
    <div className="gt-modal-overlay" role="presentation" onClick={onCancel}>
      <section className="gt-modal" role="dialog" aria-modal="true" aria-labelledby="gt-modal-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="gt-modal__close" onClick={onCancel} aria-label="Fechar"><MdClose size={18} /></button>
        <span className="gt-modal__icon"><MdDevices size={24} /></span>
        <h2 id="gt-modal-title" className="gt-modal__title">Permitir conexão</h2>
        <p className="gt-modal__text">Deseja autorizar o dispositivo <strong>{terminal.name}</strong> a se conectar ao servidor? Após a conexão, você poderá vinculá-lo a uma sala.</p>
        <div className="gt-modal__actions">
          <button type="button" className="gt-btn gt-btn--muted" onClick={onCancel}>Cancelar</button>
          <button type="button" className="gt-btn gt-btn--primary" onClick={onConfirm}>Permitir conexão</button>
        </div>
      </section>
    </div>
  );
}

function SectionPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="gt-pagination">
      <button type="button" className="gt-pagination__nav" disabled={page === 1} onClick={() => onPageChange(page - 1)}><MdChevronLeft size={16} />Anterior</button>
      <span className="gt-pagination__count">Página {page} de {totalPages}</span>
      <button type="button" className="gt-pagination__nav" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Próximo<MdChevronRight size={16} /></button>
    </div>
  );
}

export default function GerenciamentoDeTerminais() {
  const [terminals, setTerminals] = useState(INITIAL_TERMINALS);
  const [search, setSearch] = useState("");
  const [pendingPage, setPendingPage] = useState(1);
  const [authorizedPage, setAuthorizedPage] = useState(1);
  const [terminalToAuthorize, setTerminalToAuthorize] = useState(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const filteredTerminals = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return terminals.filter((terminal) => terminal.name.toLocaleLowerCase("pt-BR").includes(term));
  }, [terminals, search]);
  const pendingTerminals = filteredTerminals.filter((terminal) => terminal.status === "pending");
  const authorizedTerminals = filteredTerminals.filter((terminal) => terminal.status !== "pending");
  const pendingTotalPages = Math.max(1, Math.ceil(pendingTerminals.length / PAGE_SIZE));
  const authorizedTotalPages = Math.max(1, Math.ceil(authorizedTerminals.length / PAGE_SIZE));
  const pendingPageTerminals = pendingTerminals.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);
  const authorizedPageTerminals = authorizedTerminals.slice((authorizedPage - 1) * PAGE_SIZE, authorizedPage * PAGE_SIZE);

  function updateTerminal(id, changes) {
    setTerminals((current) => current.map((terminal) => terminal.id === id ? { ...terminal, ...changes } : terminal));
  }

  function connectTerminal(terminal) {
    updateTerminal(terminal.id, { status: "connecting" });
    const timer = window.setTimeout(() => updateTerminal(terminal.id, { status: "connected" }), CONNECT_DELAY_MS);
    timers.current.push(timer);
  }

  function confirmAuthorization() {
    if (!terminalToAuthorize) return;
    const terminal = terminalToAuthorize;
    setTerminalToAuthorize(null);
    connectTerminal(terminal);
  }

  return (
    <div className="dashboard gt-page">
      <SidebarAdmin sections={adminSidebarSections} activeItem="terminais-link" />
      <div className="dashboard__content">
        <main className="gt">
          <PageHeader breadcrumb="Início › Terminais / Quiosques" title="Gerenciamento de terminais" className="gt-header" breadcrumbClassName="gt-breadcrumb" titleClassName="gt-title" />
          <section className="gt-card">
            <div className="gt-card__toolbar">
              <h2 className="gt-card__title">Listagem de quiosques</h2>
              <label className="gt-search"><MdSearch size={16} aria-hidden="true" /><input type="search" placeholder="Pesquisar quiosque" value={search} onChange={(event) => { setSearch(event.target.value); setPendingPage(1); setAuthorizedPage(1); }} /></label>
            </div>
            <p className="gt-demo-note">Visualização demonstrativa com dados locais.</p>

            <section className="gt-device-section" aria-labelledby="gt-authorized-title">
              <div className="gt-device-section__heading"><h3 id="gt-authorized-title" className="gt-device-section__title">Terminais autorizados</h3><span className="gt-device-section__count">{authorizedTerminals.length}</span></div>
              <div className="gt-table">
                <div className="gt-table__head"><span className="gt-table__col">Nome</span><span className="gt-table__col gt-table__col--center">Sala vinculada</span><span className="gt-table__col gt-table__col--center">Reconectar</span><span className="gt-table__col gt-table__col--center">Status</span></div>
                <div className="gt-table__body">
                  {authorizedPageTerminals.map((terminal) => <div key={terminal.id} className="gt-table__row"><span className="gt-table__name">{terminal.name}</span><div className="gt-table__cell-center"><select className="gt-room-select" value={terminal.ambientId} disabled={terminal.status !== "connected"} onChange={(event) => updateTerminal(terminal.id, { ambientId: event.target.value })} aria-label={`Sala vinculada ao ${terminal.name}`}><option value="">{terminal.status === "connected" ? "Selecione a sala" : "—"}</option>{AMBIENTS.map((ambient) => <option key={ambient.id} value={ambient.id}>{ambient.name}</option>)}</select></div><div className="gt-table__cell-center"><button type="button" className="gt-icon-btn" disabled={terminal.status !== "disconnected"} aria-label={`Reconectar ${terminal.name}`} title="Reconectar terminal desconectado" onClick={() => connectTerminal(terminal)}><MdRefresh size={18} /></button></div><div className="gt-table__cell-center"><span className={`gt-badge gt-badge--${terminal.status}`}>{STATUS_LABEL[terminal.status]}</span></div></div>)}
                  {!authorizedPageTerminals.length && <p className="gt-table__empty">{search ? "Nenhum terminal autorizado encontrado." : "Nenhum terminal autorizado ainda."}</p>}
                </div>
              </div>
              <SectionPagination page={authorizedPage} totalPages={authorizedTotalPages} onPageChange={setAuthorizedPage} />
            </section>
            <section className="gt-device-section" aria-labelledby="gt-pending-title">
              <div className="gt-device-section__heading"><h3 id="gt-pending-title" className="gt-device-section__title">Solicitações de conexão</h3><span className="gt-device-section__count">{pendingTerminals.length}</span></div>
              <div className="gt-table">
                <div className="gt-table__head gt-table__head--pending"><span className="gt-table__col">Nome</span><span className="gt-table__col gt-table__col--center">Status</span><span className="gt-table__col gt-table__col--center">Autorização</span></div>
                <div className="gt-table__body">
                  {pendingPageTerminals.map((terminal) => <div key={terminal.id} className="gt-table__row gt-table__row--pending"><span className="gt-table__name">{terminal.name}</span><div className="gt-table__cell-center"><span className="gt-badge gt-badge--pending">{STATUS_LABEL.pending}</span></div><div className="gt-table__cell-center"><button type="button" className="gt-btn gt-btn--outline gt-btn--small" onClick={() => setTerminalToAuthorize(terminal)}>Permitir conexão</button></div></div>)}
                  {!pendingPageTerminals.length && <p className="gt-table__empty">{search ? "Nenhuma solicitação encontrada." : "Nenhum dispositivo aguardando permissão."}</p>}
                </div>
              </div>
              <SectionPagination page={pendingPage} totalPages={pendingTotalPages} onPageChange={setPendingPage} />
            </section>

            
          </section>
        </main>
      </div>
      {terminalToAuthorize && <ConfirmConnectionModal terminal={terminalToAuthorize} onCancel={() => setTerminalToAuthorize(null)} onConfirm={confirmAuthorization} />}
    </div>
  );
}
