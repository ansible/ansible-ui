/* eslint-disable i18next/no-literal-string */
import { PageSection } from '@patternfly/react-core';
import useResizeObserver from '@react-hook/resize-observer';
import { ReactNode, createContext, useLayoutEffect, useRef, useState } from 'react';
import { Scrollable } from '../components/Scrollable';

export const PageDashboardContext = createContext({ columns: 1 });

const Divisor = 1662 / 12;

export function PageDashboard(props: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const [columns, setColumns] = useState(1);

  useLayoutEffect(() => {
    setColumns(Math.max(1, Math.floor((ref.current?.clientWidth ?? 0) / Divisor)));
  }, []);

  useResizeObserver(ref, (entry) => {
    setColumns(Math.max(1, Math.floor((entry.contentRect.width ?? 0) / Divisor)));
  });

  return (
    <PageDashboardContext.Provider value={{ columns }}>
      <Scrollable>
        <PageSection isWidthLimited>
          <div
            ref={ref}
            style={{ display: 'grid', gap: 16, gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {props.children}
          </div>
        </PageSection>
      </Scrollable>
    </PageDashboardContext.Provider>
  );
}
