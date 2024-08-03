import {
  ActionList,
  ActionListItem,
  Button,
  Flex,
  FlexItem,
  Stack,
  debounce,
} from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { SetRequired } from 'type-fest';
import { PageAsyncSelectOptionsFn } from './PageAsyncSelectOptions';
import { PageMultiSelect, PageMultiSelectProps } from './PageMultiSelect';
import { PageSelectOption } from './PageSelectOption';

export interface PageAsyncMultiSelectProps<ValueT>
  extends SetRequired<Omit<PageMultiSelectProps<ValueT>, 'options'>, 'queryLabel'> {
  /** The function to query for options. */
  queryOptions: PageAsyncSelectOptionsFn<ValueT>;

  /** The placeholder to show while querying. */
  queryPlaceholder?: string;

  /** The text to show if the query fails. */
  queryErrorText?: string | ((error: Error) => string);

  onBrowse?: () => void;

  compareOptionValues?: (a: ValueT, b: ValueT) => boolean;
}

/**
 * `PageAsyncMultiSelect` wraps the `PageMultiSelect` component to support asynchronously loading options from an async source such as an API.
 *
 * @param props The props for the component. See `PageMultiSelectProps` for details.
 *
 * @example
 * return (
 *   <PageAsyncMultiSelect
 *     placeholder="Select options"
 *     values={values}
 *     onSelect={setValues}
 *     queryOptions={async (page:number) => ({
 *       total: 1,
 *       options: [{ label: 'Option 1', value: 1 }]
 *     })}
 *   />
 * )
 */
export function PageAsyncMultiSelect<
  /** The type of the value of the select and of the options values. */
  ValueT,
>(props: PageAsyncMultiSelectProps<ValueT>) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<Error>();
  const [total, setTotal] = useState(0);
  const [options, setOptions] = useState<PageSelectOption<ValueT>[] | null>();
  const [open, setOpen] = useState(false);

  const nextRef = useRef<number | string | undefined>();
  const [searchValue, setSearchValue] = useState<string>('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setSearch = useCallback(
    debounce((search: string) => setSearchValue(search), 500),
    []
  );

  const queryOptions = useRef(props.queryOptions).current;

  const activeAbortController = useRef<AbortController | null>(null);
  const queryHandler = useCallback(() => {
    if (activeAbortController.current) {
      activeAbortController.current.abort();
    }
    const abortController = new AbortController();
    activeAbortController.current = abortController;
    setLoading(() => {
      setAllLoaded(false);
      setLoadingError(undefined);
      setOptions((prevOptions) => {
        if (prevOptions) {
          return prevOptions;
        } else {
          return undefined;
        }
      });
      void queryOptions({
        next: nextRef.current!,
        signal: abortController.signal,
        search: searchValue,
      })
        .then((result) => {
          if (abortController.signal.aborted) return;
          nextRef.current = result.next;
          if (!result.remaining) {
            setAllLoaded(true);
          }
          setOptions((prevOptions) => {
            if (abortController.signal.aborted) return prevOptions;
            let newOptions: PageSelectOption<ValueT>[] = [
              ...(prevOptions ?? []),
              ...result.options,
            ];
            const uniqueValues = new Set<ValueT>();
            newOptions = newOptions.filter((option) => {
              if (uniqueValues.has(option.value)) return false;
              uniqueValues.add(option.value);
              return true;
            });
            newOptions.sort((a, b) => {
              const lhs = a.label.toLowerCase();
              const rhs = b.label.toLowerCase();
              if (lhs < rhs) return -1;
              if (lhs > rhs) return 1;
              return 0;
            });
            setTotal(result.remaining + newOptions.length);
            return newOptions;
          });
        })
        .catch((err) => {
          if (abortController.signal.aborted) return;
          setLoadingError(err instanceof Error ? err : new Error(t('Unknown error')));
        })
        .finally(() => {
          if (abortController.signal.aborted) return;
          setLoading(false);
        });
      return true;
    });
    return () => abortController.abort();
  }, [queryOptions, searchValue, t]);

  const onLoadMore = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      queryHandler();
    },
    [queryHandler]
  );

  const onReset = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setTotal(0);
      setOptions([]);
      nextRef.current = undefined;
      queryHandler();
    },
    [queryHandler]
  );

  useEffect(() => {
    if (open) {
      setTotal(0);
      setOptions([]);
      nextRef.current = undefined;
      queryHandler();
    }
  }, [open, queryHandler]);

  const footer = (
    <Stack hasGutter>
      <Flex>
        <FlexItem grow={{ default: 'grow' }}>
          <ActionList>
            {props.onBrowse && (
              <ActionListItem>
                <Button
                  id="browse"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(false);
                    props.onBrowse?.();
                  }}
                >
                  {t('Browse')}
                </Button>
              </ActionListItem>
            )}
            {!allLoaded && (
              <ActionListItem>
                <Button
                  id="load-more"
                  isLoading={loading}
                  onClick={onLoadMore}
                  isDisabled={loading}
                >
                  {loading ? t('Loading...') : t('Load more')}
                </Button>
              </ActionListItem>
            )}
          </ActionList>
        </FlexItem>
        {!allLoaded && total !== 0 && (
          <FlexItem>
            {t('Loaded {{count}} of {{total}}', {
              count: options?.length ?? 0,
              total: total,
            })}
          </FlexItem>
        )}
      </Flex>
      {props.footer}
    </Stack>
  );

  if (loadingError) {
    return (
      <ButtonFullWidth
        id={props.id}
        variant="secondary"
        isDanger
        icon={<SyncAltIcon />}
        iconPosition="right"
        onClick={onReset}
      >
        {typeof props.queryErrorText === 'function'
          ? props.queryErrorText(loadingError)
          : props.queryErrorText ?? t('Error loading options')}
      </ButtonFullWidth>
    );
  }

  return (
    <PageMultiSelect
      id={props.id}
      icon={props.icon}
      placeholder={props.placeholder}
      options={options ?? []}
      values={props.values}
      onSelect={props.onSelect}
      variant={props.variant}
      footer={footer}
      open={open}
      setOpen={setOpen}
      searchValue={searchValue}
      setSearchValue={setSearch}
      isLoading={loading}
      disableClearSelection={props.disableClearSelection}
      disableClearChips={props.disableClearChips}
      queryLabel={props.queryLabel}
      compareOptionValues={props.compareOptionValues}
    />
  );
}

const ButtonFullWidth = styled(Button)`
  width: 100%;
  text-align: left;
`;
