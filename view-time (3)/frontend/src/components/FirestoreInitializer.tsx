import { useEffect } from "react";
import useDataStore from "../utils/dataStore";
import { processWatchHistory } from "../utils/watchHistory";
import { toast } from "sonner";
import { firebaseAuth } from "app";

interface Props {
  children: React.ReactNode;
}

/**
 * Component to initialize Firestore data and handle synchronization
 * This component ensures firestore data is properly loaded and synced with local storage
 */
export const FirestoreInitializer: React.FC<Props> = ({ children }) => {
  const { initializeAuth, user } = useDataStore();

  // Initialize auth and data store
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Process watch history when user is available
  useEffect(() => {
    const handleWatchHistory = async () => {
      if (!user) return;

      try {
        // Check for watch history in local storage
        const watchHistoryKey = `watch_history_${user.uid}`;
        const watchHistory = localStorage.getItem(watchHistoryKey);

        if (watchHistory) {
          const videos = JSON.parse(watchHistory);
          
          // Process watch history to Firestore
          if (videos.length > 0) {
            toast.info("Processing watch history data...");
            await processWatchHistory(user.uid, videos);
            toast.success(`Processed ${videos.length} videos from watch history`);
            
            // Uncomment to clear local storage after processing
            // localStorage.removeItem(watchHistoryKey);
          }
        }
      } catch (error) {
        console.error("Error processing watch history:", error);
        toast.error("Failed to process watch history data");
      }
    };

    handleWatchHistory();
  }, [user]);


  return <>{children}</>;
};

export default FirestoreInitializer;