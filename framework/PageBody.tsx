import { ReactNode } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { useBreakpoint } from './components/useBreakPoint';
import { useSettings } from './Settings';
import { useFrameworkTranslations } from './useFrameworkTranslations';

export function PageBody(props: { children?: ReactNode; disablePadding?: boolean }) {
  const usePadding = useBreakpoint('xxl') && props.disablePadding !== true;
  const settings = useSettings();
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
            border:
              settings.borders && usePadding
                ? 'thin solid var(--pf-global--BorderColor--100)'
                : undefined,
            backgroundColor: 'var(--pf-global--BackgroundColor--100)',
          }}
        >
          {props.children}
        </div>
      </div>
    </ErrorBoundary>
  );
}
