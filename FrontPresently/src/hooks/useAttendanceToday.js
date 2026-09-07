import { useCallback, useEffect, useRef, useState } from "react";
import { listTodayAttendance } from "../services/attendanceApi.js";

export function useAttendanceToday(participantId, { refreshMs = 6000 } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(participantId));
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);
  const signatureRef = useRef("");

  const load = useCallback(async (options = {}) => {
    const { silent = false } = options;

    if (!participantId) {
      setItems([]);
      setLoading(false);
      setError("");
      hasLoadedRef.current = false;
      signatureRef.current = "";
      return;
    }

    if (!silent && !hasLoadedRef.current) {
      setLoading(true);
      setError("");
    }

    try {
      const response = await listTodayAttendance(participantId);
      const nextItems = Array.isArray(response) ? response : [];
      const nextSignature = JSON.stringify(nextItems);

      if (nextSignature !== signatureRef.current) {
        setItems(nextItems);
        signatureRef.current = nextSignature;
      }

      setError("");
      hasLoadedRef.current = true;
    } catch {
      if (!silent || !hasLoadedRef.current) {
        setItems([]);
        setError("Não foi possível carregar o histórico de presença de hoje.");
      }
    } finally {
      if (!silent || !hasLoadedRef.current) {
        setLoading(false);
      }
    }
  }, [participantId]);

  useEffect(() => {
    if (!participantId) {
      return undefined;
    }

    const initialLoad = window.setTimeout(() => {
      void load({ silent: false });
    }, 0);

    const intervalId = window.setInterval(() => {
      void load({ silent: true });
    }, refreshMs);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(intervalId);
    };
  }, [load, participantId, refreshMs]);

  return {
    items,
    loading,
    error,
    refresh: load,
  };
}
