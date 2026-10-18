import { useCallback, useEffect, useMemo, useState } from "react";
import { MdChevronLeft, MdChevronRight, MdClose, MdDevices, MdSearch, MdDeleteOutline } from "react-icons/md";
import SidebarAdmin from "../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
import PageHeader from "../components/PageHeader/PageHeader.jsx";
import { adminSidebarSections } from "../data/dashboardDataAdmin";
import { listAmbients } from "../services/ambientsApi.js";
import { approveTerminal, deleteTerminal, listTerminals, setTerminalAmbient } from "../services/terminalsApi.js";
import "../styles/theme.css";
import "../styles/pages/GerenciamentoDeTerminais.css";

const PAGE_SIZE = 10;

function ConfirmConnectionModal({ terminal, busy, onCancel, onConfirm }) {
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === "Escape" && !busy) onCancel(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [busy, onCancel]);

  return (
    <div className="gt-modal-overlay" role="presentation" onClick={busy ? undefined : onCancel}>
      <section className="gt-modal" role="dialog" aria-modal="true" aria-labelledby="gt-modal-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="gt-modal__close" onClick={onCancel} aria-label="Fechar" disabled={busy}><MdClose size={18} /></button>
        <span className="gt-modal__icon"><MdDevices size={24} /></span>
        <h2 id="gt-modal-title" className="gt-modal__title">Permitir terminal</h2>
        <p className="gt-modal__text">Deseja autorizar <strong>{terminal.name}</strong>? Depois da autorização, vincule o terminal a um ambiente para habilitar a exibição do QR Code.</p>
        <div className="gt-modal__actions">
          <button type="button" className="gt-btn gt-btn--muted" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button type="button" className="gt-btn gt-btn--primary" onClick={onConfirm} disabled={busy}>{busy ? "Autorizando…" : "Autorizar terminal"}</button>
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
      <button type="button" className="gt-pagination__nav" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Próxima<MdChevronRight size={16} /></button>
    </div>
  );
}

export default function GerenciamentoDeTerminais() {
  const [terminals, setTerminals] = useState([]);
  const [ambients, setAmbients] = useState([]);
  const [search, setSearch] = useState("");
  const [pendingPage, setPendingPage] = useState(1);
  const [authorizedPage, setAuthorizedPage] = useState(1);
  const [terminalToAuthorize, setTerminalToAuthorize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [terminalData, ambientData] = await Promise.all([listTerminals(), listAmbients()]);
      setTerminals(Array.isArray(terminalData) ? terminalData : []);
      setAmbients(Array.isArray(ambientData) ? ambientData : []);
    } catch (loadError) {
      setError(loadError.message || "Não foi possível carregar os terminais.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredTerminals = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return terminals.filter((terminal) => `${terminal.name} ${terminal.terminalId}`.toLocaleLowerCase("pt-BR").includes(term));
  }, [terminals, search]);
  const pendingTerminals = filteredTerminals.filter((terminal) => !terminal.approved);
  const authorizedTerminals = filteredTerminals.filter((terminal) => terminal.approved);
  const pendingTotalPages = Math.max(1, Math.ceil(pendingTerminals.length / PAGE_SIZE));
  const authorizedTotalPages = Math.max(1, Math.ceil(authorizedTerminals.length / PAGE_SIZE));
  const pendingPageTerminals = pendingTerminals.slice((pendingPage - 1) * PAGE_SIZE, pendingPage * PAGE_SIZE);
  const authorizedPageTerminals = authorizedTerminals.slice((authorizedPage - 1) * PAGE_SIZE, authorizedPage * PAGE_SIZE);

  async function authorizeTerminal() {
    if (!terminalToAuthorize) return;
    const terminal = terminalToAuthorize;
    setBusyId(terminal.id);
    setError("");
    try {
      await approveTerminal(terminal.id);
      setTerminalToAuthorize(null);
      setNotice(`${terminal.name} autorizado.`);
      await loadData();
    } catch (actionError) {
      setError(actionError.message || "Não foi possível autorizar o terminal.");
    } finally {
      setBusyId(null);
    }
  }

  async function changeAmbient(terminal, ambientId) {
    if (!ambientId) return;
    setBusyId(terminal.id);
    setError("");
    try {
      await setTerminalAmbient(terminal.id, ambientId);
      setTerminals((current) => current.map((item) => item.id === terminal.id ? { ...item, ambientId: Number(ambientId) } : item));
      setNotice("Ambiente do terminal atualizado.");
    } catch (actionError) {
      setError(actionError.message || "Não foi possível vincular o ambiente.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeTerminal(terminal) {
    if (!window.confirm(`Excluir o terminal ${terminal.name}?`)) return;
    setBusyId(terminal.id);
    setError("");
    try {
      await deleteTerminal(terminal.id);
      setTerminals((current) => current.filter((item) => item.id !== terminal.id));
      setNotice("Terminal excluído.");
    } catch (actionError) {
      setError(actionError.message || "Não foi possível excluir o terminal.");
    } finally {
      setBusyId(null);
    }
  }

  const ambientName = (id) => ambients.find((ambient) => String(ambient.id) === String(id))?.name || "Ambiente indisponível";

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
            {error && <p className="gt-feedback gt-feedback--error" role="alert">{error} <button className="gt-inline-action" type="button" onClick={loadData}>Atualizar listagem</button></p>}
            {notice && <p className="gt-feedback gt-feedback--success" role="status">{notice}</p>}
            {loading ? <div className="gt-state">Carregando terminais…</div> : <>
              <section className="gt-device-section" aria-labelledby="gt-authorized-title">
                <div className="gt-device-section__heading"><h3 id="gt-authorized-title" className="gt-device-section__title">Terminais autorizados</h3><span className="gt-device-section__count">{authorizedTerminals.length}</span></div>
                <div className="gt-table">
                  <div className="gt-table__head"><span className="gt-table__col">Quiosque</span><span className="gt-table__col gt-table__col--center">Ambiente vinculado</span><span className="gt-table__col gt-table__col--center">Status</span><span className="gt-table__col gt-table__col--center">Ações</span></div>
                  <div className="gt-table__body">
                    {authorizedPageTerminals.map((terminal) => <div key={terminal.id} className="gt-table__row">
                      <span className="gt-table__name" title={`ID físico: ${terminal.terminalId}`}>{terminal.name}</span>
                      <div className="gt-table__cell-center"><select className="gt-room-select" value={terminal.ambientId ?? ""} disabled={busyId === terminal.id || !ambients.length} onChange={(event) => changeAmbient(terminal, event.target.value)} aria-label={`Ambiente vinculado ao ${terminal.name}`}><option value="" disabled>{terminal.ambientId ? ambientName(terminal.ambientId) : "Selecione o ambiente"}</option>{ambients.map((ambient) => <option key={ambient.id} value={ambient.id}>{ambient.name}</option>)}</select></div>
                      <div className="gt-table__cell-center"><span className="gt-badge gt-badge--connected">Autorizado</span></div>
                      <div className="gt-table__cell-center"><button type="button" className="gt-icon-btn" disabled={busyId === terminal.id} aria-label={`Excluir ${terminal.name}`} title="Excluir terminal" onClick={() => removeTerminal(terminal)}><MdDeleteOutline size={18} /></button></div>
                    </div>)}
                    {!authorizedPageTerminals.length && <p className="gt-table__empty">{search ? "Nenhum terminal autorizado encontrado." : "Nenhum terminal autorizado ainda."}</p>}
                  </div>
                </div>
                <SectionPagination page={authorizedPage} totalPages={authorizedTotalPages} onPageChange={setAuthorizedPage} />
              </section>
              <section className="gt-device-section" aria-labelledby="gt-pending-title">
                <div className="gt-device-section__heading"><h3 id="gt-pending-title" className="gt-device-section__title">Solicitações de autorização</h3><span className="gt-device-section__count">{pendingTerminals.length}</span></div>
                <div className="gt-table">
                  <div className="gt-table__head gt-table__head--pending"><span className="gt-table__col">Quiosque</span><span className="gt-table__col gt-table__col--center">Status</span><span className="gt-table__col gt-table__col--center">Autorização</span></div>
                  <div className="gt-table__body">
                    {pendingPageTerminals.map((terminal) => <div key={terminal.id} className="gt-table__row gt-table__row--pending"><span className="gt-table__name" title={`ID físico: ${terminal.terminalId}`}>{terminal.name}</span><div className="gt-table__cell-center"><span className="gt-badge gt-badge--pending">Aguardando</span></div><div className="gt-table__cell-center"><button type="button" className="gt-btn gt-btn--outline gt-btn--small" disabled={busyId === terminal.id} onClick={() => setTerminalToAuthorize(terminal)}>Autorizar</button></div></div>)}
                    {!pendingPageTerminals.length && <p className="gt-table__empty">{search ? "Nenhuma solicitação encontrada." : "Nenhum dispositivo aguardando autorização."}</p>}
                  </div>
                </div>
                <SectionPagination page={pendingPage} totalPages={pendingTotalPages} onPageChange={setPendingPage} />
              </section>
            </>}
          </section>
        </main>
      </div>
      {terminalToAuthorize && <ConfirmConnectionModal terminal={terminalToAuthorize} busy={busyId === terminalToAuthorize.id} onCancel={() => setTerminalToAuthorize(null)} onConfirm={authorizeTerminal} />}
    </div>
  );
}
