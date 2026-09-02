import { useEffect, useMemo, useState } from "react";
import { MdArrowBackIosNew, MdCheck, MdAccessTime, MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/DashboardComponents/Sidebar/Sidebar (1).jsx";
import { useAttendanceToday } from "../hooks/useAttendanceToday.js";
import { useCurrentActiveStudentEvent } from "../hooks/useCurrentActiveStudentEvent.js";
import { apiFetch } from "../utils/api.js";
import "../styles/pages/MarcarPresencaDesktop.css";

const STATUS_ICON = {
  confirmed: MdCheck,
  pending: MdAccessTime,
  missing: MdClose,
};

function getStatusLabel(status) {
  if (status === "confirmed") {
    return "Presença confirmada";
  }

  if (status === "pending") {
    return "Aguardando";
  }

  return "Falta";
}

function MarcarPresencaDesktop({ institution = "Fatec Indaiatuba" }) {
  const navigate = useNavigate();
  const {
    activeEvent,
    currentUser,
    loading: loadingActiveEvent,
    error: activeEventError,
  } = useCurrentActiveStudentEvent();
  const participantId = currentUser?.participantId ?? null;
  const resolvedEventId = activeEvent?.id ?? null;

  const {
    items: attendanceItems,
    loading: loadingAttendance,
    error: attendanceError,
    refresh: refreshAttendance,
  } = useAttendanceToday(participantId);

  const currentAttendanceItem = useMemo(
    () =>
      attendanceItems.find((item) => String(item.eventId) === String(resolvedEventId)) ??
      null,
    [attendanceItems, resolvedEventId]
  );

  const isCurrentEventConfirmed = currentAttendanceItem?.status === "confirmed";
  const shouldShowQr = Boolean(resolvedEventId && !isCurrentEventConfirmed);

  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadQrCode() {
      if (!resolvedEventId || isCurrentEventConfirmed) {
        setQrCodeData(null);
        setQrError("");
        setQrLoading(false);
        return;
      }

      setQrLoading(true);
      setQrError("");

      try {
        const payload = await apiFetch(`/api/v1/qrcode/${resolvedEventId}`, {
          method: "GET",
        });

        if (!cancelled) {
          setQrCodeData(payload);
        }
      } catch (error) {
        if (!cancelled) {
          setQrError(
            error instanceof Error && error.message
              ? error.message
              : "Erro inesperado ao gerar o QR Code."
          );
        }
      } finally {
        if (!cancelled) {
          setQrLoading(false);
        }
      }
    }

    void loadQrCode();

    return () => {
      cancelled = true;
    };
  }, [isCurrentEventConfirmed, resolvedEventId]);

  useEffect(() => {
    if (!resolvedEventId) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      void refreshAttendance();
    }, 6000);

    return () => {
      window.clearInterval(timer);
    };
  }, [refreshAttendance, resolvedEventId]);

  const currentLesson = activeEvent;
  const currentTitle = currentLesson?.subject ?? "Nenhum evento ativo";
  const currentTime = currentLesson?.time ?? "—";
  const currentRoom = currentLesson?.room ?? "Sala não informada";
  const currentProfessor = currentLesson?.professor ?? "Responsável não informado";

  return (
    <div className="mpd">
      <Sidebar institution={institution} />

      <div className="mpd-content">
        <div className="mpd-content__header">
          <span className="mpd-breadcrumb">Início &gt; Marcar Presença</span>
          <h1 className="mpd-title">Marcar Presença</h1>
        </div>

        <main className="mpd-main">
          <section
            className={`mpd-generator ${
              isCurrentEventConfirmed
                ? "mpd-generator--success"
                : shouldShowQr
                  ? "mpd-generator--qr"
                  : "mpd-generator--empty"
            }`}
          >
            {loadingActiveEvent || loadingAttendance ? (
              <div className="mpd-generator__state">Carregando evento atual...</div>
            ) : activeEventError ? (
              <div className="mpd-generator__state mpd-generator__state--error">
                {activeEventError}
              </div>
            ) : attendanceError ? (
              <div className="mpd-generator__state mpd-generator__state--error">
                {attendanceError}
              </div>
            ) : !resolvedEventId ? (
              <div className="mpd-generator__state">
                Nenhum evento ativo está disponível para marcar presença.
              </div>
            ) : isCurrentEventConfirmed ? (
              <div className="mpd-success">
                <div className="mpd-success__circle" aria-hidden="true">
                  <MdCheck size={122} />
                </div>
                <h2 className="mpd-success__title">Presença confirmada!</h2>
                <p className="mpd-success__text">Volte e aproveite sua aula :)</p>
                <button
                  type="button"
                  className="mpd-success__back"
                  onClick={() => navigate(-1)}
                >
                  <MdArrowBackIosNew size={16} />
                  Voltar
                </button>
              </div>
            ) : (
              <div className="mpd-qr">
                <div className="mpd-qr__header">
                  <strong>{currentTitle}</strong>
                  <span>
                    {currentTime} &middot; {currentRoom}
                  </span>
                  <small>{currentProfessor}</small>
                </div>

                <div className="mpd-qr__card">
                  {qrLoading ? (
                    <div className="mpd-generator__state">Gerando QR Code...</div>
                  ) : qrError ? (
                    <div className="mpd-generator__state mpd-generator__state--error">
                      {qrError}
                    </div>
                  ) : qrCodeData?.imageData ? (
                    <img
                      className="mpd-qr__image"
                      src={`data:image/png;base64,${qrCodeData.imageData}`}
                      alt="QR Code para presença"
                    />
                  ) : (
                    <div className="mpd-generator__state">
                      Ainda não há um QR Code disponível.
                    </div>
                  )}
                </div>

                <p className="mpd-qr__hint">
                  Mostre esse código para registrar a presença da aula atual.
                </p>
              </div>
            )}
          </section>

          <aside className="mpd-side">
            <section className="mpd-current">
              <h3 className="mpd-side__title">Aula atual</h3>
              {currentLesson ? (
                <div className="mpd-current__card">
                  <span className="mpd-current__time">{currentTime}</span>
                  <div className="mpd-current__info">
                    <strong className="mpd-current__subject">{currentTitle}</strong>
                    <span className="mpd-current__meta">
                      {currentRoom} &middot; {currentProfessor}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mpd-current__card mpd-current__card--empty">
                  Nenhum evento está ativo agora para este participante.
                </div>
              )}
            </section>

            <section className="mpd-history">
              <h3 className="mpd-side__title">Histórico de presenças hoje</h3>
              <div className="mpd-history__list">
                {attendanceItems.length === 0 ? (
                  <div className="mpd-history__empty">
                    Nenhum evento encontrado para hoje.
                  </div>
                ) : (
                  attendanceItems.map((item) => {
                    const Icon = STATUS_ICON[item.status] ?? MdAccessTime;

                    return (
                      <div key={item.eventId} className="mpd-history__item">
                        <span
                          className={`mpd-history__icon mpd-history__icon--${item.status}`}
                        >
                          <Icon size={15} />
                        </span>
                        <div className="mpd-history__info">
                          <strong className="mpd-history__title-text">
                            {item.title} - {item.time?.split(" - ")[0] ?? "—"}
                          </strong>
                          <span className="mpd-history__detail">{item.detail}</span>
                          <small className="mpd-history__status">
                            {getStatusLabel(item.status)}
                          </small>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default MarcarPresencaDesktop;
