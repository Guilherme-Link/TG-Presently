import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API_BASE_URL = `https://${window.location.hostname}:8443`;

export function ProtectedRoute({ children, requiredRole }) {
  const [status, setStatus] = useState("checking"); // "checking" | "authorized" | "unauthorized"
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/security/v1/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Sessão inválida");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        localStorage.setItem("presently_auth", JSON.stringify(data));
        setStatus("authorized");
      })
      .catch(() => {
        localStorage.removeItem("presently_auth");
        setStatus("unauthorized");
      });
  }, []);

  if (status === "checking") {
    return <p>Carregando...</p>;
  }

  if (status === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !user.roles.includes(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}