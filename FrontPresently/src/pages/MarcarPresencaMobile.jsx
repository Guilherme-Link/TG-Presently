import { MdArrowBackIosNew, MdCameraAlt, MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../utils/api.js";
import { useCurrentActiveStudentEvent } from "../hooks/useCurrentActiveStudentEvent.js";
import "../styles/pages/MarcarPresencaMobile.css";

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

function formatLocalDateTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ].join("T");
}

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
  const [attendanceState, setAttendanceState] = useState({
    status: "idle",
    message: "",
  });

  const {
    activeEvent,
    currentUser,
    loading: loadingActiveEvent,
    error: activeEventError,
  } = useCurrentActiveStudentEvent();
  const html5QrRef = useRef(null);
  const scanHandledRef = useRef(false);

  const resolvedEventId = activeEvent?.id ?? null;
  const participantId = currentUser?.participantId ?? null;
  const resolvedLesson = activeEvent ?? lesson;

  const validateAttendance = useCallback(async (decodedText) => {
    if (!resolvedEventId) {
      throw new Error(
        activeEventError || "Não existe um evento ativo para marcar presença agora."
      );
    }

    if (!participantId) {
      throw new Error("Não foi possível identificar o participante logado.");
    }

    const normalizedCode = String(decodedText ?? "").trim();

    if (!normalizedCode) {
      throw new Error("QR Code inválido.");
    }

    const location = await new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });

    const payload = {
      eventId: Number(resolvedEventId),
      participantId: Number(participantId),
      validationCode: normalizedCode,
      validationTimestamp: formatLocalDateTime(new Date()),
      userLatitude: location?.latitude ?? 0,
      userLongitude: location?.longitude ?? 0,
    };

    const response = await apiFetch("/api/v1/qrcode/validate", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response;
  }, [activeEventError, participantId, resolvedEventId]);

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
        async (decodedText) => {
          if (scanHandledRef.current) {
            return;
          }

          scanHandledRef.current = true;
          setScanResult(decodedText);
          setCameraError(null);
          setAttendanceState({
            status: "validating",
            message: "Validando presença...",
          });
          setIsScanning(false); // dispara o cleanup abaixo, que já para a câmera

          try {
            await validateAttendance(decodedText);
            setAttendanceState({
              status: "success",
              message: "Sua presença foi registrada no sistema com sucesso.",
            });
          } catch (error) {
            setAttendanceState({
              status: "error",
              message:
                error instanceof Error && error.message
                  ? error.message
                  : "Não foi possível marcar a presença.",
            });
          }
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
  }, [isScanning, validateAttendance]);

  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  const handleOpenCamera = () => {
    setScanResult(null);
    setCameraError(null);
    setAttendanceState({
      status: "idle",
      message: "",
    });
    scanHandledRef.current = false;
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
        <strong className="mp-mobile__subject">{resolvedLesson.subject}</strong>
        <span className="mp-mobile__meta">
          {resolvedLesson.day} &middot; {resolvedLesson.time} &middot; {resolvedLesson.room}
        </span>
      </section>

      <main className="mp-mobile__body">
        {attendanceState.status === "success" ? (
          <section className="mp-mobile__success" aria-live="polite">
            <div className="mp-mobile__success-mark" aria-hidden="true">
              ✓
            </div>
            <h2 className="mp-mobile__status-title">Presença confirmada</h2>
            <p className="mp-mobile__status-description">
              {attendanceState.message}
            </p>
            <div className="mp-mobile__success-summary">
              <strong>{resolvedLesson.subject}</strong>
              <span>
                {resolvedLesson.day} &middot; {resolvedLesson.time} &middot; {resolvedLesson.room}
              </span>
              {scanResult ? (
                <small>Código validado: {scanResult}</small>
              ) : null}
            </div>
          </section>
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
              {attendanceState.status === "validating"
                ? attendanceState.message
                : "Seu dispositivo precisa estar"}
              <br />
              {attendanceState.status === "validating"
                ? "Processando a marcação..."
                : "com a câmera autorizada"}
            </p>

            {loadingActiveEvent ? (
              <p className="mp-mobile__error">Carregando evento atual...</p>
            ) : activeEventError ? (
              <p className="mp-mobile__error">{activeEventError}</p>
            ) : null}

            {cameraError && (
              <p className="mp-mobile__error">{cameraError}</p>
            )}

            {attendanceState.status === "error" && (
              <p className="mp-mobile__error">{attendanceState.message}</p>
            )}

            <button
              type="button"
              className="mp-mobile__button"
              onClick={handleOpenCamera}
              disabled={
                isScanning ||
                loadingActiveEvent ||
                !resolvedEventId ||
                !participantId
              }
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
