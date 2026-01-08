import { SignInOrUpForm } from "app";

export default function Login() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <img src="/logo.png" alt="MirrorYourself Logo" className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold">MirrorYourself</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">
              Sign in to access your YouTube analytics dashboard
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <SignInOrUpForm signInOptions={{ google: true }} />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MirrorYourself. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}