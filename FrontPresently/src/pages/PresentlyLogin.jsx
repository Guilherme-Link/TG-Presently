import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import FotoFoda from "../assets/FotoFoda.png";
import { apiFetch, isFetchNetworkError } from "../utils/api.js";
import { decodeRequestOptions, serializeCredential } from "../utils/webauthn.js";
import "../styles/pages/PresentlyLogin.css";

const COPY = [
  {
    title: "Olá!",
    subtitle: "Bem-vindo ao presently :)",
  },
  {
    title: "Rápido.",
    subtitle: "Presença registrada em segundos, com QR Code.",
  },
  {
    title: "Confiável.",
    subtitle: "Dados de frequência sempre organizados e seguros.",
  },
];

function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="11" fill="#FFFFFF" />
      <path
        d="M13 9h9.5c4.7 0 8 3.3 8 7.7 0 4.4-3.3 7.6-8 7.6H18v6.2h-5V9zm5 4.4v6.6h4c2.2 0 3.6-1.3 3.6-3.3 0-2-1.4-3.3-3.6-3.3h-4z"
        fill="#FF0E18"
      />
    </svg>
  );
}

function Blobs() {
  return (
    <div className="pf-blobs" aria-hidden="true">
      <span className="pf-blob pf-blob--a" />
      <span className="pf-blob pf-blob--b" />
      <span className="pf-blob pf-blob--c" />
    </div>
  );
}

export default function PresencefyLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [slide, setSlide] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [mfaPendingUser, setMfaPendingUser] = useState(null);

  const navigate = useNavigate();

  function finishLogin(user) {
    localStorage.setItem(
      "presently_auth",
      JSON.stringify({ username: user.username, roles: user.roles })
    );

    navigate(user.roles.includes("ROLE_ADMIN") ? "/dashboardAdmin" : "/dashboard");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const loginResult = await apiFetch("/security/v1/login", {
        method: "POST",
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      if (loginResult?.mfaRequired) {
        setMfaPendingUser(loginResult.user);
        return;
      }

      finishLogin(loginResult);
    } catch (err) {
      if (err && typeof err === "object" && "status" in err) {
        if (err.status === 401 || err.status === 403) {
          setError({
            kind: "credentials",
            message: "Usuário ou senha incorretos.",
          });
          return;
        }

        if (err.status >= 500) {
          setError({
            kind: "server",
            message:
              "O servidor encontrou um problema. Tente novamente em instantes.",
          });
          return;
        }

        setError({
          kind: "generic",
          message: err.message || "Não foi possível realizar o login.",
        });
        return;
      }

      if (isFetchNetworkError(err)) {
        setError({
          kind: "network",
          message: navigator.onLine
            ? "Não foi possível conectar ao servidor. Verifique se o backend está ativo e se o endereço foi aberto corretamente no celular."
            : "Você está sem conexão com a internet.",
        });
        return;
      }

      setError({
        kind: "generic",
        message: err instanceof Error && err.message
          ? err.message
          : "Não foi possível realizar o login.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasskeyLogin() {
    setError(null);
    setSubmitting(true);

    try {
      if (!window.PublicKeyCredential || !navigator.credentials?.get) {
        throw new Error("Este navegador não oferece suporte a passkeys.");
      }

      await apiFetch("/security/v1/csrf", { method: "GET" });
      const optionsResponse = await apiFetch("/webauthn/authenticate/options", {
        method: "POST",
      });
      const options = decodeRequestOptions(optionsResponse.publicKey ?? optionsResponse);
      const credential = await navigator.credentials.get({ publicKey: options });
      if (!credential) {
        throw new Error("A verificação com passkey foi cancelada.");
      }

      await apiFetch("/login/webauthn", {
        method: "POST",
        body: JSON.stringify(serializeCredential(credential)),
      });
      const user = await apiFetch("/security/v1/me", { method: "GET" });
      finishLogin(user);
    } catch (err) {
      setError({
        kind: "credentials",
        message: err instanceof Error && err.message
          ? err.message
          : "Não foi possível validar a passkey. Tente novamente.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelMfa() {
    setSubmitting(true);
    try {
      await apiFetch("/security/v1/csrf", { method: "GET" });
      await apiFetch("/security/v1/mfa/cancel", { method: "POST" });
      setMfaPendingUser(null);
      setPassword("");
      setError(null);
    } catch (err) {
      setError({ kind: "generic", message: err.message || "Não foi possível cancelar a verificação." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pf-root">

      <div className="pf-stage">
        <section className="pf-hero">
          <Blobs />
          <div className="pf-brand">
            <Logo />
            <span>presently</span>
          </div>

          <div className="pf-art">
            <img src={FotoFoda} alt="" />
          </div>

          <div className="pf-hero-copy">
            <h1>{COPY[slide].title}</h1>
            <p>{COPY[slide].subtitle}</p>
          </div>

          <div className="pf-dots">
            {COPY.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                className={`pf-dot ${i === slide ? "is-active" : ""}`}
                onClick={() => setSlide(i)}
              />
            ))}
          </div>
        </section>

        <section className="pf-panel">
          <h2>Login</h2>

          {mfaPendingUser ? (
            <div className="pf-mfa" aria-live="polite">
              <p className="pf-mfa__title">Confirme sua identidade</p>
              <p className="pf-mfa__description">
                Use a passkey cadastrada na conta <strong>{mfaPendingUser.username}</strong> para concluir o login.
              </p>
              {error && (
                <div className={`pf-error pf-error--${error.kind}`} role="alert">
                  <AlertCircle size={18} className="pf-error__icon" />
                  <p className="pf-error__text">{error.message}</p>
                </div>
              )}
              <button className="pf-submit" type="button" onClick={handlePasskeyLogin} disabled={submitting}>
                {submitting ? "Aguardando passkey..." : "Continuar com passkey"}
                {!submitting && <ArrowRight size={18} />}
              </button>
              <button className="pf-mfa__cancel" type="button" onClick={handleCancelMfa} disabled={submitting}>
                Voltar ao login
              </button>
            </div>
          ) : (
          <form onSubmit={handleSubmit}>
            <div className="pf-field">
              <Mail size={18} className="pf-icon-left" />
              <input
                type="text"
                placeholder="Usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="pf-field">
              <Lock size={18} className="pf-icon-left" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pf-toggle-eye"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div
                className={`pf-error pf-error--${error.kind}`}
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle size={18} className="pf-error__icon" />
                <p className="pf-error__text">{error.message}</p>
              </div>
            )}

            <div className="pf-forgot">
              <a href="#forgot">Esqueci a senha</a>
            </div>

            <button className="pf-submit" type="submit" disabled={submitting}>
              {submitting ? "Entrando..." : "Login"}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>
          )}

          <div className="pf-divider" />
          <p className="pf-help">
            Não tem acesso? Fale com o seu <b>coordenador</b>
          </p>
        </section>
      </div>
    </div>
  );
}
