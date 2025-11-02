/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // tambahkan env variables lain di sini jika perlu
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
