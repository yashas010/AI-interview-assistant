/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_GEMINI_MODEL: string;
  readonly VITE_AI_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}