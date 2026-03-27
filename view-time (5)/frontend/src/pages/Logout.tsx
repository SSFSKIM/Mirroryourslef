import { auth } from "app";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "components/LoadingSpinner";
import { AnimatedPage } from "components/AnimatedPage";
import { Atmosphere } from "components/Atmosphere";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    auth.signOut().then(() => {
      navigate("/", { replace: true });
    });
  }, [navigate]);

  return (
    <AnimatedPage>
      <div className="relative flex min-h-screen items-center justify-center bg-background">
        <Atmosphere variant="primary" size="md" />
        <div className="relative z-10 text-center space-y-4">
          <LoadingSpinner size="lg" label="Signing out" />
          <p className="text-muted-foreground">Signing out...</p>
        </div>
      </div>
    </AnimatedPage>
  );
}