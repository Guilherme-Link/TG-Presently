import { MdArrowBackIosNew, MdCameraAlt, MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
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

const SCANNER_ELEMENT_ID = "reader";

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
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const html5QrRef = useRef(null);

  useEffect(() => {
    if (!isScanning) return undefined;

    // setCameraError(null);
    const html5Qr = new Html5Qrcode(SCANNER_ELEMENT_ID);
    html5QrRef.current = html5Qr;

    // Sem qrbox: a área decodificada é o frame inteiro.
    // A moldura visual vermelha é só CSS, desenhada por cima.
    const config = { fps: 10 };

    html5Qr
      .start(
        { facingMode: "environment" }, // força a câmera traseira
        config,
        (decodedText) => {
          setScanResult(decodedText);
          setIsScanning(false); // dispara o cleanup abaixo, que já para a câmera
        },
        () => {
          // erro de frame sem QR (chamado a cada frame sem leitura) — ignorar
        }
      )
      .catch((err) => {
        console.error("Erro ao iniciar câmera:", err);
        setCameraError(
          "Não foi possível acessar a câmera. Verifique as permissões do navegador."
        );
        setIsScanning(false);
      });

    return () => {
      const instance = html5QrRef.current;
      if (instance && instance.isScanning) {
        instance
          .stop()
          .then(() => instance.clear())
          .catch(() => {});
      }
      html5QrRef.current = null;
    };
  }, [isScanning]);

  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  const handleOpenCamera = () => {
    setScanResult(null);
    setIsScanning(true);
    onOpenCamera?.();
  };

  const handleCloseScanner = () => {
    setIsScanning(false);
  };

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
        {scanResult ? (
          <>
            <h2 className="mp-mobile__status-title">Presença confirmada!</h2>
            <p className="mp-mobile__status-description">{scanResult}</p>
          </>
        ) : (
          <>
            <p className="mp-mobile__instruction">
              Aponte a câmera para o QR Code
            </p>

            <div className="mp-mobile__frame">
              <QRViewfinderGlyph />
            </div>

            <h2 className="mp-mobile__status-title">
              Aguardando o escaneamento
            </h2>
            <p className="mp-mobile__status-description">
              Seu dispositivo precisa estar
              <br />
              com a câmera autorizada
            </p>

            {cameraError && (
              <p className="mp-mobile__error">{cameraError}</p>
            )}

            <button
              type="button"
              className="mp-mobile__button"
              onClick={handleOpenCamera}
            >
              <MdCameraAlt size={18} />
              Abrir câmera
            </button>
          </>
        )}
      </main>

      {isScanning && (
        <div className="mp-mobile__scanner-overlay">
          <button
            type="button"
            className="mp-mobile__scanner-close"
            onClick={handleCloseScanner}
            aria-label="Fechar câmera"
          >
            <MdClose size={22} />
          </button>

          <div id={SCANNER_ELEMENT_ID} className="mp-mobile__scanner-video" />

          <div className="mp-mobile__scanner-frame" aria-hidden="true">
            <span className="mp-mobile__scanner-corner mp-mobile__scanner-corner--tl" />
            <span className="mp-mobile__scanner-corner mp-mobile__scanner-corner--tr" />
            <span className="mp-mobile__scanner-corner mp-mobile__scanner-corner--bl" />
            <span className="mp-mobile__scanner-corner mp-mobile__scanner-corner--br" />
          </div>

          <p className="mp-mobile__scanner-hint">
            Posicione o QR Code dentro da moldura
          </p>
        </div>
      )}
    </div>
  );
}

export default MarcarPresencaMobile;