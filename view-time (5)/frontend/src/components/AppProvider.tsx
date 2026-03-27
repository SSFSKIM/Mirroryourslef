import { Toaster } from "@/components/ui/sonner";
import FirestoreInitializer from "./FirestoreInitializer";
import { GrainOverlay } from "./GrainOverlay";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <FirestoreInitializer>
      {children}
      <GrainOverlay />
      <Toaster position="top-right" richColors />
    </FirestoreInitializer>
  );
};
