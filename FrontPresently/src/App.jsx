import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PresentlyLogin from "./pages/PresentlyLogin.jsx";
import DashboardDesktop from "./pages/DashboardDesktop.jsx";
import DashboardMobile from "./pages/DashboardMobile.jsx";
import MarcarPresencaMobile from "./pages/MarcarPresencaMobile.jsx";
import MarcarPresencaDesktop from "./pages/MarcarPresencaDesktop.jsx";
import RelatorioDeFaltasAluno from "./pages/RelatorioDeFaltasAluno.jsx";
import GradeDeAulas from "./pages/GradeDeAulas.jsx";
import RelatorioDeFaltasAlunoMobile from "./pages/RelatorioDeFaltasAlunoMobile.jsx";
import GradeDeAulasMobile from "./pages/GradeDeAulasMobile.jsx";
import DashboardDesktopAdmin from "./pages/DashboardDesktopAdmin.jsx"
import GerenciarUsuarioDesktopAdmin from "./pages/GerenciarUsuarioDesktopAdmin.jsx"
import GerenciamentoDeSalas from "./pages/GerenciamentoDeSalas.jsx"
import GerenciamentoDeTerminais from "./pages/GerenciamentoDeTerminais.jsx";
import EventosAdminRoutes from "./pages/EventosAdminRoutes.jsx";
import VerificarPresenca from "./pages/VerificarPresenca.jsx";
import HistoricoDeEventos from "./pages/HistoricoDeEventos.jsx";
import ProfileAccount from "./pages/ProfileAccount.jsx";
import Tendencias from "./pages/Tendencias.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import PasskeyReminder from "./components/PasskeyReminder.jsx";

const MOBILE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

function detectUserDevice() {
  if (typeof window === "undefined") {
    return "desktop";
  }

  const userAgent = window.navigator.userAgent || "";
  const isMobileUserAgent = MOBILE_USER_AGENT_PATTERN.test(userAgent);
  const hasTouch = (window.navigator.maxTouchPoints || 0) > 0;
  const isLikelyIPad = hasTouch && /Macintosh|Mac OS X/i.test(userAgent);
  const hasFinePointer =
    window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false;
  const hasCoarsePointer =
    window.matchMedia?.("(hover: none) and (pointer: coarse)").matches ?? false;

  if (
    isMobileUserAgent ||
    isLikelyIPad ||
    (hasCoarsePointer && !hasFinePointer)
  ) {
    return "mobile";
  }

  if (hasTouch && !hasFinePointer) {
    return "mobile";
  }

  return "desktop";
}

function useUserDevice() {
  const [device, setDevice] = useState(detectUserDevice);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQueries = [
      window.matchMedia("(hover: hover) and (pointer: fine)"),
      window.matchMedia("(hover: none) and (pointer: coarse)"),
    ];
    const updateDevice = () => setDevice(detectUserDevice());

    mediaQueries.forEach((mediaQuery) => {
      mediaQuery.addEventListener("change", updateDevice);
    });

    return () => {
      mediaQueries.forEach((mediaQuery) => {
        mediaQuery.removeEventListener("change", updateDevice);
      });
    };
  }, []);

  return device;
}

function ResponsiveRoute({
  mobileComponent: MobileComponent,
  desktopComponent: DesktopComponent,
}) {
  const dashboardDevice = useUserDevice();
  const PageComponent =
    dashboardDevice === "mobile" ? MobileComponent : DesktopComponent;

  return <PageComponent />;
}

function DashboardRoute() {
  return (
    <ResponsiveRoute
      mobileComponent={DashboardMobile}
      desktopComponent={DashboardDesktop}
    />
  );
}

function PresencaRoute() {
  let isResponsible = false;

  try {
    const currentUser = JSON.parse(localStorage.getItem("presently_auth") ?? "null");
    isResponsible = currentUser?.roles?.includes("ROLE_RESPONSIBLE") ?? false;
  } catch {
    // A rota protegida atualizará os dados de autenticação antes de renderizar a página.
  }

  if (isResponsible) {
    return <VerificarPresenca />;
  }

  return (
    <ResponsiveRoute
      mobileComponent={MarcarPresencaMobile}
      desktopComponent={MarcarPresencaDesktop}
    />
  );
}

function RelatorioRoute() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("presently_auth") ?? "null");
    const hasHistoryAccess = currentUser?.roles?.some((role) =>
      role === "ROLE_ADMIN" || role === "ROLE_RESPONSIBLE"
    );

    if (hasHistoryAccess) {
      return <HistoricoDeEventos />;
    }
  } catch {
    // A rota protegida atualizará os dados de autenticação antes de renderizar a página.
  }

  return <ResponsiveRoute mobileComponent={RelatorioDeFaltasAlunoMobile} desktopComponent={RelatorioDeFaltasAluno} />;
}

function GradeRoute() {
  return <ResponsiveRoute mobileComponent={GradeDeAulasMobile} desktopComponent={GradeDeAulas} />;
}

function App() {

  return (
    <>
      <PasskeyReminder />
      <Routes>
        <Route path="/login" element={<PresentlyLogin />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRoute /></ProtectedRoute>} />
        <Route path="/dashboardAdmin" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><DashboardDesktopAdmin /></ProtectedRoute>} />
        <Route path="/tendencias" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><Tendencias /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><GerenciarUsuarioDesktopAdmin /></ProtectedRoute>} />
        <Route path="/salas" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><GerenciamentoDeSalas /></ProtectedRoute>} />
        <Route path="/terminais" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><GerenciamentoDeTerminais /></ProtectedRoute>} />
        <Route path="/eventos/*" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><EventosAdminRoutes /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><ProfileAccount /></ProtectedRoute>} />
        <Route path="/presenca" element={<ProtectedRoute><PresencaRoute /></ProtectedRoute>} />
        <Route path="/relatorio" element={<ProtectedRoute><RelatorioRoute /></ProtectedRoute>} />
        <Route path="/grade" element={<ProtectedRoute><GradeRoute /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
