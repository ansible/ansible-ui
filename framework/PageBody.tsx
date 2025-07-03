import { CSSProperties, ReactNode } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
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
          }}
          className={usePadding ? 'border' : undefined}
        >
          {props.children}
        </div>
      </div>
    </ErrorBoundary>
  );
}
