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
                    src="https://static.databutton.com/public/82a95cff-29ca-4147-8b0f-4bde6152bdae/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202025-07-15%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%2012.24.44.png"
                    alt="Youtube Mirror Logo"
                    className="h-8 w-8 mr-2"
                  />
                  <span className="text-white text-lg font-semibold">
                    Youtube Mirror
                  </span>
                </div>
              </Link>
              <p className="text-sm mb-4">
                &copy; {new Date().getFullYear()} Youtube Mirror. All rights
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
