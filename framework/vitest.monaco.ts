import { vi } from 'vitest';

vi.mock('monaco-editor', () => ({
  json: {
    jsonDefaults: {
      setDiagnosticsOptions: vi.fn(),
    },
  },
  languages: {
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
