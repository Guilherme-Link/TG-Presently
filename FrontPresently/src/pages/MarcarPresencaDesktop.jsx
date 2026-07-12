import { useState } from "react";
import { MdCheck, MdAccessTime, MdClose } from "react-icons/md";
import Sidebar from "../components/DashboardComponents/Sidebar/Sidebar (1).jsx";
import "./MarcarPresencaDesktop.css";

const HISTORY = [
  {
    id: 1,
    status: "confirmed",
    title: "Engenharia de Software II – 19:00",
    detail: "Presença confirmada às 19:07",
  },
  {
    id: 2,
    status: "pending",
    title: "Engenharia de Software II – 19:50",
    detail: "Aguardando...",
  },
  {
    id: 3,
    status: "missing",
    title: "Engenharia de Software II – 20:50",
    detail: "Presença não informada",
  },
];

const STATUS_ICON = {
  confirmed: MdCheck,
  pending: MdAccessTime,
  missing: MdClose,
};

function ScanGlyph() {
  return (
    <svg
      className="mpd-generator__glyph"
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 26V16a10 10 0 0 1 10-10h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M94 6h10a10 10 0 0 1 10 10v10"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M114 94v10a10 10 0 0 1-10 10H94"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M26 114H16A10 10 0 0 1 6 104V94"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />

      <rect x="30" y="30" width="26" height="26" rx="8" fill="currentColor" />
      <rect x="64" y="30" width="26" height="26" rx="8" fill="currentColor" />
      <rect x="30" y="64" width="60" height="16" rx="8" fill="currentColor" />
      <circle cx="72" cy="90" r="6" fill="currentColor" />
      <circle cx="90" cy="90" r="6" fill="currentColor" />
    </svg>
  );
}

/**
 * MarcarPresencaDesktop
 * ------------------------------------------------------------------
 * Tela desktop de "Marcar Presença" no estado inicial: gerador de QR
 * Code aguardando ser acionado, painel "Aula atual" e histórico do dia.
 */
function MarcarPresencaDesktop({
  institution = "Fatec Indaiatuba",
  currentLesson = {
    time: "19:00",
    subject: "Engenharia de Software II",
    room: "Sala 01",
    professor: "Prof. Guilherme",
  },
  history = HISTORY,
  onGenerateQRCode,
  eventId = 1,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [qrError, setQrError] = useState("");

  const handleGenerateQRCode = async () => {
    if (typeof onGenerateQRCode === "function") {
      try {
        const result = onGenerateQRCode();
        if (result?.then) {
          await result;
        }
        return;
      } catch (error) {
        setQrError(error.message || "Não foi possível gerar o QR Code.");
        setIsModalOpen(true);
        return;
      }
    }

    setQrError("");
    setQrCodeData(null);
    setIsModalOpen(true);
    setIsLoadingQr(true);

    try {
      const apiBaseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8080";
      const credentials = window.btoa("admin:admin");
      const response = await fetch(`${apiBaseUrl}/api/v1/qrcode/${eventId}`, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (!response.ok) {
        throw new Error("Não foi possível gerar o QR Code no momento.");
      }

      const payload = await response.json();
      setQrCodeData(payload);
    } catch (error) {
      setQrError(error.message || "Erro inesperado ao gerar o QR Code.");
    } finally {
      setIsLoadingQr(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setQrCodeData(null);
    setQrError("");
  };

  return (
    <div className="mpd">
      <Sidebar institution={institution} />

      {isModalOpen && (
        <div
          className="mpd-modal__backdrop"
          role="presentation"
          onClick={closeModal}
        >
          <div
            className="mpd-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="mpd-modal__close"
              onClick={closeModal}
              aria-label="Fechar modal"
            >
              <MdClose size={18} />
            </button>

            <h2 id="qr-modal-title" className="mpd-modal__title">
              QR Code da aula
            </h2>
            <p className="mpd-modal__description">
              Mostre esse código para registrar a presença.
            </p>

            {isLoadingQr ? (
              <div className="mpd-modal__state">Gerando QR Code...</div>
            ) : qrError ? (
              <div className="mpd-modal__state mpd-modal__state--error">
                {qrError}
              </div>
            ) : qrCodeData?.imageData ? (
              <div className="mpd-modal__qr">
                <img
                  className="mpd-modal__image"
                  src={`data:image/png;base64,${qrCodeData.imageData}`}
                  alt="QR Code para presença"
                />
              </div>
            ) : (
              <div className="mpd-modal__state">
                Ainda não há um QR Code disponível.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mpd-content">
        <div className="mpd-content__header">
          <span className="mpd-breadcrumb">Início &gt; Marcar Presença</span>
          <h1 className="mpd-title">Marcar Presença</h1>
        </div>

        <main className="mpd-main">
          <section className="mpd-generator">
            <div className="mpd-generator__icon">
              <ScanGlyph />
            </div>
            <h2 className="mpd-generator__title">Gere e escaneie o QR Code</h2>
            <p className="mpd-generator__description">
              Clique no botão abaixo para gerar o QR Code e use seu celular para
              escaneá-lo, assim marcando sua presença
            </p>
            <button
              type="button"
              className="mpd-generator__button"
              onClick={handleGenerateQRCode}
              disabled={isLoadingQr}
            >
              <MdCheck size={18} />
              Gerar QR Code
            </button>
          </section>

          <aside className="mpd-side">
            <section className="mpd-current">
              <h3 className="mpd-side__title">Aula atual</h3>
              <div className="mpd-current__card">
                <span className="mpd-current__time">{currentLesson.time}</span>
                <div className="mpd-current__info">
                  <strong className="mpd-current__subject">
                    {currentLesson.subject}
                  </strong>
                  <span className="mpd-current__meta">
                    {currentLesson.room} &middot; {currentLesson.professor}
                  </span>
                </div>
              </div>
            </section>

            <section className="mpd-history">
              <h3 className="mpd-side__title">Histórico de presenças hoje</h3>
              <div className="mpd-history__list">
                {history.map((item) => {
                  const Icon = STATUS_ICON[item.status];
                  return (
                    <div key={item.id} className="mpd-history__item">
                      <span
                        className={`mpd-history__icon mpd-history__icon--${item.status}`}
                      >
                        <Icon size={15} />
                      </span>
                      <div className="mpd-history__info">
                        <strong className="mpd-history__title-text">
                          {item.title}
                        </strong>
                        <span className="mpd-history__detail">
                          {item.detail}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default MarcarPresencaDesktop;
