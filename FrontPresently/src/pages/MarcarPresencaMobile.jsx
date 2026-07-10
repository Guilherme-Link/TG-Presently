import { MdArrowBackIosNew, MdCameraAlt } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./MarcarPresencaMobile.css";

function QRViewfinderGlyph() {
  return (
    <svg
      className="mp-mobile__glyph"
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="120" height="120" rx="10" fill="#F4F1F0" />
      <rect x="10" y="10" width="46" height="46" rx="6" fill="#D62E2E" />
      <rect x="64" y="10" width="20" height="20" rx="4" fill="#E3DEDD" />
      <rect x="90" y="10" width="20" height="20" rx="4" fill="#E3DEDD" />
      <rect x="64" y="36" width="20" height="20" rx="4" fill="#D62E2E" />
      <rect x="10" y="64" width="20" height="20" rx="4" fill="#E3DEDD" />
      <rect x="36" y="64" width="20" height="20" rx="4" fill="#E3DEDD" />
      <rect x="64" y="64" width="46" height="46" rx="6" fill="#D62E2E" />
      <rect x="10" y="90" width="20" height="20" rx="4" fill="#E3DEDD" />
      <rect x="4" y="4" width="12" height="12" rx="3" fill="#fff" />
    </svg>
  );
}

/**
 * MarcarPresencaMobile
 * ------------------------------------------------------------------
 * Tela mobile de "Marcar Presença" no estado inicial: aguardando o
 * aluno abrir a câmera para escanear o QR Code da aula.
 */
function MarcarPresencaMobile({
  lesson = {
    subject: "Engenharia de Software II",
    day: "Quarta-feira",
    time: "19:00",
    room: "Sala 01",
  },
  onBack,
  onOpenCamera,
}) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));
  const handleOpenCamera = onOpenCamera ?? (() => {});

  return (
    <div className="mp-mobile">
      <header className="mp-mobile__topbar">
        <button
          type="button"
          className="mp-mobile__back"
          onClick={handleBack}
          aria-label="Voltar"
        >
          <MdArrowBackIosNew size={15} />
        </button>
        <span className="mp-mobile__topbar-title">Marcar Presença</span>
      </header>

      <section className="mp-mobile__banner">
        <strong className="mp-mobile__subject">{lesson.subject}</strong>
        <span className="mp-mobile__meta">
          {lesson.day} &middot; {lesson.time} &middot; {lesson.room}
        </span>
      </section>

      <main className="mp-mobile__body">
        <p className="mp-mobile__instruction">Aponte a câmera para o QR Code</p>

        <div className="mp-mobile__frame">
          <QRViewfinderGlyph />
        </div>

        <h2 className="mp-mobile__status-title">Aguardando o escaneamento</h2>
        <p className="mp-mobile__status-description">
          Seu dispositivo precisa estar
          <br />
          com a câmera autorizada
        </p>

        <button
          type="button"
          className="mp-mobile__button"
          onClick={handleOpenCamera}
        >
          <MdCameraAlt size={18} />
          Abrir câmera
        </button>
      </main>
    </div>
  );
}

export default MarcarPresencaMobile;
