// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import './vitest.i18n';
import './vitest.monaco';
import { enablePreview } from './vitest.preview';

enablePreview();
