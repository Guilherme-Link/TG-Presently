import { MdArrowBackIosNew, MdCameraAlt, MdClose, MdRefresh } from "react-icons/md";
import { IoCheckmarkSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import PageHeader from "../components/PageHeader/PageHeader.jsx";
import { apiFetch } from "../utils/api.js";
import { decodeRequestOptions, serializeCredential } from "../utils/webauthn.js";
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
const QR_STABILITY_MS = 700;
const QR_MAX_FRAME_GAP_MS = 500;

function MarcarPresencaMobile({
  lesson = {
    subject: "Engenharia de Software II",
    day: "Quarta-feira",
    time: "19:00",
    room: "Ambiente 01",
  },
  onBack,
  onOpenCamera,
}) {
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
  const qrCandidateRef = useRef(null);
  const [scannerHint, setScannerHint] = useState("Posicione o QR Code dentro da moldura");

  const resolvedEventId = activeEvent?.id ?? null;
  const participantId = currentUser?.participantId ?? null;
  const resolvedLesson = activeEvent ?? lesson;

  const confirmPasskey = useCallback(async () => {
    if (!window.PublicKeyCredential || !navigator.credentials?.get) {
      throw new Error("Este dispositivo ou navegador não oferece suporte a passkeys.");
    }

    const credentials = await apiFetch("/security/v1/webauthn/credentials");
    if (!Array.isArray(credentials) || credentials.length === 0) {
      throw new Error("Adicione uma passkey ao seu perfil antes de registrar presença.");
    }

    await apiFetch("/security/v1/csrf");
    const optionsResponse = await apiFetch("/webauthn/authenticate/options", { method: "POST" });
    const options = decodeRequestOptions(optionsResponse.publicKey ?? optionsResponse);
    const credential = await navigator.credentials.get({ publicKey: options });
    if (!credential) {
      throw new Error("A confirmação biométrica foi cancelada.");
    }

    await apiFetch("/login/webauthn", {
      method: "POST",
      body: JSON.stringify(serializeCredential(credential)),
    });
  }, []);

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

    await confirmPasskey();

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

    if (!location) {
      throw new Error("Permita o acesso à localização para validar sua presença dentro do ambiente.");
    }

    const payload = {
      eventId: Number(resolvedEventId),
      participantId: Number(participantId),
      validationCode: normalizedCode,
      userLatitude: location.latitude,
      userLongitude: location.longitude,
    };

    try {
      await apiFetch("/api/v1/qrcode/validate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      if (error?.status === 412) {
        throw new Error("Ops... ocorreu um erro ao validar sua presença. Tente novamente.");
      }
      throw error;
    }

    // O endpoint só responde 2xx após validar o código e registrar a presença.
  }, [activeEventError, confirmPasskey, participantId, resolvedEventId]);

  useEffect(() => {
    if (!isScanning) return undefined;

    // setCameraError(null);
    const html5Qr = new Html5Qrcode(SCANNER_ELEMENT_ID);
    html5QrRef.current = html5Qr;

    // A região de leitura acompanha a moldura central exibida ao usuário.
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5Qr
      .start(
        { facingMode: "environment" }, // força a câmera traseira
        config,
        async (decodedText) => {
          if (scanHandledRef.current) {
            return;
          }

          const now = Date.now();
          const candidate = qrCandidateRef.current;
          if (
            !candidate ||
            candidate.text !== decodedText ||
            now - candidate.lastSeenAt > QR_MAX_FRAME_GAP_MS
          ) {
            qrCandidateRef.current = { text: decodedText, startedAt: now, lastSeenAt: now };
            setScannerHint("QR Code detectado. Mantenha-o parado na moldura...");
            return;
          }

          candidate.lastSeenAt = now;
          if (now - candidate.startedAt < QR_STABILITY_MS) {
            return;
          }

          scanHandledRef.current = true;
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
  const isResultScreen =
    attendanceState.status === "success" || attendanceState.status === "error";

  const handleOpenCamera = () => {
    setCameraError(null);
    setAttendanceState({
      status: "idle",
      message: "",
    });
    scanHandledRef.current = false;
    qrCandidateRef.current = null;
    setScannerHint("Posicione o QR Code dentro da moldura");
    setIsScanning(true);
    onOpenCamera?.();
  };

  const handleCloseScanner = () => {
    setIsScanning(false);
  };

  return (
    <div className="mp-mobile">
      <PageHeader breadcrumb="Início › Marcar Presença" title="Marcar Presença" onBack={handleBack} />

      {!isResultScreen && (
        <section className="mp-mobile__banner">
          <strong className="mp-mobile__subject">{resolvedLesson.subject}</strong>
          <span className="mp-mobile__meta">
            {resolvedLesson.day} &middot; {resolvedLesson.time} &middot; {resolvedLesson.room}
          </span>
        </section>
      )}

      <main className="mp-mobile__body">
        {isResultScreen ? (
          <section
            className={`mp-mobile__result mp-mobile__result--${attendanceState.status}`}
            aria-live="polite"
          >
            <div className="mp-mobile__result-event">
              <strong className="mp-mobile__subject">{resolvedLesson.subject}</strong>
              <span className="mp-mobile__meta">
                {resolvedLesson.day} &middot; {resolvedLesson.time} &middot; {resolvedLesson.room}
              </span>
            </div>
            <div className={`mp-mobile__result-mark mp-mobile__result-mark--${attendanceState.status}`} aria-hidden="true">
              {attendanceState.status === "success" ? (
                <IoCheckmarkSharp />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ strokeWidth: 3.5 }}>
                  <path
                    d="M4 4L20 20M20 4L4 20"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
            <h2 className="mp-mobile__result-title">
              {attendanceState.status === "success" ? "Presença confirmada!" : "Erro inesperado!"}
            </h2>
            <p className="mp-mobile__result-description mp-mobile__result-description--summary">
              {attendanceState.status === "success"
                ? "Volte e aproveite seu evento :)"
                : "Tente marcar sua presença novamente."}
            </p>
            {attendanceState.status === "error" && <p className="mp-mobile__result-description mp-mobile__result-description--detail">{attendanceState.message}</p>}
            <button
              type="button"
              className="mp-mobile__result-button"
              onClick={attendanceState.status === "success" ? () => navigate("/dashboard") : handleOpenCamera}
            >
              {attendanceState.status === "success" ? <MdArrowBackIosNew size={14} /> : <MdRefresh size={18} />}
              {attendanceState.status === "success" ? "Voltar" : "Tentar novamente"}
            </button>
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
            {scannerHint}
          </p>
        </div>
      )}
    </div>
  );
}

export default MarcarPresencaMobile;
