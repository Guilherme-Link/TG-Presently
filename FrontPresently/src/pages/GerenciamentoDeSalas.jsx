import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MdDeleteOutline,
  MdDesktopWindows,
  MdMenuBook,
  MdNotes,
  MdRefresh,
  MdRoom,
  MdMyLocation,
  MdZoomIn,
  MdZoomOut,
  MdClose,
} from "react-icons/md";
import "../styles/pages/GerenciamentoDeSalas.css";
import SidebarAdmin from "../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
import PageHeader from "../components/PageHeader/PageHeader.jsx";
import { adminSidebarSections } from "../data/dashboardDataAdmin";
import {
  createAmbient,
  deleteAmbient,
  listAmbients,
  updateAmbient,
} from "../services/ambientsApi.js";
import { isFetchNetworkError } from "../utils/api.js";

const MAX_MERCATOR_LATITUDE = 85.05112878;
const TILE_SIZE = 256;

function getGeoFencePoints(area) {
  const ring = area?.type === "Polygon" ? area.coordinates?.[0] : null;
  if (!Array.isArray(ring) || ring.length < 4) return [];
  const points = ring.slice(0, -1).filter((point) => Array.isArray(point) && point.length >= 2);
  return points.filter((point) => Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1])));
}

function createGeoFence(points) {
  const ring = points.map(([longitude, latitude]) => [longitude, latitude]);
  ring.push([...ring[0]]);
  return { type: "Polygon", coordinates: [ring] };
}

function toWorldPoint(latitude, longitude, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const clampedLatitude = Math.max(-MAX_MERCATOR_LATITUDE, Math.min(MAX_MERCATOR_LATITUDE, latitude));
  const sinLatitude = Math.sin(clampedLatitude * Math.PI / 180);
  return {
    x: (longitude + 180) / 360 * scale,
    y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale,
  };
}

function fromWorldPoint(x, y, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const longitude = x / scale * 360 - 180;
  const n = Math.PI - 2 * Math.PI * y / scale;
  const latitude = 180 / Math.PI * Math.atan(Math.sinh(n));
  return { latitude, longitude };
}

function pointsCenter(points) {
  if (!points.length) return null;
  return {
    latitude: points.reduce((sum, point) => sum + Number(point[1]), 0) / points.length,
    longitude: points.reduce((sum, point) => sum + Number(point[0]), 0) / points.length,
  };
}

function AmbientLocationPicker({ points, onChange }) {
  const mapRef = useRef(null);
  const dragRef = useRef(null);
  const [center, setCenter] = useState(() => pointsCenter(points));
  const hasInitialCenter = useRef(Boolean(pointsCenter(points)));
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(17);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    if (!mapRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    }));
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  const locateCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setMapError("Este navegador não permite obter a localização. Você ainda pode navegar pelo mapa.");
      setCenter((value) => value ?? { latitude: 0, longitude: 0 });
      return;
    }
    setMapError("Obtendo sua localização...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCenter({ latitude: coords.latitude, longitude: coords.longitude });
        setZoom(17);
        setMapError("");
      },
      () => {
        setMapError("Não foi possível obter sua localização. Arraste o mapa até a sala.");
        setCenter((value) => value ?? { latitude: 0, longitude: 0 });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    if (!hasInitialCenter.current) locateCurrentPosition();
  }, [locateCurrentPosition]);

  const mapLayout = useMemo(() => {
    if (!center || !size.width || !size.height) return { tiles: [], projectedPoints: [] };
    const worldCenter = toWorldPoint(center.latitude, center.longitude, zoom);
    const originX = worldCenter.x - size.width / 2;
    const originY = worldCenter.y - size.height / 2;
    const firstTileX = Math.floor(originX / TILE_SIZE);
    const lastTileX = Math.floor((originX + size.width) / TILE_SIZE);
    const firstTileY = Math.floor(originY / TILE_SIZE);
    const lastTileY = Math.floor((originY + size.height) / TILE_SIZE);
    const tileCount = 2 ** zoom;
    const tiles = [];

    for (let y = firstTileY; y <= lastTileY; y += 1) {
      if (y < 0 || y >= tileCount) continue;
      for (let x = firstTileX; x <= lastTileX; x += 1) {
        const wrappedX = ((x % tileCount) + tileCount) % tileCount;
        tiles.push({
          key: `${zoom}-${x}-${y}`,
          url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
          left: x * TILE_SIZE - originX,
          top: y * TILE_SIZE - originY,
        });
      }
    }

    const projectedPoints = points.map(([longitude, latitude]) => {
      const point = toWorldPoint(Number(latitude), Number(longitude), zoom);
      return { x: point.x - originX, y: point.y - originY };
    });
    return { tiles, projectedPoints };
  }, [center, points, size, zoom]);

  function handlePointerDown(event) {
    if (event.button !== 0 || !center || event.target.closest("button, a")) return;
    const worldCenter = toWorldPoint(center.latitude, center.longitude, zoom);
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, worldCenter, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 4) drag.moved = true;
    if (drag.moved) setCenter(fromWorldPoint(drag.worldCenter.x - deltaX, drag.worldCenter.y - deltaY, zoom));
  }

  function handlePointerUp(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.moved && mapRef.current) {
      const bounds = mapRef.current.getBoundingClientRect();
      const centerWorld = toWorldPoint(center.latitude, center.longitude, zoom);
      const worldX = centerWorld.x + event.clientX - bounds.left - bounds.width / 2;
      const worldY = centerWorld.y + event.clientY - bounds.top - bounds.height / 2;
      const point = fromWorldPoint(worldX, worldY, zoom);
      onChange([...points, [point.longitude, point.latitude]]);
    }
    dragRef.current = null;
  }

  const polygonPoints = mapLayout.projectedPoints.map(({ x, y }) => `${x},${y}`).join(" ");

  return (
    <div className="gds-map-picker">
      <div className="gds-map-picker__toolbar">
        <span className="gds-map-picker__hint">Arraste o mapa e clique para marcar cada vértice da área.</span>
        <div className="gds-map-picker__tools">
          <button type="button" onClick={locateCurrentPosition} aria-label="Centralizar na localização atual" title="Minha localização"><MdMyLocation size={17} /></button>
          <button type="button" onClick={() => setZoom((value) => Math.min(value + 1, 19))} aria-label="Aumentar zoom"><MdZoomIn size={19} /></button>
          <button type="button" onClick={() => setZoom((value) => Math.max(value - 1, 3))} aria-label="Diminuir zoom"><MdZoomOut size={19} /></button>
        </div>
      </div>
      <div ref={mapRef} className="gds-map" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={() => { dragRef.current = null; }}>
        {mapLayout.tiles.map((tile) => <img key={tile.key} className="gds-map__tile" src={tile.url} alt="" draggable="false" style={{ left: tile.left, top: tile.top }} />)}
        {mapLayout.projectedPoints.length > 2 && <svg className="gds-map__drawing" aria-hidden="true"><polygon points={polygonPoints} /></svg>}
        {mapLayout.projectedPoints.map((point, index) => <span key={`${index}-${points[index]?.join(",")}`} className="gds-map__point" style={{ left: point.x, top: point.y }} aria-hidden="true"><span>{index + 1}</span></span>)}
        {!center && <div className="gds-map__loading">Carregando localização do mapa...</div>}
        {mapError && <div className="gds-map__message" role="status">{mapError}</div>}
        <a className="gds-map__attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
      </div>
      <div className="gds-map-picker__points">
        <strong>{points.length} ponto(s) marcado(s)</strong>
        {points.length > 0 && <button type="button" className="gds-map-picker__clear" onClick={() => onChange([])}>Limpar área</button>}
        {points.length > 0 && <ol>{points.map(([longitude, latitude], index) => <li key={`${index}-${longitude}-${latitude}`}><span>Ponto {index + 1}: {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}</span><button type="button" onClick={() => onChange(points.filter((_, pointIndex) => pointIndex !== index))} aria-label={`Remover ponto ${index + 1}`}><MdClose size={15} /></button></li>)}</ol>}
      </div>
    </div>
  );
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
  const [areaPoints, setAreaPoints] = useState(() => getGeoFencePoints(ambient?.area));
  const [geoEnabled, setGeoEnabled] = useState(() => ambient ? Boolean(ambient.area) : true);
  const [areaChanged, setAreaChanged] = useState(false);
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

    if (geoEnabled && (!ambient?.area || areaChanged) && areaPoints.length < 3) {
      setFeedback({ kind: "error", message: "Marque pelo menos três pontos no mapa para delimitar a área da sala." });
      return;
    }

    payload.area = !geoEnabled
      ? null
      : areaChanged ? createGeoFence(areaPoints) : ambient?.area ?? null;

    setFeedback(null);
    await onSubmit(payload, {
      resetForm: () => {
        setName("");
        setDescription("");
        setAreaPoints([]);
        setGeoEnabled(false);
        setAreaChanged(false);
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

        <div className="gds-location-field">
          <div className="gds-geo-toggle-card">
            <div className="gds-geo-toggle-row">
              <span className="gds-geo-toggle-row__label">Exigir localização para registrar presença nesta sala</span>
              <button type="button" className={`gds-geo-switch${geoEnabled ? " gds-geo-switch--on" : ""}`} role="switch" aria-checked={geoEnabled} aria-label="Exigir localização para registrar presença nesta sala" onClick={() => setGeoEnabled((enabled) => !enabled)} disabled={loading || saving}>
                <span className="gds-geo-switch__thumb" />
              </button>
              <span className="gds-geo-toggle-row__state">{geoEnabled ? "Ligado" : "Desligado"}</span>
            </div>
          </div>
          {geoEnabled && <>
            <span className="gds-field-label">Área geográfica da sala</span>
            <p className="gds-location-field__help">O mapa parte da sua localização atual. Arraste para navegar até outro local e marque pelo menos três pontos para fechar a área permitida para registrar presença.</p>
            <AmbientLocationPicker points={areaPoints} onChange={(points) => { setAreaPoints(points); setAreaChanged(true); }} />
            {!areaChanged && ambient?.area && <p className="gds-location-field__saved" role="status">A área cadastrada será mantida. Marque novos pontos para substituí-la.</p>}
          </>}
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
                setAreaPoints([]);
                setGeoEnabled(false);
                setAreaChanged(false);
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
        <PageHeader breadcrumb="Início › Salas" title="Salas" className="gds-header" breadcrumbClassName="gds-breadcrumb" titleClassName="gds-title" />

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
