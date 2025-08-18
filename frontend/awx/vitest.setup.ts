// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { mockI18n } from '@ansible/ansible-ui-framework/vitest.common';

mockI18n();

afterEach(() => cleanup());
