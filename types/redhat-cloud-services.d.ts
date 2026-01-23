/**
 * Type declarations for @redhat-cloud-services packages
 *
 * These stubs provide type information for the CRC packages used by insights/.
 * At runtime on console.redhat.com, the actual implementations are provided
 * by the Chrome shell via Module Federation.
 *
 * We define minimal types inline rather than importing from @redhat-cloud-services/types
 * to avoid conflicts between different versions in the monorepo vs insights/node_modules.
 */

declare module '@redhat-cloud-services/types' {
  /** Minimal Chrome API type with just the methods we use */
  export interface ChromeAPI {
    identifyApp: (appId: string) => void;
    updateDocumentTitle: (title: string) => void;
    // Add other methods as needed
  }
}

declare module '@redhat-cloud-services/frontend-components/useChrome' {
  import type { ChromeAPI } from '@redhat-cloud-services/types';
  // eslint-disable-next-line no-restricted-exports
  export default function useChrome(): ChromeAPI;
}
