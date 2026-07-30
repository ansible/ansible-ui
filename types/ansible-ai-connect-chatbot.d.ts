/**
 * Type declarations for @ansible/ansible-ai-connect-chatbot
 *
 * The chatbot package's exports map doesn't include a "types" condition
 * and there's no .d.ts adjacent to the JS entry point. This ambient
 * declaration re-exports the types that do exist in the package so
 * moduleResolution: "bundler" can find them.
 */

declare module '@ansible/ansible-ai-connect-chatbot' {
  import type { FunctionComponent } from 'react';

  export const App: FunctionComponent<{ username?: string }>;
  export function getProductName(): string;
  export const LIGHTSPEED_LOGO: string;
  export const LIGHTSPEED_LOGO_DARK: string;
}
