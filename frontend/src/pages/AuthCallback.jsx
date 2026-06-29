import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { PageLoader, ErrorState } from "../components/ui";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { loginWithCode } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard React StrictMode double-invoke
    ran.current = true;

    const code = params.get("code");
    if (!code) {
      setError("No authorization code returned from GitHub.");
      return;
    }
    (async () => {
      try {
        const user = await loginWithCode(code);
        navigate(user.role === "creator" ? "/" : "/dashboard", { replace: true });
      } catch (e) {
        setError(e.response?.data?.detail || "Login failed. Please try again.");
      }
    })();
  }, [params, loginWithCode, navigate]);

  if (error) return <ErrorState message={error} />;
  return (
    <div className="mt-16 text-center">
      <PageLoader />
      <p className="mt-4 text-gray-500">Signing you in…</p>
    </div>
  );
}
