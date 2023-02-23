import { CSSProperties, ReactNode } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { useBreakpoint } from './components/useBreakPoint';
import { useFrameworkTranslations } from './useFrameworkTranslations';

export function PageBody(props: {
  children?: ReactNode;
  disablePadding?: boolean;
  style?: CSSProperties;
}) {
  const usePadding = useBreakpoint('xxl') && props.disablePadding !== true;
  const [translations] = useFrameworkTranslations();
  return (
    <ErrorBoundary message={translations.errorText}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
          backgroundColor: 'var(--pf-c-page__main-section--BackgroundColor)',
          ...props.style,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '100%',
            margin: usePadding ? 24 : 0,
            overflow: 'hidden',
            border: usePadding ? 'thin solid var(--pf-global--BorderColor--100)' : undefined,
            backgroundColor: 'var(--pf-global--BackgroundColor--100)',
          }}
        >
          {props.children}
        </div>
      </div>
    </ErrorBoundary>
  );
}
