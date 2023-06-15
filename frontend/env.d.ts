/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AAP_MODE?: 'AAP' | 'AWX' | 'HUB' | 'EDA';
  readonly VITE_PRODUCT?: string;
  readonly VITE_BRAND?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
