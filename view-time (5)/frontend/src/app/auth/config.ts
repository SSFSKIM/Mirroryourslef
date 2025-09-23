import { z } from "zod";

const configSchema = z.object({
  signInOptions: z.object({
    google: z.coerce.boolean({
      description: "Enable Google sign-in",
    }),
    github: z.coerce.boolean({ description: "Enable GitHub sign-in" }),
    facebook: z.coerce.boolean({ description: "Enable Facebook sign-in" }),
    twitter: z.coerce.boolean({ description: "Enable Twitter sign-in" }),
    emailAndPassword: z.coerce.boolean({
      description: "Enable email and password sign-in",
    }),
    magicLink: z.coerce.boolean({
      description: "Enable magic link sign-in",
    }),
  }),
  siteName: z.string({
    description: "The name of the site",
  }),
  signInSuccessUrl: z.preprocess(
    (it) => it || "/",
    z.string({
      description: "The URL to redirect to after a successful sign-in",
    }),
  ),
  tosLink: z
    .string({
      description: "Link to the terms of service",
    })
    .optional(),
  privacyPolicyLink: z
    .string({
      description: "Link to the privacy policy",
    })
    .optional(),
  firebaseConfig: z.object(
    {
      apiKey: z.string().default(""),
      authDomain: z.string().default(""),
      projectId: z.string().default(""),
      storageBucket: z.string().default(""),
      messagingSenderId: z.string().default(""),
      appId: z.string().default(""),
    },
    {
      description:
        "Firebase config as as describe in https://firebase.google.com/docs/web/learn-more#config-object",
    },
  ),
});

type FirebaseExtensionConfig = z.infer<typeof configSchema>;

// This is set by vite.config.ts
declare const __FIREBASE_CONFIG__: string;

// Safely parse injected config; fall back to VITE_* vars if missing
let parsed: any = {};
try {
  // __FIREBASE_CONFIG__ is injected at build-time by Vite define().
  // When not provided it can be undefined/empty – guard to avoid JSON.parse errors.
  const raw = (typeof __FIREBASE_CONFIG__ === "string" && __FIREBASE_CONFIG__) || "{}";
  parsed = JSON.parse(raw) ?? {};
} catch (_e) {
  parsed = {};
}

// Build a firebaseConfig from VITE_* as a runtime fallback when extensions are not present.
// These are read at build time by Vite and inlined into the bundle.
type WithEnvMode = { env: Record<string, string | undefined> };
const viteEnv = (import.meta as unknown as WithEnvMode).env as Record<string, string | undefined>;

const fallbackFirebaseConfig = {
  apiKey: viteEnv.VITE_FIREBASE_API_KEY ?? "",
  authDomain: viteEnv.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: viteEnv.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: viteEnv.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: viteEnv.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: viteEnv.VITE_FIREBASE_APP_ID ?? "",
};

// Sensible defaults for optional extension fields so Zod validation doesn't fail
const extensionDefaults = {
  signInOptions: {
    google: true,
    github: false,
    facebook: false,
    twitter: false,
    emailAndPassword: false,
    magicLink: false,
  },
  siteName: "ViewTime",
  signInSuccessUrl: "/",
};

export const config: FirebaseExtensionConfig = configSchema.parse({
  ...extensionDefaults,
  ...(parsed ?? {}),
  firebaseConfig: {
    // Vite env values take precedence if provided at build time
    ...fallbackFirebaseConfig,
    ...(parsed?.firebaseConfig ?? {}),
  },
});
