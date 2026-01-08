import React, { useEffect } from "react";
import { Button } from "components/Button";
import { HeatMapPreview } from "components/HeatMapPreview";
import { DonutChartPreview } from "components/DonutChartPreview";
import { TopChannelsPreview } from "components/TopChannelsPreview";
import { AuthSection } from "components/AuthSection";
import { GoogleAuthButton } from "components/GoogleAuthButton";
import { AuthProvider } from "utils/AuthContext";
import useDataStore from "utils/dataStore";
import { firebaseApp } from "app";
import { getFirestore } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Toaster } from "sonner";

export default function App() {
  const { initializeAuth, user } = useDataStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Initialize Firebase on component mount
    import("utils/auth").then(() => {
      console.log("Firebase authentication initialized");
      
      // Initialize Firestore and auth listeners
      getFirestore(firebaseApp);
      initializeAuth();
    });
  }, [initializeAuth]);
  
  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <AuthProvider>
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/logo.png" alt="MirrorYourself Logo" className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold">MirrorYourself</h1>
          </div>
          <AuthSection />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Understand Your <span className="text-primary">YouTube</span> Habits
              </h2>
              <p className="text-lg text-muted-foreground">
                MirrorYourself provides detailed analytics on your YouTube watching behavior to help you better understand and optimize your screen time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <GoogleAuthButton variant="accent" size="xl" />
                <Button variant="outline" size="xl">
                  Learn more
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -z-10 top-0 right-0 w-72 h-72 bg-primary/10 blur-3xl rounded-full"></div>
              <div className="grid grid-cols-2 gap-4">
                <HeatMapPreview className="col-span-2" />
                <DonutChartPreview />
                <TopChannelsPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Gain insights into your YouTube watching habits with our powerful analytics tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Watch Time Dashboard</h3>
              <p className="text-muted-foreground">
                Visualize your viewing patterns with heat maps, channel rankings, and category distributions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 11V7a2 2 0 0 0-2-2h-9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h3v2h-1a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-1v-2h3a2 2 0 0 0 2-2Z" /><path d="M9 7 L9 11" /><path d="M9 9 L4 9 L4 15 L9 15" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Shorts Analytics</h3>
              <p className="text-muted-foreground">
                Track the impact of short-form content on your overall YouTube consumption habits.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Insights</h3>
              <p className="text-muted-foreground">
                Get personalized nudges and recommendations to build healthier viewing habits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-90"></div>
            <div className="relative z-10 text-primary-foreground max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to understand your YouTube habits?</h2>
              <p className="text-lg opacity-90 mb-6">
                Sign up now to get insights into your viewing patterns and take control of your screen time.
              </p>
              <GoogleAuthButton
                size="xl"
                className="bg-background text-foreground hover:bg-background/90"
                variant="default"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="/logo.png" alt="MirrorYourself Logo" className="h-6 w-6 mr-2" />
              <span className="font-semibold">MirrorYourself</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} MirrorYourself. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
    <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
