import { Button, Flex, FlexItem, Spinner, Split, SplitItem, Stack } from '@patternfly/react-core';
import { SyncAltIcon } from '@patternfly/react-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageSelectOption } from './PageSelectOption';
import { PageSingleSelect, PageSingleSelectProps } from './PageSingleSelect';

export interface PageAsyncSingleSelectQueryResult<ValueT> {
  total: number;
  options: PageSelectOption<ValueT>[];
}

export interface PageAsyncSingleSelectProps<ValueT>
  extends Omit<PageSingleSelectProps<ValueT>, 'options'> {
  /** The function to query for options. */
  queryOptions: (
    page: number,
    signal: AbortSignal
  ) => Promise<PageAsyncSingleSelectQueryResult<ValueT>>;

  /** The placeholder to show while querying. */
  queryPlaceholder?: string;

  /** The placeholder to show if the query fails. */
  queryErrorText?: string | ((error: Error) => string);
}

/**
 * `PageAsyncSingleSelect` wraps the `PageSingleSelect` component to support asynchronously loading options from an async source such as an API.
 *
 * @param props The props for the component. See `PageSingleSelectProps` for details.
 *
 * @example
 * return (
 *   <PageAsyncSingleSelect
 *     placeholder="Select option"
 *     value={value}
 *     onSelect={setValue}
 *     queryOptions={async (page:number) => ({
 *       total: 1,
 *       options: [{ label: 'Option 1', value: 1 }]
 *     })}
 *   />
 * )
 */
export function PageAsyncSingleSelect<
  /** The type of the value of the select and of the options values. */
  ValueT
>(props: PageAsyncSingleSelectProps<ValueT>) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<Error>();
  const [total, setTotal] = useState(0);
  const [options, setOptions] = useState<PageSelectOption<ValueT>[] | null>();
  const [page, setPage] = useState(1);

  const abortController = useRef(new AbortController()).current;
  useEffect(() => () => abortController.abort(), [abortController]);

  const onSelect = useRef(props.onSelect).current;

  const queryOptions = useRef(props.queryOptions).current;

  const queryHandler = useCallback(
    (page: number) => {
      setLoading((loading) => {
        if (loading) return loading;
        setLoadingError(undefined);
        setOptions((prevOptions) => {
          if (prevOptions) {
            return prevOptions;
          } else {
            return undefined;
          }
        });
        try {
          void queryOptions(page, abortController.signal)
            .then((result) => {
              if (abortController.signal.aborted) return;
              setOptions((prevOptions) => {
                let newOptions: PageSelectOption<ValueT>[];
                if (prevOptions) {
                  newOptions = [...prevOptions, ...result.options];
                } else {
                  newOptions = result.options;
                }
                if (result.total === 1) {
                  onSelect(newOptions[0].value);
                }
                return newOptions;
              });
              setTotal(result.total);
            })
            .catch((err) => {
              if (abortController.signal.aborted) return;
              if (err instanceof Error) {
                setLoadingError(err);
              } else {
                setLoadingError(new Error(t('Unknown error')));
              }
            })
            .finally(() => {
              if (abortController.signal.aborted) return;
              setLoading(false);
            });
        } catch (err) {
          if (err instanceof Error) {
            setLoadingError(err);
          } else {
            setLoadingError(new Error(t('Unknown error')));
          }
          setLoading(false);
        }
        return true;
      });
    },
    [abortController.signal, onSelect, queryOptions, t]
  );

  useEffect(() => queryHandler(page), [page, queryHandler]);

  const footer = (
    <Stack hasGutter>
      {loading ? (
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
          <FlexItem>
            <Spinner size="md" />
          </FlexItem>
          <FlexItem>{t('Loading...')}</FlexItem>
        </Flex>
      ) : (
        <Split>
          <SplitItem isFilled>
            {options?.length !== total && (
              <Button
                variant="link"
                isInline
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPage((page) => page + 1);
                }}
                isSmall
              >
                {t('Load more')}
              </Button>
            )}
          </SplitItem>
          <SplitItem>
            {t('{{count}} of {{total}}', {
              count: options?.length ?? 0,
              total,
            })}
          </SplitItem>
        </Split>
      )}
      {props.footer}
    </Stack>
  );

  if (options) {
    return (
      <PageSingleSelect
        id={props.id}
        icon={props.icon}
        placeholder={props.placeholder}
        options={options ?? []}
        value={props.value}
        onSelect={props.onSelect}
        footer={footer}
      />
    );
  }

  if (loadingError) {
    return (
      <Button
        id={props.id}
        variant="secondary"
        isDanger
        icon={<SyncAltIcon />}
        iconPosition="right"
        onClick={(_e) => {
          setPage((page) => {
            if (page === 1) {
              queryHandler(1);
            }
            return 1;
          });
        }}
      >
        {typeof props.queryErrorText === 'function'
          ? props.queryErrorText(loadingError)
          : props.queryErrorText ?? t('Error loading options')}
      </Button>
    );
  }

  return (
    <Button id={props.id} variant="control" isLoading>
      {props.queryPlaceholder ?? t('Loading options...')}
    </Button>
  );
}
