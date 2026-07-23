import { useState } from "react";
import {
  MdDesktopWindows,
  MdMenuBook,
  MdDeleteOutline,
} from "react-icons/md";
import "./GerenciamentoDeSalas.css";
import SidebarAdmin from "../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
import { adminSidebarSections } from "../data/dashboardDataAdmin";



const ROOMS = [
  { id: 1, name: "Lab 10", floor: "Terreo", capacity: 40, type: "lab" },
  { id: 2, name: "Sala 06", floor: "Terreo", capacity: 40, type: "sala" },
  { id: 3, name: "Lab 11", floor: "Terreo", capacity: 40, type: "lab" },
  { id: 4, name: "Sala 07", floor: "Terreo", capacity: 40, type: "sala" },
  { id: 5, name: "Lab 12", floor: "Terreo", capacity: 40, type: "lab" },
  { id: 6, name: "Sala 08", floor: "Terreo", capacity: 40, type: "sala" },
];


function CreateRoomCard({ onCreate, onCancel }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [block, setBlock] = useState("");
  const [capacity, setCapacity] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onCreate?.({ name, code, block, capacity });
  }

  function handleCancel() {
    setName("");
    setCode("");
    setBlock("");
    setCapacity("");
    onCancel?.();
  }

  return (
    <section className="gds-create">
      <h2 className="gds-create__title">Criar nova sala</h2>

      <form onSubmit={handleSubmit}>
        <label className="gds-field-label" htmlFor="room-name">
          Nome da sala
        </label>
        <input
          id="room-name"
          type="text"
          className="gds-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="gds-field-label" htmlFor="room-code">
          Código
        </label>
        <input
          id="room-code"
          type="text"
          className="gds-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <label className="gds-field-label" htmlFor="room-block">
          Bloco
        </label>
        <input
          id="room-block"
          type="text"
          className="gds-input"
          value={block}
          onChange={(e) => setBlock(e.target.value)}
        />

        <label className="gds-field-label" htmlFor="room-capacity">
          Capacidade
        </label>
        <input
          id="room-capacity"
          type="number"
          className="gds-input"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />

        <div className="gds-create__actions">
          <button type="submit" className="gds-btn gds-btn--primary">
            Criar sala
          </button>
          <button type="button" className="gds-btn gds-btn--outline" onClick={handleCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

function RoomCard({ room, onDelete }) {
  const Icon = room.type === "lab" ? MdDesktopWindows : MdMenuBook;

  return (
    <div className="gds-room-card">
      <span className="gds-room-card__icon">
        <Icon size={26} />
      </span>

      <div className="gds-room-card__info">
        <strong className="gds-room-card__name">{room.name}</strong>
        <span className="gds-room-card__meta">
          {room.floor} - {room.capacity} Alunos
        </span>
      </div>

      <button type="button" className="gds-btn gds-btn--outline gds-btn--small" onClick={() => onDelete?.(room.id)}>
        <MdDeleteOutline size={15} />
        Excluir
      </button>
    </div>
  );
}

function RoomListCard({ rooms, onDelete }) {
  return (
    <section className="gds-list">
      <h2 className="gds-list__title">Salas cadastradas</h2>

      <div className="gds-list__grid">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} onDelete={onDelete} />
        ))}
      </div>

      <span className="gds-list__count">{rooms.length} salas cadastradas</span>
    </section>
  );
}

/**
 * GerenciamentoDeSalas
 * ------------------------------------------------------------------
 * Tela administrativa de gerenciamento de salas: cadastro de uma nova
 * sala/laboratório e listagem em grade das salas já cadastradas.
 */
function GerenciamentoDeSalas({ rooms = ROOMS, institution = "Fatec Indaiatuba" }) {
  const [roomList, setRoomList] = useState(rooms);
  /* eslint-disable no-unused-vars */
  const [activeItem, setActiveItem] = useState("salas-link");
  

  function handleCreate(newRoom) {
    if (!newRoom.name.trim()) return;
    setRoomList((current) => [
      ...current,
      {
        id: Date.now(),
        name: newRoom.name,
        floor: newRoom.block || "Terreo",
        capacity: Number(newRoom.capacity) || 0,
        type: newRoom.name.toLowerCase().startsWith("lab") ? "lab" : "sala",
      },
    ]);
  }

  function handleDelete(id) {
    setRoomList((current) => current.filter((room) => room.id !== id));
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
          <CreateRoomCard onCreate={handleCreate} />
          <RoomListCard rooms={roomList} onDelete={handleDelete} />
        </main>
      </div>
    </div>
  );
}

export default GerenciamentoDeSalas;
