import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import FotoFoda from "../assets/FotoFoda.png";

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

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    window.setTimeout(() => setSubmitting(false), 1200);
  }

  return (
    <div className="pf-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,300;0,500;0,600;0,700;1,300&display=swap');

        html, body, #root {
          margin: 0;
          min-height: 100%;
          background: var(--mist);
        }

        .pf-root {
          --red: #FF0E18;
          --red-dark: #7B1F10;
          --black: #000000;
          --green: #288200;
          --white: #FFFFFF;
          --mist: #F4F1F0;
          font-family: 'Poppins', sans-serif;
          width: 100%;
          min-height: 100vh;
          box-sizing: border-box;
          background: var(--mist);
          display: flex;
          justify-content: center;
          align-items: stretch;
          padding: 0;
        }
        .pf-root *, .pf-root *::before, .pf-root *::after { box-sizing: border-box; }

        .pf-stage {
          width: 100%;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr;
          background: var(--white);
        }
        @media (min-width: 880px) {
          .pf-stage {
            grid-template-columns: 1.05fr 1fr;
            min-height: 100vh;
            max-height: none;
            margin: 0;
            border-radius: 0;
            box-shadow: none;
          }
        }

        /* ---------- Hero / red panel ---------- */
        .pf-hero {
          position: relative;
          background: linear-gradient(155deg, var(--red) 0%, var(--red) 55%, var(--red-dark) 130%);
          color: var(--white);
          overflow: hidden;
          padding: 32px 32px 44px;
          display: flex;
          flex-direction: column;
          min-height: 300px;
        }
        @media (min-width: 880px) {
          .pf-hero {
            padding: 48px 52px;
            min-height: unset;
            justify-content: space-between;
          }
        }

        .pf-blobs { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .pf-blob {
          position: absolute;
          border-radius: 999px;
          opacity: 0.55;
          filter: blur(0.3px);
          animation: pf-drift 9s ease-in-out infinite;
        }
        .pf-blob--a { width: 210px; height: 70px; background: var(--red-dark); top: -20px; right: -60px; opacity: 0.65; transform: rotate(-18deg); animation-delay: 0s; }
        .pf-blob--b { width: 260px; height: 90px; background: #ff6b62; top: 8px; right: -110px; opacity: 0.55; transform: rotate(-14deg); animation-delay: 1.2s; }
        .pf-blob--c { width: 150px; height: 50px; background: var(--red-dark); top: 46px; right: 10px; opacity: 0.5; transform: rotate(-20deg); animation-delay: 2.4s; }

        @keyframes pf-drift {
          0%, 100% { transform: translate(0,0) rotate(-18deg); }
          50% { transform: translate(-6px, 6px) rotate(-14deg); }
        }

        .pf-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 2;
          animation: pf-rise 0.6s ease both;
        }
        .pf-brand span {
          font-weight: 600;
          font-size: 18px;
          letter-spacing: 0.2px;
        }

        .pf-art {
          display: flex;
          width: 100%;
          height: 100%;
          justify-content: center;
          align-items: center;
          margin: 18px 0 0;
        }

        .pf-art img {
          display: flex;
          width: min(400px, 70%);
          align-items: center;
          justify-content: center;
          max-width: 400px;
        }


        .pf-hero-copy {
          position: relative;
          z-index: 2;
          margin-top: auto;
        }
        .pf-hero-copy h1 {
          font-weight: 700;
          font-size: clamp(34px, 6vw, 46px);
          line-height: 1;
          margin: 18px 0 6px;
          animation: pf-rise 0.7s 0.05s ease both;
        }
        .pf-hero-copy p {
          font-weight: 300;
          font-size: 15px;
          margin: 0;
          opacity: 0.92;
          animation: pf-rise 0.7s 0.15s ease both;
        }

        .pf-dots {
          display: none;
          gap: 8px;
          margin-top: 26px;
          position: relative;
          z-index: 2;
        }
        @media (min-width: 880px) { .pf-dots { display: flex; } }
        .pf-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.4);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: width 0.25s ease, background 0.25s ease;
        }
        .pf-dot.is-active { background: var(--white); width: 22px; }

        @keyframes pf-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ---------- Form panel ---------- */
        .pf-panel {
          position: relative;
          background: var(--white);
          margin-top: -28px;
          border-radius: 26px 26px 0 0;
          padding: 34px 26px 40px;
          display: flex;
          flex-direction: column;
          z-index: 3;
        }
        @media (min-width: 880px) {
          .pf-panel {
            margin-top: 0;
            border-radius: 0;
            padding: 60px 64px;
            justify-content: center;
          }
        }

        .pf-panel h2 {
          font-weight: 700;
          color: var(--red);
          font-size: 30px;
          margin: 0 0 22px;
          animation: pf-rise 0.5s 0.1s ease both;
        }

        .pf-field {
          position: relative;
          margin-bottom: 16px;
          animation: pf-rise 0.5s ease both;
        }
        .pf-field:nth-of-type(1) { animation-delay: 0.15s; }
        .pf-field:nth-of-type(2) { animation-delay: 0.2s; }

        .pf-field svg.pf-icon-left {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #b9b3b1;
          pointer-events: none;
        }

        .pf-field input {
          width: 100%;
          height: 54px;
          border: 1.5px solid transparent;
          background: var(--mist);
          border-radius: 999px;
          padding: 0 46px 0 46px;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          font-size: 14.5px;
          color: var(--black);
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .pf-field input::placeholder { color: #a9a3a1; font-weight: 300; }
        .pf-field input:focus {
          border-color: var(--red);
          background: var(--white);
        }

        .pf-toggle-eye {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #b9b3b1;
          cursor: pointer;
          display: flex;
          padding: 4px;
        }
        .pf-toggle-eye:hover { color: var(--red-dark); }

        .pf-forgot {
          display: flex;
          justify-content: flex-end;
          margin: -4px 0 20px;
        }
        .pf-forgot a {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--red);
          text-decoration: none;
        }
        .pf-forgot a:hover { text-decoration: underline; }

        .pf-submit {
          width: 100%;
          height: 54px;
          border: none;
          border-radius: 999px;
          background: var(--red);
          color: var(--white);
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 14px 26px -12px rgba(255,14,24,0.55);
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
          animation: pf-rise 0.5s 0.25s ease both;
        }
        .pf-submit:hover { transform: translateY(-1px); box-shadow: 0 18px 30px -12px rgba(255,14,24,0.6); }
        .pf-submit:active { transform: translateY(0); }
        .pf-submit:disabled { opacity: 0.75; cursor: progress; }
        .pf-submit svg { transition: transform 0.2s ease; }
        .pf-submit:hover svg { transform: translateX(3px); }

        .pf-divider {
          height: 1px;
          background: #eee2e1;
          margin: 26px 0 18px;
          animation: pf-rise 0.5s 0.3s ease both;
        }

        .pf-help {
          text-align: center;
          font-size: 12.5px;
          font-weight: 300;
          color: #8c8683;
          animation: pf-rise 0.5s 0.35s ease both;
        }
        .pf-help b { font-weight: 500; color: #5f5b59; }
      `}</style>

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

          <form onSubmit={handleSubmit}>
            <div className="pf-field">
              <Mail size={18} className="pf-icon-left" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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

            <div className="pf-forgot">
              <a href="#forgot">Esqueci a senha</a>
            </div>

            <button className="pf-submit" type="submit" disabled={submitting}>
              {submitting ? "Entrando..." : "Login"}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="pf-divider" />
          <p className="pf-help">
            Não tem acesso? Fale com o seu <b>coordenador</b>
          </p>
        </section>
      </div>
    </div>
  );
}
