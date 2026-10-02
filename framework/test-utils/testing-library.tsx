import { render as rtlRender, renderHook as rtlRenderHook } from '@testing-library/react/pure';
import { wrapWithSwrTestWrapper } from './wrapWithSwrTestWrapper';

export * from '@testing-library/react/pure';

export function render(
  ui: Parameters<typeof rtlRender>[0],
  options?: Parameters<typeof rtlRender>[1]
) {
  return rtlRender(ui, {
    ...options,
    wrapper: wrapWithSwrTestWrapper(options?.wrapper),
  });
}

export function renderHook(
  render: Parameters<typeof rtlRenderHook>[0],
  options?: Parameters<typeof rtlRenderHook>[1]
) {
  return rtlRenderHook(render, {
    ...options,
    wrapper: wrapWithSwrTestWrapper(options?.wrapper),
  });
}
