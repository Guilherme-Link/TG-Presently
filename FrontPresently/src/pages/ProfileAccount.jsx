import { useCallback, useEffect, useState } from "react";
import { MdDeleteOutline, MdFingerprint } from "react-icons/md";
import Sidebar from "../components/DashboardComponents/Sidebar/Sidebar (1).jsx";
import SidebarAdmin from "../components/DashboardComponents/Sidebar/SidebarAdmin.jsx";
import { adminSidebarSections } from "../data/dashboardDataAdmin";
import PageHeader from "../components/PageHeader/PageHeader.jsx";
import { apiFetch } from "../utils/api.js";
import { decodeCreationOptions, serializeCredential } from "../utils/webauthn.js";
import "../styles/pages/ProfileAccount.css";

function formatDate(value) {
  if (!value) return "Nunca utilizada";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function ProfileAccount() {
  const [isAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("presently_auth") ?? "null")?.roles?.includes("ROLE_ADMIN") ?? false;
    } catch {
      return false;
    }
  });
  const [credentials, setCredentials] = useState([]);
  const [profile, setProfile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passkeyMessage, setPasskeyMessage] = useState("");
  const [passkeyError, setPasskeyError] = useState("");

  const loadCredentials = useCallback(async () => {
    setLoading(true);
    setPasskeyError("");
    try {
      const result = await apiFetch("/security/v1/webauthn/credentials", { method: "GET" });
      setCredentials(Array.isArray(result) ? result : []);
    } catch (loadError) {
      setPasskeyError(loadError.message || "Não foi possível carregar suas passkeys.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCredentials();
    apiFetch("/security/v1/me", { method: "GET" })
      .then((user) => {
        setProfile(user);
      })
      .catch((loadError) => setProfileError(loadError.message || "Não foi possível carregar seu perfil."));
  }, [loadCredentials]);

  async function saveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage("");
    setProfileError("");
    try {
      const updated = await apiFetch("/security/v1/me/profile", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setProfile(updated);
      setCurrentPassword("");
      setNewPassword("");
      const cached = JSON.parse(localStorage.getItem("presently_auth") ?? "{}");
      localStorage.setItem("presently_auth", JSON.stringify({ ...cached, ...updated }));
      setProfileMessage("Senha alterada com sucesso.");
    } catch (saveError) {
      setProfileError(saveError.message || "Não foi possível atualizar seu perfil.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function registerPasskey() {
    setBusy(true);
    setPasskeyMessage("");
    setPasskeyError("");
    try {
      if (!window.PublicKeyCredential || !navigator.credentials?.create) {
        throw new Error("Este navegador não oferece suporte a passkeys.");
      }

      await apiFetch("/security/v1/csrf", { method: "GET" });
      const response = await apiFetch("/webauthn/register/options", { method: "POST" });
      const options = decodeCreationOptions(response.publicKey ?? response);
      const credential = await navigator.credentials.create({ publicKey: options });
      if (!credential) {
        throw new Error("O cadastro da passkey foi cancelado.");
      }

      await apiFetch("/webauthn/register", {
        method: "POST",
        body: JSON.stringify({
          publicKey: {
            credential: serializeCredential(credential),
            label: `Passkey ${new Date().toLocaleDateString("pt-BR")}`,
          },
        }),
      });
      setPasskeyMessage("Passkey cadastrada. Nos próximos acessos, ela será solicitada após a senha.");
      await loadCredentials();
    } catch (registerError) {
      setPasskeyError(registerError.message || "Não foi possível cadastrar a passkey.");
    } finally {
      setBusy(false);
    }
  }

  async function removePasskey(credential) {
    setBusy(true);
    setPasskeyMessage("");
    setPasskeyError("");
    try {
      await apiFetch("/security/v1/csrf", { method: "GET" });
      await apiFetch(`/webauthn/register/${encodeURIComponent(credential.id)}`, { method: "DELETE" });
      setPasskeyMessage("Passkey removida.");
      await loadCredentials();
    } catch (removeError) {
      setPasskeyError(removeError.message || "Não foi possível remover a passkey.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`security-account-page${isAdmin ? " security-account-page--admin" : ""}`}>
      {isAdmin ? <SidebarAdmin sections={adminSidebarSections} activeItem="configuracoes-link" /> : <Sidebar />}
      <main className="security-account">
        <PageHeader breadcrumb="Início › Perfil" title="Meu perfil" className="security-account__header" />
        <section className="security-account__card security-account__profile-card" aria-busy={savingProfile}>
          <div className="security-account__section-heading">
            <h2>Dados da conta</h2>
            <p>Consulte seus dados e altere sua senha.</p>
          </div>
          {profileMessage && <p className="security-account__message" role="status">{profileMessage}</p>}
          {profileError && <p className="security-account__error" role="alert">{profileError}</p>}
          <form className="security-account__profile-form" onSubmit={saveProfile}>
            <label className="security-account__field">
              <span>Nome</span>
              <input value={profile?.fullName ?? ""} placeholder="Nome não informado" readOnly />
              <small>O nome é gerenciado pelo cadastro do participante.</small>
            </label>
            <label className="security-account__field">
              <span>E-mail</span>
              <input type="email" value={profile?.email || profile?.username || ""} autoComplete="email" placeholder="E-mail não informado" readOnly />
            </label>
            <div className="security-account__password-fields">
              <label className="security-account__field">
                <span>Senha atual</span>
                <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" placeholder="Digite sua senha atual" required />
              </label>
              <label className="security-account__field">
                <span>Nova senha</span>
                <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={8} placeholder="Mínimo de 8 caracteres" required />
              </label>
            </div>
            <button type="submit" className="security-account__add" disabled={savingProfile}>
              {savingProfile ? "Alterando..." : "Alterar senha"}
            </button>
          </form>
        </section>

        <section className="security-account__card" aria-busy={loading || busy}>
          <div className="security-account__intro">
            <span className="security-account__icon" aria-hidden="true"><MdFingerprint size={25} /></span>
            <div>
              <h2>Autenticação adicional</h2>
              <p>Adicione uma verificação com biometria, PIN ou chave de segurança depois da senha.</p>
            </div>
          </div>

          {passkeyMessage && <p className="security-account__message" role="status">{passkeyMessage}</p>}
          {passkeyError && <p className="security-account__error" role="alert">{passkeyError}</p>}

          <div className="security-account__list">
            {loading ? <p>Carregando passkeys...</p> : credentials.length === 0 ? (
              <p>Nenhuma passkey cadastrada. Sem passkey, o login por senha continua funcionando como antes.</p>
            ) : credentials.map((credential) => (
              <article className="security-account__credential" key={credential.id}>
                <div>
                  <strong>{credential.label || "Passkey"}</strong>
                  <span>Cadastrada em {formatDate(credential.created)}</span>
                  <span>Último uso: {formatDate(credential.lastUsed)}</span>
                </div>
                <button type="button" className="security-account__remove" onClick={() => removePasskey(credential)} disabled={busy} aria-label={`Remover ${credential.label || "passkey"}`}>
                  <MdDeleteOutline size={19} />
                </button>
              </article>
            ))}
          </div>

          <button type="button" className="security-account__add" onClick={registerPasskey} disabled={busy || loading}>
            {busy ? "Processando..." : "Cadastrar passkey"}
          </button>
        </section>
      </main>
    </div>
  );
}
