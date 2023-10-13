import {
  OnPerPageSelect,
  OnSetPage,
  Pagination,
  PaginationVariant,
  PerPageOptions,
} from '@patternfly/react-core';
import { CSSProperties, useCallback } from 'react';
import { useBreakpoint } from '../components/useBreakPoint';

export type PagePaginationProps = {
  itemCount?: number;
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  style?: CSSProperties;
  topBorder?: boolean;
  perPageOptions?: PerPageOptions[];
};

export function PagePagination(props: PagePaginationProps) {
  const { setPage, setPerPage } = props;
  const onSetPage = useCallback<OnSetPage>((_event, page) => setPage(page), [setPage]);
  const onPerPageSelect = useCallback<OnPerPageSelect>(
    (_event, perPage) => setPerPage(perPage),
    [setPerPage]
  );
  const compact = !useBreakpoint('md');

  return (
    <Pagination
      variant={PaginationVariant.bottom}
      itemCount={props.itemCount}
      page={props.page}
      perPage={props.perPage}
      onSetPage={onSetPage}
      onPerPageSelect={onPerPageSelect}
      perPageOptions={props.perPageOptions}
      style={{
        ...props.style,
        boxShadow: 'none',
        // ZIndex 400 is needed for PF table stick headers
        zIndex: 400,
        // marginTop: -1,
        paddingTop: compact ? 4 : 6,
        paddingBottom: compact ? 4 : 6,
        // borderTop: props.topBorder ? 'thin solid var(--pf-v5-global--BorderColor--100)' : undefined,
      }}
      className="border-top bg-lighten"
    />
  );
}
