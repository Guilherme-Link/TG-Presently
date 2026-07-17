import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PresentlyLogin from "./pages/PresentlyLogin.jsx";
import DashboardDesktop from "./pages/DashboardDesktop.jsx";
import DashboardMobile from "./pages/DashboardMobile.jsx";
import MarcarPresencaMobile from "./pages/MarcarPresencaMobile.jsx";
import MarcarPresencaDesktop from "./pages/MarcarPresencaDesktop.jsx";
import DashboardDesktopAdmin from "./pages/DashboardDesktopAdmin.jsx"
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

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
  return (
    <ResponsiveRoute
      mobileComponent={MarcarPresencaMobile}
      desktopComponent={MarcarPresencaDesktop}
    />
  );
}

function App() {

  return (
    <Routes>
      <Route path="/login" element={<PresentlyLogin />} />

      <Route path="/dashboard" element={<ProtectedRoute> <DashboardRoute /> </ProtectedRoute>} />

      <Route path="/dashboardAdmin" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><DashboardDesktopAdmin /></ProtectedRoute>} />

      <Route path="/presenca" element={<ProtectedRoute><PresencaRoute /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
