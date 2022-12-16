/// <reference types="jest" />

import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () =>
          new Promise(() => {
            // do nothing.
          }),
      },
    };
  },
}));

window.alert = () => {
  // empty implementation for window.alert
};

jest.mock('p-limit', () => ({
  pLimit: jest.fn(),
}));

jest.mock('@react-hook/resize-observer', () => ({
  useResizeObserver: jest.fn(),
}));

jest.mock('@patternfly/react-tokens/dist/esm/global_breakpoint_2xl', () => ({
  value: '1450px',
}));

jest.mock('@patternfly/react-tokens/dist/esm/global_breakpoint_xl', () => ({
  value: '1200px',
}));

jest.mock('@patternfly/react-tokens/dist/esm/global_breakpoint_lg', () => ({
  value: '992px',
}));

jest.mock('@patternfly/react-tokens/dist/esm/global_breakpoint_md', () => ({
  value: '768px',
}));

jest.mock('@patternfly/react-tokens/dist/esm/global_breakpoint_sm', () => ({
  value: '576px',
}));

jest.mock('@patternfly/react-tokens/dist/esm/global_breakpoint_xs', () => ({
  value: '0',
}));
