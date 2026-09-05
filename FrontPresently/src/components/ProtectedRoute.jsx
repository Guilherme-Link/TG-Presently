import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../utils/api.js";

export function ProtectedRoute({ children, requiredRole }) {
  const [status, setStatus] = useState("checking"); // "checking" | "authorized" | "unauthorized"
  const [user, setUser] = useState(null);

  useEffect(() => {
    apiFetch("/security/v1/me", {
      method: "GET",
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
