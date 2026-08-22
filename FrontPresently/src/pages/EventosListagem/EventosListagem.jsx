import { useMemo, useState } from "react";
import { MdAdd, MdRefresh, MdSearch } from "react-icons/md";
import SidebarAdmin from "../../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
import { adminSidebarSections } from "../../data/dashboardDataAdmin";
import Button from "../../components/Button/Button";
import EventsTable from "../../components/EventsTable/EventsTable";
import EmptyState from "../../components/EmptyState/EmptyState";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal/ConfirmDeleteModal";
import EventDetailModal from "../../components/EventDetailModal/EventDetailModal";
import "../../styles/theme.css";
import "../../styles/pages/EventosListagem/EventosListagem.css";

function EventosListagem({
  events,
  loading,
  error,
  onReload,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  mutating,
}) {
  const [search, setSearch] = useState("");
  const [eventToView, setEventToView] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return events;

    return events.filter((event) =>
      event.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [events, search]);

  function handleConfirmDelete() {
    if (!eventToDelete) {
      return;
    }

    onDeleteEvent(eventToDelete);
    setEventToDelete(null);
  }

  const hasNoEventsAtAll = events.length === 0;
  const hasNoSearchResults = !hasNoEventsAtAll && filteredEvents.length === 0;

  return (
    <div className="el">
      <SidebarAdmin institution="Fatec Indaiatuba" sections={adminSidebarSections} activeItem="eventos-link" />

      <div className="el-content">
        <header className="el-header">
          <span className="el-breadcrumb">Início &gt; Eventos</span>
          <h1 className="el-title">Eventos</h1>
        </header>

        <main className="el-main">
          <section className="el-card">
            <div className="el-card__toolbar">
              <h2 className="el-card__title">Eventos criados</h2>

              <div className="el-card__actions">
                <Button variant="primary" onClick={onCreateEvent}>
                  <MdAdd size={17} />
                  Criar evento
                </Button>

                <Button variant="outline" onClick={onReload} disabled={loading || mutating}>
                  <MdRefresh size={16} />
                  Atualizar
                </Button>

                <div className="el-search">
                  <MdSearch size={16} />
                  <input
                    type="search"
                    placeholder="Pesquisar evento"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="el-state">Carregando eventos...</div>
            ) : error ? (
              <div className="el-state el-state--error" role="alert">
                <span>{error}</span>
                <Button variant="outline" onClick={onReload}>
                  Tentar novamente
                </Button>
              </div>
            ) : hasNoEventsAtAll && (
              <EmptyState
                title="Nenhum evento cadastrado"
                description="Voce ainda nao criou nenhum evento. Crie o primeiro evento para comecar."
                actionLabel="Criar evento"
                onAction={onCreateEvent}
              />
            )}

            {hasNoSearchResults && (
              <EmptyState
                title="Nenhum evento encontrado"
                description={`Nao encontramos eventos para "${search}". Tente pesquisar com outro termo.`}
              />
            )}

            {!hasNoEventsAtAll && !hasNoSearchResults && (
              <EventsTable
                events={filteredEvents}
                onView={setEventToView}
                onEdit={onEditEvent}
                onDelete={setEventToDelete}
              />
            )}
          </section>
        </main>
      </div>

      {eventToView && (
        <EventDetailModal event={eventToView} onClose={() => setEventToView(null)} />
      )}

      {eventToDelete && (
        <ConfirmDeleteModal
          eventName={eventToDelete.name}
          onCancel={() => setEventToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

export default EventosListagem;
