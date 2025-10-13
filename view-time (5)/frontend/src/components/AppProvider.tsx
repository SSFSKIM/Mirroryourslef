import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import FirestoreInitializer from "./FirestoreInitializer";
import { Link } from "react-router-dom";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="dark">
      <FirestoreInitializer>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{children}</main>
          <footer className="bg-black text-gray-400 py-8 px-6">
            <div className="container mx-auto text-center">
              <Link to="/" className="no-underline">
                <div className="flex items-center justify-center mb-4">
                  <img
                    src="/logo.png"
                    alt="MirrorYourself Logo"
                    className="h-8 w-8 mr-2"
                  />
                  <span className="text-white text-lg font-semibold">
                    MirrorYourself
                  </span>
                </div>
              </Link>
              <p className="text-sm mb-4">
                &copy; {new Date().getFullYear()} MirrorYourself. All rights
                reserved.
              </p>
              <div className="text-sm">
                <Link to="/privacy-policy" className="hover:underline">
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="hover:underline ml-4">
                  Terms of Service
                </Link>
              </div>
            </div>
          </footer>
        </div>
        <Toaster position="top-right" richColors />
      </FirestoreInitializer>
    </ThemeProvider>
  );
};
