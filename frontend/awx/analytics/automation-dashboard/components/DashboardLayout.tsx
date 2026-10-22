import { PageDashboardContext, Scrollable } from '@ansible/ansible-ui-framework';
import { Grid, GridItem } from '@patternfly/react-core';
import { useContext, type ReactNode } from 'react';

/**
 * Scrollable grid wrapper for a dashboard tab. The responsive column count is measured once by
 * `useDashboardGridColumns` in `AutomationDashboardMainPage` and provided through
 * `PageDashboardContext`, so switching tabs never re-measures and never flashes the grid.
 */
export function DashboardLayout(props: Readonly<{ children: (gridColumns: number) => ReactNode }>) {
  const { columns } = useContext(PageDashboardContext);

  return (
    <Scrollable marginLeft={20} marginRight={20} marginBottom={16} marginTop={16}>
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
      >
        {props.children(columns)}
      </div>
    </Scrollable>
  );
}

/**
 * A full-width row within a `DashboardLayout` grid: spans every column and lays its own children
 * out on a matching sub-grid. Reads the measured column count from `PageDashboardContext`.
 */
export function DashboardGridRow(props: Readonly<{ children: ReactNode }>) {
  const { columns } = useContext(PageDashboardContext);

  return (
    <GridItem style={{ gridColumn: `span ${columns}` }}>
      <Grid hasGutter style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {props.children}
      </Grid>
    </GridItem>
  );
}
