import { lazy, type ReactNode, Suspense } from "react";
import { createBrowserRouter, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { userRoutes } from "./user-routes";
import { AppProvider } from "components/AppProvider";

const SuspenseFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" role="status">
      <span className="sr-only">Loading page</span>
    </div>
  </div>
);

export const SuspenseWrapper = ({ children }: { children: ReactNode }) => {
  return <Suspense fallback={<SuspenseFallback />}>{children}</Suspense>;
};

const AnimatedOutlet = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Outlet key={location.pathname} />
    </AnimatePresence>
  );
};

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const SomethingWentWrongPage = lazy(
  () => import("./pages/SomethingWentWrongPage"),
);

export const router = createBrowserRouter(
  [
    {
      element: (
        <AppProvider>
          <SuspenseWrapper>
            <AnimatedOutlet />
          </SuspenseWrapper>
        </AppProvider>
      ),
      children: userRoutes
    },
    {
      path: "*",
      element: (
        <SuspenseWrapper>
          <NotFoundPage />
        </SuspenseWrapper>
      ),
      errorElement: (
        <SuspenseWrapper>
          <SomethingWentWrongPage />
        </SuspenseWrapper>
      ),
    },
  ]
);
