import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MdFingerprint } from "react-icons/md";
import Button from "./Button/Button.jsx";
import Modal from "./Modal/Modal.jsx";
import { apiFetch } from "../utils/api.js";
import "../styles/components/PasskeyReminder.css";

export default function PasskeyReminder() {
  const location = useLocation();
  const navigate = useNavigate();
  const checkedRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === "/login") {
      checkedRef.current = false;
      setIsOpen(false);
      return undefined;
    }

    if (checkedRef.current) return undefined;
    checkedRef.current = true;
    let cancelled = false;

    apiFetch("/security/v1/webauthn/credentials", { method: "GET" })
      .then((credentials) => {
        if (!cancelled && Array.isArray(credentials) && credentials.length === 0) {
          setIsOpen(true);
        }
      })
      .catch(() => {
        // Falhas ao consultar as credenciais não impedem o acesso ao restante do sistema.
      });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (!isOpen) return null;

  return (
    <Modal title="Cadastre sua digital" onClose={() => setIsOpen(false)} width={440}>
      <div className="passkey-reminder">
        <span className="passkey-reminder__icon" aria-hidden="true">
          <MdFingerprint size={28} />
        </span>
        <p>
          Para registrar presença com segurança, é necessário cadastrar uma digital ou outra passkey no seu perfil.
        </p>
        <div className="passkey-reminder__actions">
          <Button
            variant="primary"
            onClick={() => {
              setIsOpen(false);
              navigate("/perfil");
            }}
          >
            Ir para Perfil
          </Button>
        </div>
      </div>
    </Modal>
  );
}
