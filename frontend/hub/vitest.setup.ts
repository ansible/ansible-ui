// vitest.setup.ts
import '@ansible/ansible-ui-framework/vitest.i18n';
import { enablePreview } from '@ansible/ansible-ui-framework/vitest.preview';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock monaco-editor to avoid resolution issues in tests
vi.mock('monaco-editor', () => ({
  languages: {
    json: {
      jsonDefaults: {
        setDiagnosticsOptions: vi.fn(),
      },
    },
    register: vi.fn(),
    setMonarchTokensProvider: vi.fn(),
  },
  editor: {
    create: vi.fn(),
    defineTheme: vi.fn(),
  },
}));
vi.mock('monaco-yaml', () => ({
  configureMonacoYaml: vi.fn(),
}));

enablePreview();
