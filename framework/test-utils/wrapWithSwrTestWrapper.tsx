import { createElement, type ComponentType, type ReactNode } from 'react';
import { SwrTestWrapper } from './swrTestWrapper';

export function wrapWithSwrTestWrapper(
  wrapper?: ComponentType<{ children: ReactNode }>
): ComponentType<{ children: ReactNode }> {
  if (!wrapper) {
    return SwrTestWrapper;
  }

  return function CombinedWrapper({ children }: Readonly<{ children: ReactNode }>) {
    return createElement(SwrTestWrapper, null, createElement(wrapper, null, children));
  };
}
